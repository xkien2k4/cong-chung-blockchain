import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { CertifyDocument } from './pages/CertifyDocument';
import { VerifyDocument } from './pages/VerifyDocument';
import { History } from './pages/History';
import { ManageDocuments } from './pages/ManageDocuments';
import { DocumentViewer } from './pages/DocumentViewer';
import { DocumentDetailModal } from './pages/DocumentDetailModal';
import { UserGuideModal } from './components/UserGuideModal';
import { 
  WalletState, 
  IPFSNodeStatus, 
  DocumentProof, 
  DashboardStats 
} from './types';
import { 
  checkIPFSConnection 
} from './services/ipfs';
import { 
  connectWallet, 
  switchToSepoliaNetwork, 
  getLocalLedger, 
  getDashboardStats,
  isMetaMaskInstalled,
  SEPOLIA_CHAIN_ID
} from './services/blockchain';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: 'Chưa kết nối ví',
    balance: '0',
    isSepolia: false,
    error: null,
  });

  // IPFS Node Status
  const [ipfsStatus, setIpfsStatus] = useState<IPFSNodeStatus>({
    isConnected: false,
    nodeUrl: 'http://127.0.0.1:5001/api/v0',
    peerId: null,
    gatewayUrl: 'https://ipfs.io/ipfs/',
    mode: 'GATEWAY_FALLBACK',
  });

  // Certified Documents Ledger
  const [documents, setDocuments] = useState<DocumentProof[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCertified: 0,
    totalVerifications: 0,
    totalValid: 0,
    totalTransactions: 0,
    recentCertifications: [],
    monthlyStats: [],
  });

  // Modal & Toast State
  const [selectedDocumentModal, setSelectedDocumentModal] = useState<DocumentProof | null>(null);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data & check IPFS on mount
  useEffect(() => {
    refreshLocalData();
    checkIPFSHealth();

    // Check if MetaMask is already connected
    if (isMetaMaskInstalled()) {
      handleWalletConnect(true);

      // Listen for account / chain changes
      const ethereum = (window as any).ethereum;
      if (ethereum && ethereum.on) {
        ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            setWallet(prev => ({ ...prev, isConnected: false, address: null }));
          } else {
            handleWalletConnect(true);
          }
        });

        ethereum.on('chainChanged', () => {
          handleWalletConnect(true);
        });
      }
    }
  }, []);

  const refreshLocalData = () => {
    const ledger = getLocalLedger();
    setDocuments(ledger);
    const stats = getDashboardStats();
    setDashboardStats(stats);
  };

  const checkIPFSHealth = async () => {
    const status = await checkIPFSConnection();
    setIpfsStatus(status);
  };

  const handleWalletConnect = async (silent = false) => {
    try {
      const state = await connectWallet();
      setWallet(state);
      if (!silent) {
        showToast(`Đã kết nối ví thành công: ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`);
      }
    } catch (err: any) {
      if (!silent) {
        showToast(err.message || "Lỗi kết nối ví MetaMask.");
      }
    }
  };

  const handleSwitchNetwork = async () => {
    const success = await switchToSepoliaNetwork();
    if (success) {
      handleWalletConnect(true);
      showToast("Đã chuyển mạng sang Ethereum Sepolia Testnet!");
    } else {
      showToast("Không thể chuyển mạng. Vui lòng chọn Sepolia thủ công trên MetaMask.");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label} vào bộ nhớ tạm!`);
  };

  const handleNewCertifiedSuccess = (proof: DocumentProof) => {
    refreshLocalData();
    showToast("Công chứng tài liệu mới thành công!");
  };

  const handleVerifyDirectlyFromModal = (docHash: string) => {
    setActiveTab('verify');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-blue-500/50 shadow-2xl text-xs font-medium text-white flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        wallet={wallet}
        ipfsStatus={ipfsStatus}
        onConnectWallet={() => handleWalletConnect(false)}
        onSwitchNetwork={handleSwitchNetwork}
        onOpenViewer={() => setActiveTab('viewer')}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onRefreshIPFS={checkIPFSHealth}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          totalCertifiedCount={documents.length}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              ipfsStatus={ipfsStatus}
              onNavigate={setActiveTab}
              onSelectDocument={setSelectedDocumentModal}
              onCopyText={handleCopyText}
            />
          )}

          {activeTab === 'certify' && (
            <CertifyDocument
              wallet={wallet}
              ipfsStatus={ipfsStatus}
              onCertifiedSuccess={handleNewCertifiedSuccess}
              onCopyText={handleCopyText}
              onConnectWallet={() => handleWalletConnect(false)}
            />
          )}

          {activeTab === 'verify' && (
            <VerifyDocument
              onCopyText={handleCopyText}
              onSelectDocument={setSelectedDocumentModal}
            />
          )}

          {activeTab === 'viewer' && (
            <DocumentViewer
              documents={documents}
              onSelectDocumentForVerify={(hash) => setActiveTab('verify')}
              onCopyText={handleCopyText}
            />
          )}

          {activeTab === 'history' && (
            <History
              documents={documents}
              onSelectDocument={setSelectedDocumentModal}
              onCopyText={handleCopyText}
            />
          )}

          {activeTab === 'manage' && (
            <ManageDocuments
              documents={documents}
              onSelectDocument={setSelectedDocumentModal}
              onCopyText={handleCopyText}
            />
          )}
        </main>

      </div>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        document={selectedDocumentModal}
        onClose={() => setSelectedDocumentModal(null)}
        onCopyText={handleCopyText}
        onVerifyDirectly={handleVerifyDirectlyFromModal}
      />

      {/* Quick User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

    </div>
  );
}
