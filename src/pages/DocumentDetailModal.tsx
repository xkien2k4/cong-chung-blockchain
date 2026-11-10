import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  FileText,
  Search
} from 'lucide-react';
import { DocumentProof } from '../types';
import { formatDate, formatBytes } from '../services/hashUtils';
import { getIPFSFileUrl } from '../services/ipfs';

interface DocumentDetailModalProps {
  document: DocumentProof | null;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
  onVerifyDirectly: (hash: string) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onCopyText,
  onVerifyDirectly,
}) => {
  if (!document) return null;

  const filePreview = getIPFSFileUrl(document.cid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                HỒ SƠ CÔNG CHỨNG BLOCKCHAIN
              </span>
              <h2 className="text-lg font-bold text-white leading-tight mt-0.5">
                {document.fileName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tài liệu đã chứng nhận toàn vẹn 100%</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Block #{document.blockNumber}
          </span>
        </div>

        {/* Metadata Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-medium block">Ví người công chứng:</span>
            <span className="text-cyan-400 font-mono block mt-1 break-all">{document.certifier}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-medium block">Thời gian ghi nhận:</span>
            <span className="text-slate-200 font-mono block mt-1">{formatDate(document.timestamp)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-medium block">Dung lượng file:</span>
            <span className="text-slate-200 font-mono block mt-1">{formatBytes(document.fileSize)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-medium block">Mạng Blockchain:</span>
            <span className="text-indigo-400 font-mono block mt-1">{document.network}</span>
          </div>
        </div>

        {/* SHA-256 Hash Block */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-medium block">Mã băm SHA-256 (32 Bytes / 64 Hex):</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between break-all">
            <span>{document.docHash}</span>
            <button
              onClick={() => onCopyText(document.docHash, "Mã SHA-256")}
              className="ml-2 p-1 text-slate-500 hover:text-white shrink-0 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IPFS CID Block */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-medium block">Content Identifier IPFS CID:</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-blue-300 flex items-center justify-between break-all">
            <span>{document.cid}</span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => onCopyText(document.cid, "IPFS CID")}
                className="p-1 text-slate-500 hover:text-white cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={`https://ipfs.io/ipfs/${document.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Transaction Hash Block */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-medium block">Mã giao dịch Blockchain Tx Hash:</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center justify-between break-all">
            <span>{document.transactionHash}</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${document.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-indigo-400 hover:text-indigo-300 shrink-0 ml-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Preview / Image thumbnail if local cache exists */}
        {filePreview.isLocalCache && filePreview.url.startsWith('data:image') && (
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium block">Xem trước ảnh từ bộ nhớ tạm local IPFS:</span>
            <div className="max-h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
              <img src={filePreview.url} alt="IPFS Preview" className="max-h-44 object-contain rounded-lg" />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onVerifyDirectly(document.docHash);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Xác Minh Lại On-Chain</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>

    </div>
  );
};
