import React from 'react';
import { 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  totalCertifiedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  totalCertifiedCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      badge: null,
    },
    {
      id: 'certify',
      label: 'Công chứng tài liệu',
      badge: 'Tạo mới',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'verify',
      label: 'Xác minh tài liệu',
      badge: 'Kiểm tra',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'viewer',
      label: 'Xem tài liệu công chứng',
      badge: 'Trực tuyến',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'history',
      label: 'Lịch sử công chứng',
      badge: totalCertifiedCount.toString(),
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'manage',
      label: 'Quản lý tài liệu',
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      
      {/* Top Menu Links */}
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 tracking-wider uppercase">
            Hệ Thống Công Chứng
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Tech Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800/90 bg-gradient-to-br from-slate-900 to-slate-850">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Công Nghệ Sử Dụng</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
            <li className="flex items-center justify-between">
              <span>Băm:</span>
              <span className="text-slate-200">SHA-256</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Lưu trữ:</span>
              <span className="text-slate-200">Kubo IPFS</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Blockchain:</span>
              <span className="text-slate-200">Sepolia</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Contract:</span>
              <span className="text-slate-200">Solidity</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Bảo mật SHA-256 & IPFS</span>
        </div>
        <p className="text-[11px] leading-tight text-slate-500">
          Tài liệu mã hóa băm SHA-256 không bao giờ để lộ nội dung gốc lên Blockchain.
        </p>
      </div>

    </aside>
  );
};
