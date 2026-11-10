import React, { useState, useRef } from 'react';
import { 
  Search, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  Copy, 
  ExternalLink, 
  RotateCcw,
  ShieldAlert,
  Cpu,
  Layers,
  Clock
} from 'lucide-react';
import { VerificationResult, DocumentProof } from '../types';
import { calculateFileSHA256, formatBytes, truncateHash, formatDate } from '../services/hashUtils';
import { verifyDocumentOnChain } from '../services/blockchain';

interface VerifyDocumentProps {
  onCopyText: (text: string, label: string) => void;
  onSelectDocument: (doc: DocumentProof) => void;
}

export const VerifyDocument: React.FC<VerifyDocumentProps> = ({
  onCopyText,
  onSelectDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualHash, setManualHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [hashProgress, setHashProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setManualHash('');
      setVerificationResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setManualHash('');
      setVerificationResult(null);
    }
  };

  // Tiến hành xác minh tài liệu
  const executeVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setHashProgress(20);

    try {
      let targetHash = manualHash.trim();

      if (selectedFile) {
        setHashProgress(50);
        const { hashHex } = await calculateFileSHA256(selectedFile, (p) => setHashProgress(p));
        targetHash = hashHex;
      }

      if (!targetHash) {
        throw new Error("Vui lòng tải file hoặc nhập mã băm SHA-256 để kiểm tra.");
      }

      setHashProgress(90);
      const res = await verifyDocumentOnChain(targetHash);
      setHashProgress(100);
      setVerificationResult(res);

    } catch (err: any) {
      console.error(err);
      setVerificationResult({
        status: 'NOT_FOUND',
        calculatedHash: manualHash || 'N/A',
        message: err.message || "Lỗi khi tra cứu mã băm.",
        verifiedAt: Date.now(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setManualHash('');
    setVerificationResult(null);
    setHashProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck className="w-7 h-7 text-emerald-400" />
          <span>Xác Minh Tính Toàn Vẹn Tài Liệu</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tải tài liệu cần kiểm tra hoặc nhập trực tiếp mã băm SHA-256 để đối chiếu với sổ cái Blockchain.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        
        {/* Dropzone or Manual Input Switch */}
        {!selectedFile ? (
          <div className="space-y-4">
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragOver 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Tải tài liệu cần đối chiếu tính toàn vẹn
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hệ thống sẽ tự động tính lại mã SHA-256 để so sánh với Blockchain
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <hr className="w-full border-slate-800" />
              <span className="absolute bg-slate-900 px-3 text-xs text-slate-500 font-mono">HOẶC TRA CỨU BẰNG MÃ</span>
            </div>

            {/* Manual Hash Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Nhập mã băm SHA-256 (64 ký tự Hex / 0x...):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  placeholder="Ví dụ: 0xa8b417e297893f12461df28531d2345e6912..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {manualHash && (
                  <button
                    onClick={() => setManualHash('')}
                    className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-300"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* File Selected Badge */
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedFile.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Dung lượng: {formatBytes(selectedFile.size)} · Định dạng: {selectedFile.type || 'N/A'}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium cursor-pointer"
            >
              Chọn file khác
            </button>
          </div>
        )}

        {/* Verification Progress Bar */}
        {isVerifying && (
          <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
                Đang tính SHA-256 & Tra cứu Smart Contract...
              </span>
              <span className="font-mono text-emerald-400">{hashProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${hashProgress}%` }} />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={executeVerification}
            disabled={isVerifying || (!selectedFile && !manualHash.trim())}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Xác Minh Ngay On-Chain</span>
          </button>
        </div>

      </div>

      {/* Verification Result Section */}
      {verificationResult && (
        <div className="space-y-6">
          
          {/* Result Banner: VALID */}
          {verificationResult.status === 'VALID' && verificationResult.matchedRecord && (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 shadow-xl space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    KẾT QUẢ XÁC MINH ON-CHAIN
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    TÀI LIỆU HỢP LỆ & CHÍNH XÁC 100%
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              {/* Certified Record Details */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-medium block">Tên tài liệu gốc:</span>
                    <span className="text-white font-bold block truncate mt-0.5">
                      {verificationResult.matchedRecord.fileName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Thời gian công chứng:</span>
                    <span className="text-slate-200 font-mono block mt-0.5">
                      {formatDate(verificationResult.matchedRecord.timestamp)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Ví người công chứng:</span>
                    <span className="text-cyan-400 font-mono block mt-0.5">
                      {verificationResult.matchedRecord.certifier}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Số khối Blockchain:</span>
                    <span className="text-slate-200 font-mono block mt-0.5">
                      Block #{verificationResult.matchedRecord.blockNumber}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* SHA-256 Match Box */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Mã băm SHA-256 trùng khớp:</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 break-all flex items-center justify-between">
                    <span>{verificationResult.calculatedHash}</span>
                    <button
                      onClick={() => onCopyText(verificationResult.calculatedHash, "Mã SHA-256")}
                      className="ml-2 text-slate-500 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* IPFS CID Box */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Mã CID IPFS:</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-blue-400 break-all flex items-center justify-between">
                    <span>{verificationResult.matchedRecord.cid}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCopyText(verificationResult.matchedRecord!.cid, "IPFS CID")}
                        className="text-slate-500 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`https://ipfs.io/ipfs/${verificationResult.matchedRecord.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onSelectDocument(verificationResult.matchedRecord!)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem Chi Tiết Hồ Sơ Đầy Đủ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* Result Banner: NOT_FOUND / UNREGISTERED */}
          {verificationResult.status === 'NOT_FOUND' && (
            <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    KẾT QUẢ XÁC MINH ON-CHAIN
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    TÀI LIỆU CHƯA ĐƯỢC CÔNG CHỨNG
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Mã băm SHA-256 của tài liệu này chưa có dữ liệu ghi nhận trên Smart Contract Ethereum Sepolia.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 font-medium block">Mã SHA-256 đã kiểm tra:</span>
                <span className="font-mono text-amber-300 break-all block">{verificationResult.calculatedHash}</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
