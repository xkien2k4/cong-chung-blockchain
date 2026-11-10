import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WalletState, DocumentProof, IPFSNodeStatus } from '../types';
import { calculateFileSHA256, formatBytes, truncateHash, formatDate } from '../services/hashUtils';
import { uploadToIPFS } from '../services/ipfs';
import { certifyDocumentOnChain } from '../services/blockchain';

interface CertifyDocumentProps {
  wallet: WalletState;
  ipfsStatus: IPFSNodeStatus;
  onCertifiedSuccess: (proof: DocumentProof) => void;
  onCopyText: (text: string, label: string) => void;
  onConnectWallet: () => void;
}

export const CertifyDocument: React.FC<CertifyDocumentProps> = ({
  wallet,
  ipfsStatus,
  onCertifiedSuccess,
  onCopyText,
  onConnectWallet,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Progress & Steps
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Select, 2: Hash & IPFS, 3: Blockchain Tx, 4: Complete
  const [hashProgress, setHashProgress] = useState(0);
  const [ipfsProgress, setIpfsProgress] = useState(0);
  const [txProgress, setTxProgress] = useState(0);
  
  // Computed values
  const [calculatedHash, setCalculatedHash] = useState<{ rawHash: string; hashHex: string } | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [certifiedResult, setCertifiedResult] = useState<DocumentProof | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword', 
      'image/png', 
      'image/jpeg', 
      'image/jpg'
    ];
    
    // Check extension fallback
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg'].includes(ext || '');

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setErrorMessage("Định dạng file không hỗ trợ. Vui lòng tải file PDF, DOCX, DOC, PNG, JPG.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB max
      setErrorMessage("Dung lượng file vượt quá 50MB.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setCalculatedHash(null);
    setIpfsCid(null);
    setCertifiedResult(null);
    setStep(1);
  };

  // Tiến hành Quy trình 3 bước Công Chứng
  const startCertificationProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStep(2);

    try {
      // 🟢 BƯỚC 1: Tính mã SHA-256
      setHashProgress(10);
      const hashResult = await calculateFileSHA256(selectedFile, (p) => setHashProgress(p));
      setCalculatedHash(hashResult);
      setHashProgress(100);

      // 🟢 BƯỚC 2: Tải lên IPFS qua kubo-rpc-client & Pin
      setIpfsProgress(10);
      const ipfsRes = await uploadToIPFS(selectedFile, hashResult.rawHash, (p) => setIpfsProgress(p));
      setIpfsCid(ipfsRes.cid);
      setIpfsProgress(100);

      // 🟢 BƯỚC 3: Ghi nhận Smart Contract Blockchain Sepolia
      setStep(3);
      setTxProgress(30);

      const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'DOCUMENT';
      const proof = await certifyDocumentOnChain(
        hashResult.hashHex,
        ipfsRes.cid,
        selectedFile.name,
        selectedFile.size,
        fileExt,
        wallet.address || undefined
      );

      setTxProgress(100);
      setCertifiedResult(proof);
      setStep(4);
      onCertifiedSuccess(proof);

      // Bắn pháo hoa ăn mừng
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err: any) {
      console.error("Lỗi công chứng:", err);
      setErrorMessage(err.message || "Xảy ra lỗi trong quá trình công chứng tài liệu.");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCalculatedHash(null);
    setIpfsCid(null);
    setCertifiedResult(null);
    setErrorMessage(null);
    setStep(1);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <ImageIcon className="w-8 h-8 text-cyan-400" />;
    if (['docx', 'doc'].includes(ext || '')) return <FileText className="w-8 h-8 text-blue-400" />;
    return <FileCode className="w-8 h-8 text-red-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-blue-500" />
          <span>Công Chứng Tài Liệu Số</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tạo mã băm SHA-256 bảo đảm tính toàn vẹn, lưu trữ lên IPFS và ghi nhận vĩnh viễn trên Ethereum Sepolia Blockchain.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-3 gap-3">
        
        <div className={`p-3.5 rounded-xl border transition-all ${
          step === 1 
            ? 'bg-blue-900/30 border-blue-500 text-blue-300' 
            : step > 1 
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' 
            : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-800 border flex items-center justify-center font-mono">1</span>
            <span>Tải Tài Liệu</span>
          </div>
          <span className="text-[11px] block mt-1 opacity-80">PDF, DOCX, DOC, PNG, JPG</span>
        </div>

        <div className={`p-3.5 rounded-xl border transition-all ${
          step === 2 
            ? 'bg-blue-900/30 border-blue-500 text-blue-300 animate-pulse' 
            : step > 2 
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' 
            : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-800 border flex items-center justify-center font-mono">2</span>
            <span>SHA-256 & IPFS</span>
          </div>
          <span className="text-[11px] block mt-1 opacity-80">Tính mã băm & Pin Kubo</span>
        </div>

        <div className={`p-3.5 rounded-xl border transition-all ${
          step === 3 
            ? 'bg-blue-900/30 border-blue-500 text-blue-300 animate-pulse' 
            : step === 4 
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' 
            : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-slate-800 border flex items-center justify-center font-mono">3</span>
            <span>Ghi Blockchain</span>
          </div>
          <span className="text-[11px] block mt-1 opacity-80">Giao dịch Sepolia</span>
        </div>

      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Không thể hoàn tất công chứng:</span>
            <span className="mt-0.5 block">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Step 1 & Step 2 Processing View */}
      {step < 4 && (
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          
          {/* File Dropzone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Kéo thả file vào đây hoặc <span className="text-blue-400 underline">chọn từ máy tính</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ định dạng PDF, DOCX, DOC, PNG, JPG (tối đa 50MB)
                </p>
              </div>
            </div>
          ) : (
            /* File Preview & Actions */
            <div className="space-y-6">
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Kích thước: {formatBytes(selectedFile.size)} · Loại: {selectedFile.type || 'N/A'}
                    </p>
                  </div>
                </div>

                {!isProcessing && (
                  <button
                    onClick={resetForm}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    Đổi file khác
                  </button>
                )}
              </div>

              {/* Real-time Progress Breakdown while processing */}
              {isProcessing && (
                <div className="space-y-4 p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                  
                  {/* Phase 1: SHA-256 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        1. Tính mã băm SHA-256 Web Crypto API
                      </span>
                      <span className="font-mono text-blue-400">{hashProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${hashProgress}%` }} />
                    </div>
                  </div>

                  {/* Phase 2: IPFS Kubo RPC */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        2. Tải & Pin lên IPFS Kubo Node (127.0.0.1:5001)
                      </span>
                      <span className="font-mono text-cyan-400">{ipfsProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${ipfsProgress}%` }} />
                    </div>
                  </div>

                  {/* Phase 3: Smart Contract */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        3. Đăng ký chứng nhận lên Smart Contract Ethereum Sepolia
                      </span>
                      <span className="font-mono text-emerald-400">{txProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${txProgress}%` }} />
                    </div>
                  </div>

                </div>
              )}

              {/* Submit Action Button */}
              {!isProcessing && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 font-mono">
                    Ví thực hiện: <span className="text-emerald-400 font-semibold">{wallet.address ? truncateHash(wallet.address, 6, 6) : 'Chế độ Demo Web3'}</span>
                  </div>
                  <button
                    onClick={startCertificationProcess}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Xác Nhận Công Chứng Tài Liệu</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Step 4: Success Result Modal / Receipt View */}
      {step === 4 && certifiedResult && (
        <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Công Chứng Thành Công!
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              Thông tin công chứng đã được ghi nhận bất biến lên Blockchain & lưu trữ IPFS.
            </p>
          </div>

          {/* Receipt Details Card */}
          <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Tên tài liệu:</span>
                <span className="text-white font-bold block truncate mt-0.5">{certifiedResult.fileName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Dung lượng & Loại:</span>
                <span className="text-slate-200 font-mono block mt-0.5">{formatBytes(certifiedResult.fileSize)} ({certifiedResult.fileType})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Thời gian công chứng:</span>
                <span className="text-slate-200 font-mono block mt-0.5">{formatDate(certifiedResult.timestamp)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Ví công chứng:</span>
                <span className="text-cyan-400 font-mono block mt-0.5">{truncateHash(certifiedResult.certifier, 8, 8)}</span>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* SHA-256 Hash Box */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Mã băm SHA-256 (32 bytes Hex):</span>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between break-all">
                <span>{certifiedResult.docHash}</span>
                <button
                  onClick={() => onCopyText(certifiedResult.docHash, "Mã SHA-256")}
                  className="ml-2 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                  title="Sao chép SHA-256"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* IPFS CID Box */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Mã định danh nội dung IPFS CID:</span>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-blue-300 flex items-center justify-between break-all">
                <span>{certifiedResult.cid}</span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onCopyText(certifiedResult.cid, "IPFS CID")}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="Sao chép CID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://ipfs.io/ipfs/${certifiedResult.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-slate-800 text-blue-400 cursor-pointer"
                    title="Xem trên IPFS Gateway"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Transaction Hash Box */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Mã giao dịch Blockchain (Tx Hash):</span>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center justify-between break-all">
                <span>{certifiedResult.transactionHash}</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${certifiedResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-slate-800 text-indigo-400 shrink-0 ml-2 cursor-pointer"
                  title="Xem trên Sepolia Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Công Chứng Tài Liệu Khác</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
