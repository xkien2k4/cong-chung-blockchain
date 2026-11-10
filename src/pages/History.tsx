import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Copy, 
  ExternalLink, 
  Download, 
  Filter, 
  FileCheck2, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { DocumentProof } from '../types';
import { formatDate, truncateHash, formatBytes } from '../services/hashUtils';

interface HistoryProps {
  documents: DocumentProof[];
  onSelectDocument: (doc: DocumentProof) => void;
  onCopyText: (text: string, label: string) => void;
}

export const History: React.FC<HistoryProps> = ({
  documents,
  onSelectDocument,
  onCopyText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('ALL');

  // Lọc danh sách tài liệu
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.cid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.certifier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      fileTypeFilter === 'ALL' || 
      doc.fileType.toUpperCase().includes(fileTypeFilter);

    return matchesSearch && matchesType;
  });

  // Xuất file báo cáo JSON
  const exportJSONReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredDocs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Bao_Cao_Cong_Chung_Blockchain_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-cyan-400" />
            <span>Lịch Sử Công Chứng</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Danh sách tất cả tài liệu đã ghi nhận bản quyền & tính toàn vẹn trên Blockchain.
          </p>
        </div>

        <button
          onClick={exportJSONReport}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Xuất Báo Cáo JSON</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên tài liệu, mã SHA-256, CID IPFS hoặc ví công chứng..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Format Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">Tất cả định dạng</option>
            <option value="PDF">PDF</option>
            <option value="DOC">Word (DOCX/DOC)</option>
            <option value="PNG">Hình ảnh (PNG/JPG)</option>
          </select>
        </div>

      </div>

      {/* Main History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <FileCheck2 className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-sm font-medium">Không tìm thấy tài liệu nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Tài Liệu</th>
                <th className="py-3 px-3">Mã SHA-256</th>
                <th className="py-3 px-3">IPFS CID</th>
                <th className="py-3 px-3">Ví Công Chứng</th>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  <td className="py-3.5 px-3 font-medium text-white max-w-[220px] truncate">
                    <span className="block truncate">{doc.fileName}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {formatBytes(doc.fileSize)}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-cyan-400">
                    <button
                      onClick={() => onCopyText(doc.docHash, "Mã SHA-256")}
                      className="hover:underline inline-flex items-center gap-1 cursor-pointer"
                      title={doc.docHash}
                    >
                      {truncateHash(doc.docHash, 6, 6)}
                      <Copy className="w-3 h-3 text-slate-500" />
                    </button>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-blue-400">
                    <a
                      href={`https://ipfs.io/ipfs/${doc.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline inline-flex items-center gap-1"
                      title={doc.cid}
                    >
                      {truncateHash(doc.cid, 6, 6)}
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-400">
                    {truncateHash(doc.certifier, 4, 4)}
                  </td>

                  <td className="py-3.5 px-3 text-slate-400">
                    {formatDate(doc.timestamp)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Chi Tiết
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
