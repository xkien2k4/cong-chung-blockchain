import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Download, 
  Search, 
  Eye, 
  CheckCircle2, 
  RefreshCw,
  Globe,
  Layers,
  Sparkles,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { DocumentProof } from '../types';
import { formatDate, truncateHash, formatBytes } from '../services/hashUtils';
import { PUBLIC_IPFS_GATEWAYS, getIPFSFileUrl } from '../services/ipfs';

interface DocumentViewerProps {
  documents: DocumentProof[];
  onSelectDocumentForVerify: (docHash: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  onSelectDocumentForVerify,
  onCopyText,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentProof | null>(
    documents.length > 0 ? documents[0] : null
  );

  const [activeGatewayIndex, setActiveGatewayIndex] = useState<number>(0);
  const [filterSearch, setFilterSearch] = useState('');

  const currentGatewayUrl = PUBLIC_IPFS_GATEWAYS[activeGatewayIndex];

  const filteredDocs = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(filterSearch.toLowerCase()) ||
    doc.cid.toLowerCase().includes(filterSearch.toLowerCase()) ||
    doc.docHash.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const filePreviewInfo = selectedDoc ? getIPFSFileUrl(selectedDoc.cid) : null;

  // Determine if file is an image
  const isImage = selectedDoc && (
    selectedDoc.fileType.toLowerCase().includes('png') ||
    selectedDoc.fileType.toLowerCase().includes('jpeg') ||
    selectedDoc.fileType.toLowerCase().includes('jpg') ||
    selectedDoc.fileName.match(/\.(png|jpg|jpeg|gif|svg)$/i)
  );

  // Determine if file is a PDF
  const isPdf = selectedDoc && (
    selectedDoc.fileType.toLowerCase().includes('pdf') ||
    selectedDoc.fileName.toLowerCase().endsWith('.pdf')
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Eye className="w-7 h-7 text-blue-400" />
          <span>Xem Trực Tuyến Tài Liệu Đã Công Chứng</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Trình đọc nội dung tập tin trực tiếp từ IPFS Gateway kết hợp đóng dấu chứng nhận số Blockchain.
        </p>
      </div>

      {/* Main Grid: Document List Selector & Document Viewer Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Selector Panel (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Danh Sách Tài Liệu ({documents.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Chính chủ on-chain
            </span>
          </div>

          {/* Search filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Tìm theo tên file hoặc CID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Document List Items */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-850 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                      {doc.fileName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {formatBytes(doc.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>CID: {truncateHash(doc.cid, 4, 4)}</span>
                    <span className="text-emerald-400">Block #{doc.blockNumber}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Document Reader & Certification Overlay (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedDoc ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              {/* Document Title Header & Gateway Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      MỘC CHỨNG NHẬN SỐ
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDate(selectedDoc.timestamp)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {selectedDoc.fileName}
                  </h2>
                </div>

                {/* Gateway Selector Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <select
                    value={activeGatewayIndex}
                    onChange={(e) => setActiveGatewayIndex(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
                  >
                    {PUBLIC_IPFS_GATEWAYS.map((gw, idx) => (
                      <option key={gw} value={idx}>
                        Gateway #{idx + 1}: {new URL(gw).hostname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Digital Seal Watermark Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-950 to-indigo-950/40 border border-blue-500/30 shadow-inner flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      ĐÃ CHỨNG NHẬN VĨNH VIỄN TRÊN BLOCKCHAIN
                    </span>
                    <span className="text-slate-300 text-[11px] block mt-0.5 font-mono">
                      Ví công chứng: {truncateHash(selectedDoc.certifier, 6, 6)} · Block #{selectedDoc.blockNumber}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDocumentForVerify(selectedDoc.docHash)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Minh On-Chain</span>
                </button>
              </div>

              {/* Content Viewer Screen */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[380px] flex flex-col items-center justify-center p-4">
                
                {/* Case 1: Local Cache Data URL Image or Document */}
                {filePreviewInfo?.isLocalCache && isImage ? (
                  <div className="flex flex-col items-center space-y-3">
                    <img 
                      src={filePreviewInfo.url} 
                      alt={selectedDoc.fileName}
                      className="max-h-[420px] object-contain rounded-lg border border-slate-800 shadow-2xl"
                    />
                    <span className="text-[11px] text-emerald-400 font-mono">
                      ✓ Xem trước từ bộ nhớ tạm local IPFS cache
                    </span>
                  </div>
                ) : isPdf ? (
                  /* Case 2: PDF Reader Embed with Fallback & Direct Tab Launcher */
                  <div className="w-full h-[450px] flex flex-col items-center justify-between space-y-3 p-2">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentGatewayUrl + selectedDoc.cid)}&embedded=true`}
                      title={selectedDoc.fileName}
                      className="w-full flex-1 rounded-lg border border-slate-800 bg-slate-900"
                      onError={(e) => {
                        console.warn("Iframe preview error:", e);
                      }}
                    />
                    <div className="w-full flex items-center justify-between px-2 pt-1 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        Định dạng: Portable Document Format (.pdf)
                      </span>
                      <a
                        href={`${currentGatewayUrl}${selectedDoc.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở Xem Tab Mới IPFS</span>
                      </a>
                    </div>
                  </div>
                ) : isImage ? (
                  /* Case 3: Remote IPFS Image */
                  <div className="flex flex-col items-center space-y-3">
                    <img 
                      src={`${currentGatewayUrl}${selectedDoc.cid}`} 
                      alt={selectedDoc.fileName}
                      className="max-h-[420px] object-contain rounded-lg border border-slate-800 shadow-2xl"
                      onError={(e) => {
                        // Fallback to local cache if available or show card
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  /* Case 4: General File Preview Banner with Gateway Mirror Buttons */
                  <div className="text-center p-6 space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{selectedDoc.fileName}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Dung lượng: {formatBytes(selectedDoc.fileSize)} · Định dạng: {selectedDoc.fileType}
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={`${currentGatewayUrl}${selectedDoc.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mở Xem / Tải Về Từ IPFS Gateway</span>
                      </a>
                    </div>
                  </div>
                )}

              </div>

              {/* Technical Hash & CID Copy Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Mã SHA-256</span>
                    <span className="text-cyan-400 font-mono font-semibold block">{truncateHash(selectedDoc.docHash, 8, 8)}</span>
                  </div>
                  <button
                    onClick={() => onCopyText(selectedDoc.docHash, "Mã SHA-256")}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">IPFS CID</span>
                    <span className="text-blue-400 font-mono font-semibold block">{truncateHash(selectedDoc.cid, 8, 8)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onCopyText(selectedDoc.cid, "IPFS CID")}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`${currentGatewayUrl}${selectedDoc.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-slate-800 text-blue-400 cursor-pointer"
                      title="Mở IPFS Gateway"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 space-y-2">
              <Eye className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-sm">Chưa chọn tài liệu nào để xem.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
