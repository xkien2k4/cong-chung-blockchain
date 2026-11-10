import React from 'react';
import { X, HelpCircle, ShieldCheck, Search, Eye, FilePlus, Wallet, Cpu } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hướng Dẫn Sử Dụng Hệ Thống</h2>
              <p className="text-xs text-slate-400">Các bước công chứng và xác minh tài liệu số bằng Blockchain & IPFS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Guide Steps */}
        <div className="space-y-4 text-xs leading-relaxed">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Wallet className="w-4 h-4" />
              <span>Bước 1: Kết nối ví MetaMask</span>
            </div>
            <p className="text-slate-400">
              Nhấn nút <strong>"Kết nối MetaMask"</strong> ở góc trên bên phải thanh tiêu đề. Nếu bạn đang ở mạng khác, ứng dụng sẽ nhắc chuyển sang mạng <strong>Ethereum Sepolia Testnet</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
              <FilePlus className="w-4 h-4" />
              <span>Bước 2: Công chứng tài liệu số</span>
            </div>
            <p className="text-slate-400">
              Vào menu <strong>"Công chứng tài liệu"</strong> → Chọn hoặc kéo thả file (PDF, DOCX, PNG, JPG). Hệ thống sẽ tự động:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 pl-2 font-mono">
              <li>1. Tính mã băm SHA-256 nguyên bản.</li>
              <li>2. Đăng tải file lên mạng lưu trữ phân tán IPFS (Kubo Node).</li>
              <li>3. Khởi tạo giao dịch ghi thông tin công chứng lên Smart Contract Sepolia.</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Search className="w-4 h-4" />
              <span>Bước 3: Xác minh tính toàn vẹn tài liệu</span>
            </div>
            <p className="text-slate-400">
              Vào menu <strong>"Xác minh tài liệu"</strong> → Tải file nghi vấn hoặc dán mã băm SHA-256. Ứng dụng sẽ đối chiếu với Blockchain và đưa ra kết luận:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Hợp lệ (Match 100%)</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">✕ Tài liệu đã bị chỉnh sửa</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">? Chưa công chứng</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
              <Eye className="w-4 h-4" />
              <span>Bước 4: Xem tài liệu trực tuyến & Đóng con dấu số</span>
            </div>
            <p className="text-slate-400">
              Vào menu <strong>"Xem tài liệu công chứng"</strong> để đọc trực tiếp file PDF/Hình ảnh từ IPFS Gateway kèm theo <strong>Mộc Chứng Nhận Số Blockchain</strong>.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
          >
            Đã Hiểu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
