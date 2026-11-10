export interface DocumentProof {
  id: string;
  docHash: string;          // Hex string of SHA-256 with 0x prefix (32 bytes / 66 chars)
  cid: string;              // IPFS CID string (e.g. Qm... or bafy...)
  fileName: string;
  fileSize: number;         // Size in bytes
  fileType: string;         // MIME or extension (PDF, DOCX, PNG, etc.)
  certifier: string;        // Wallet address 0x...
  timestamp: number;        // Epoch seconds or ms
  blockNumber: number;      // Ethereum block number
  transactionHash: string;  // 0x...
  network: string;          // e.g. "Sepolia Testnet"
  isPinned: boolean;
}

export type VerificationStatus = 'VALID' | 'TAMPERED' | 'NOT_FOUND' | 'CHECKING';

export interface VerificationResult {
  status: VerificationStatus;
  calculatedHash: string;
  matchedRecord?: DocumentProof;
  message: string;
  verifiedAt: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  networkName: string;
  balance: string;
  isSepolia: boolean;
  error: string | null;
}

export interface IPFSNodeStatus {
  isConnected: boolean;
  nodeUrl: string;
  peerId: string | null;
  gatewayUrl: string;
  mode: 'KUBO_RPC' | 'GATEWAY_FALLBACK';
  version?: string;
}

export interface DashboardStats {
  totalCertified: number;
  totalVerifications: number;
  totalValid: number;
  totalTransactions: number;
  recentCertifications: DocumentProof[];
  monthlyStats: { name: string; count: number; verified: number }[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}
