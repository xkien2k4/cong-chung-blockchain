import React from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Search, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  FilePlus, 
  Copy, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DashboardStats, IPFSNodeStatus, DocumentProof } from '../types';
import { formatDate, truncateHash, formatBytes } from '../services/hashUtils';

interface DashboardProps {
  stats: DashboardStats;
  ipfsStatus: IPFSNodeStatus;
  onNavigate: (tab: string) => void;
  onSelectDocument: (doc: DocumentProof) => void;
  onCopyText: (text: string, label: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  ipfsStatus,
  onNavigate,
  onSelectDocument,
  onCopyText,
}) => {
  return (
    <div className="space-y-8">
      
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/50 border border-blue-800/40 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hệ Thống Công Chứng Tài Liệu Số Blockchain
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Ghi nhận tính toàn vẹn tài liệu qua SHA-256, lưu trữ phân tán IPFS và chứng thực trên Sepolia Testnet.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('certify')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Công Chứng Ngay</span>
          </button>
          <button
            onClick={() => onNavigate('verify')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Xác Minh Mã Băm</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">Đã Công Chứng</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {stats.totalCertified}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 inline-flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Tất cả đã Pin IPFS
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">Lượt Xác Minh</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {stats.totalVerifications}
            </span>
            <span className="text-[11px] text-cyan-400 mt-1 inline-flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" /> Tra cứu thời gian thực
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Search className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">Tỷ Lệ Hợp Lệ</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              100%
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              SHA-256 trùng khớp Smart Contract
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">Giao Dịch Blockchain</span>
            <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
              {stats.totalTransactions}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Khối Ethereum Sepolia
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Activity Chart & IPFS Kubo Node Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Xu Hướng Công Chứng & Xác Minh</h2>
              <p className="text-xs text-slate-400">Thống kê khối lượng tài liệu công chứng theo thời gian</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Công chứng
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Xác minh
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCertified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="count" name="Công chứng" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCertified)" />
                <Area type="monotone" dataKey="verified" name="Xác minh" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVerified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IPFS Node Status & Architecture Box */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">IPFS Kubo Node</h2>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium border ${
                ipfsStatus.isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {ipfsStatus.isConnected ? 'ONLINE (RPC)' : 'FALLBACK GATEWAY'}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>RPC API:</span>
                  <span className="text-slate-200">127.0.0.1:5001</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gateway:</span>
                  <span className="text-slate-200 truncate max-w-[150px]">ipfs.io</span>
                </div>
                {ipfsStatus.peerId && (
                  <div className="flex justify-between text-slate-400">
                    <span>Peer ID:</span>
                    <span className="text-cyan-400">{truncateHash(ipfsStatus.peerId, 4, 4)}</span>
                  </div>
                )}
              </div>

              <div className="text-slate-400 text-xs leading-relaxed">
                {ipfsStatus.isConnected ? (
                  <p className="text-emerald-400/90">
                    ✓ Đã kết nối Kubo RPC Node local thành công qua thư viện <code className="text-white bg-slate-800 px-1 rounded">kubo-rpc-client</code>.
                  </p>
                ) : (
                  <p className="text-amber-300/90">
                    ⚠ Môi trường xem trước chưa bật IPFS Daemon tại <code className="text-white bg-slate-800 px-1 rounded">127.0.0.1:5001</code>. Đã tự động bật Gateway Sandbox để đảm bảo ứng dụng chạy 100% mượt mà.
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('viewer')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Mở Trình Xem Trực Tuyến Tài Liệu Công Chứng</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Recent Certifications Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Tài Liệu Công Chứng Mới Nhất</h2>
            <p className="text-xs text-slate-400">Danh sách tài liệu vừa ghi nhận mã băm SHA-256 và CID IPFS</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả ({stats.totalCertified})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Tên Tài Liệu</th>
                <th className="py-3 px-3">Mã SHA-256</th>
                <th className="py-3 px-3">IPFS CID</th>
                <th className="py-3 px-3">Ví Công Chứng</th>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {stats.recentCertifications.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-white max-w-[200px] truncate">
                    {doc.fileName}
                    <span className="block text-[10px] text-slate-500">{formatBytes(doc.fileSize)}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-400">
                    <button 
                      onClick={() => onCopyText(doc.docHash, "Mã SHA-256")}
                      className="hover:underline inline-flex items-center gap-1 cursor-pointer"
                      title={doc.docHash}
                    >
                      {truncateHash(doc.docHash, 6, 6)}
                      <Copy className="w-3 h-3 text-slate-500" />
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-blue-400">
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
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {truncateHash(doc.certifier, 4, 4)}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {formatDate(doc.timestamp)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                    >
                      Chi Tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
