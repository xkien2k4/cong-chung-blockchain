import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  FileText, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  HardDrive,
  Grid,
  List
} from 'lucide-react';
import { DocumentProof } from '../types';
import { formatDate, truncateHash, formatBytes } from '../services/hashUtils';

interface ManageDocumentsProps {
  documents: DocumentProof[];
  onSelectDocument: (doc: DocumentProof) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ManageDocuments: React.FC<ManageDocumentsProps> = ({
  documents,
  onSelectDocument,
  onCopyText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  const filtered = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.docHash.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (category === 'ALL') return matchesSearch;
    if (category === 'PDF') return matchesSearch && doc.fileName.toLowerCase().endsWith('.pdf');
    if (category === 'DOC') return matchesSearch && (doc.fileName.toLowerCase().endsWith('.docx') || doc.fileName.toLowerCase().endsWith('.doc'));
    if (category === 'IMG') return matchesSearch && (doc.fileName.toLowerCase().endsWith('.png') || doc.fileName.toLowerCase().endsWith('.jpg'));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-indigo-400" />
            <span>Quản Lý Danh Mục Tài Liệu</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Phân loại, tra cứu mã CID IPFS và hồ sơ chứng nhận thuộc quyền quản lý.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('GRID')}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'GRID' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'LIST' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'Tất cả tài liệu' },
          { id: 'PDF', label: 'Tài liệu PDF' },
          { id: 'DOC', label: 'Văn bản Word' },
          { id: 'IMG', label: 'Hình ảnh & Bản vẽ' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              category === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div 
              key={doc.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    Đã Pin IPFS
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {doc.fileName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatBytes(doc.fileSize)} · {formatDate(doc.timestamp)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>SHA-256:</span>
                    <span className="text-cyan-400">{truncateHash(doc.docHash, 5, 5)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>CID:</span>
                    <span className="text-blue-400">{truncateHash(doc.cid, 5, 5)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`https://ipfs.io/ipfs/${doc.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>IPFS Node</span>
                </a>

                <button
                  onClick={() => onSelectDocument(doc)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Xem Hồ Sơ
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-850 border border-slate-800 flex items-center justify-between gap-4 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">{doc.fileName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SHA-256: {truncateHash(doc.docHash, 8, 8)} · {formatDate(doc.timestamp)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectDocument(doc)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium cursor-pointer"
              >
                Chi Tiết
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
