import { create } from 'kubo-rpc-client';
import { generateDeterministicCID } from './hashUtils';
import { IPFSNodeStatus } from '../types';

// Các cổng IPFS Gateway công khai để xem tài liệu
export const PUBLIC_IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

type IPFSClientType = ReturnType<typeof create>;

// Cấu hình mặc định cho Kubo IPFS RPC
const DEFAULT_KUBO_RPC_URL = 'http://127.0.0.1:5001/api/v0';

let client: IPFSClientType | null = null;
let currentRpcUrl = DEFAULT_KUBO_RPC_URL;

// Khởi tạo IPFS HTTP Client từ kubo-rpc-client
export function initIPFSClient(rpcUrl: string = DEFAULT_KUBO_RPC_URL): IPFSClientType {
  currentRpcUrl = rpcUrl;
  try {
    client = create({ url: rpcUrl });
  } catch (error) {
    console.warn("Không thể khởi tạo kubo-rpc-client với URL:", rpcUrl, error);
    client = null;
  }
  return client!;
}

// Lấy RPC client hiện tại
function getClient(): IPFSClientType {
  if (!client) {
    initIPFSClient(currentRpcUrl);
  }
  return client!;
}

/**
 * Kiểm tra kết nối tới Kubo IPFS Node địa phương
 */
export async function checkIPFSConnection(rpcUrl: string = currentRpcUrl): Promise<IPFSNodeStatus> {
  try {
    const ipfs = create({ url: rpcUrl, timeout: 3000 });
    const id = await ipfs.id();
    const version = await ipfs.version();
    
    client = ipfs;
    currentRpcUrl = rpcUrl;

    return {
      isConnected: true,
      nodeUrl: rpcUrl,
      peerId: id.id.toString(),
      gatewayUrl: PUBLIC_IPFS_GATEWAYS[0],
      mode: 'KUBO_RPC',
      version: version.version,
    };
  } catch (err) {
    console.log("Kubo IPFS Node (127.0.0.1:5001) chưa sẵn sàng hoặc bị chặn CORS. Chuyển sang chế độ Fallback Sandbox Gateway.", err);
    return {
      isConnected: false,
      nodeUrl: rpcUrl,
      peerId: null,
      gatewayUrl: PUBLIC_IPFS_GATEWAYS[0],
      mode: 'GATEWAY_FALLBACK',
    };
  }
}

/**
 * Tải file lên IPFS thông qua kubo-rpc-client
 * Nếu Kubo node không chạy trên 127.0.0.1:5001, tự động fallback sang chế độ mô phỏng lưu trữ CID an toàn.
 */
export async function uploadToIPFS(
  file: File,
  rawHash: string,
  onProgress?: (progress: number) => void
): Promise<{ cid: string; isRealKubo: boolean; gatewayUrl: string }> {
  if (onProgress) onProgress(20);

  // Thử kết nối Kubo Node thực tế trước
  try {
    const ipfs = getClient();
    if (ipfs) {
      if (onProgress) onProgress(40);
      
      const fileBuffer = await file.arrayBuffer();
      
      // Đăng tải lên IPFS bằng kubo-rpc-client
      const added = await ipfs.add(
        {
          path: file.name,
          content: new Uint8Array(fileBuffer),
        },
        {
          pin: true, // Thực hiện Pin tài liệu
          progress: (bytes: number) => {
            if (onProgress && file.size > 0) {
              const p = Math.min(Math.round((bytes / file.size) * 50) + 40, 90);
              onProgress(p);
            }
          },
        }
      );

      if (onProgress) onProgress(100);

      const cidString = added.cid.toString();
      
      // Lưu Blob vào localStorage / Cache API để người dùng có thể xem/tải về xem trước
      await storeFileLocally(cidString, file);

      return {
        cid: cidString,
        isRealKubo: true,
        gatewayUrl: `${PUBLIC_IPFS_GATEWAYS[0]}${cidString}`,
      };
    }
  } catch (error) {
    console.warn("Lỗi khi kết nối Kubo RPC Node (127.0.0.1:5001):", error);
  }

  // Fallback: Sử dụng CID định danh nội dung tiêu chuẩn IPFS v1
  if (onProgress) onProgress(70);
  const fallbackCid = generateDeterministicCID(rawHash);
  await storeFileLocally(fallbackCid, file);

  if (onProgress) onProgress(100);

  return {
    cid: fallbackCid,
    isRealKubo: false,
    gatewayUrl: `${PUBLIC_IPFS_GATEWAYS[0]}${fallbackCid}`,
  };
}

/**
 * Lưu bộ nhớ tạm local cho file theo CID để xem trước/tải về ngay trên giao diện
 */
async function storeFileLocally(cid: string, file: File): Promise<void> {
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl && dataUrl.length < 5 * 1024 * 1024) { // Dưới 5MB lưu localStorage
        localStorage.setItem(`ipfs_preview_${cid}`, JSON.stringify({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
  } catch (e) {
    console.warn("Không thể lưu cache local:", e);
  }
}

/**
 * Lấy dữ liệu file xem trước nếu có từ cache local hoặc trả về IPFS Gateway URL
 */
export function getIPFSFileUrl(cid: string): { url: string; isLocalCache: boolean } {
  try {
    const cached = localStorage.getItem(`ipfs_preview_${cid}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.dataUrl) {
        return { url: parsed.dataUrl, isLocalCache: true };
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return { url: `${PUBLIC_IPFS_GATEWAYS[0]}${cid}`, isLocalCache: false };
}
