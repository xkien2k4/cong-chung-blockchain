import React from 'react';
import { Wallet, ShieldCheck, Cpu, RefreshCw, AlertTriangle, Eye, HelpCircle } from 'lucide-react';
import { WalletState, IPFSNodeStatus } from '../types';

interface HeaderProps {
  wallet: WalletState;
  ipfsStatus: IPFSNodeStatus;
  onConnectWallet: () => void;
  onSwitchNetwork: () => void;
  onOpenViewer: () => void;
  onOpenUserGuide?: () => void;
  onRefreshIPFS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  ipfsStatus,
  onConnectWallet,
  onSwitchNetwork,
  onOpenViewer,
  onOpenUserGuide,
  onRefreshIPFS,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3">
      <div className="flex items-center justify-between gap-8 max-w-7xl mx-auto">
        
        {/* Zone 1: Wordmark / Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
              Công Chứng Số <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 ml-1">Web3</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              Ethereum Sepolia · IPFS Kubo Node
            </span>
          </div>
        </div>

        {/* Zone 2: System Live Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
          
          {/* IPFS Kubo RPC Status */}
          <button 
            onClick={onRefreshIPFS}
            title="Bấm để kiểm tra lại kết nối Kubo IPFS Node (127.0.0.1:5001)"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              ipfsStatus.isConnected
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/50'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-400 hover:bg-amber-900/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              IPFS Kubo: {ipfsStatus.isConnected ? 'Đã kết nối (5001)' : 'Gateway Fallback'}
            </span>
            <RefreshCw className="w-3 h-3 ml-1 opacity-70 hover:rotate-180 transition-transform" />
          </button>

          {/* Network Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
            wallet.isSepolia
              ? 'bg-blue-950/40 border-blue-800/50 text-blue-300'
              : wallet.isConnected
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              wallet.isSepolia ? 'bg-blue-400' : wallet.isConnected ? 'bg-amber-400' : 'bg-slate-500'
            }`} />
            <span>{wallet.networkName || 'Chưa kết nối ví'}</span>
          </div>
        </div>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* User Guide Quick Button */}
          {onOpenUserGuide && (
            <button
              onClick={onOpenUserGuide}
              title="Xem hướng dẫn sử dụng nhanh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Document Viewer Quick Button */}
          <button
            onClick={onOpenViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Xem Tài Liệu</span>
          </button>

          {/* Wallet Connection Button */}
          {wallet.isConnected && wallet.address ? (
            <div className="flex items-center gap-2">
              {!wallet.isSepolia && (
                <button
                  onClick={onSwitchNetwork}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-colors animate-pulse"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Đổi sang Sepolia</span>
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
                <span className="text-slate-500 hidden md:inline">({wallet.balance} ETH)</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Kết nối MetaMask</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
