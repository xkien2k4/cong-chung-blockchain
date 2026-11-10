/**
 * Utility cho các phép tính băm SHA-256 và định dạng hiển thị
 */

/**
 * Tính mã băm SHA-256 từ file bằng Web Crypto API
 * @param file Tập tin do người dùng chọn
 * @param onProgress Callback thông báo tiến độ (0 - 100%)
 */
export async function calculateFileSHA256(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ hashHex: string; rawHash: string }> {
  const chunkSize = 2 * 1024 * 1024; // 2MB chunking for smooth UI
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  if (file.size <= chunkSize || !onProgress) {
    const arrayBuffer = await file.arrayBuffer();
    if (onProgress) onProgress(50);
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    if (onProgress) onProgress(100);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const rawHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return {
      rawHash,
      hashHex: '0x' + rawHash,
    };
  }

  // Progressive reading for large files
  const reader = new FileReader();
  let currentChunk = 0;
  const fullBuffer = new Uint8Array(file.size);
  let offset = 0;

  return new Promise((resolve, reject) => {
    reader.onerror = () => reject(new Error("Lỗi khi đọc file"));
    reader.onload = async (e) => {
      if (e.target?.result) {
        const chunk = new Uint8Array(e.target.result as ArrayBuffer);
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
        currentChunk++;
        
        const progress = Math.min(Math.round((currentChunk / totalChunks) * 90), 90);
        if (onProgress) onProgress(progress);

        if (currentChunk < totalChunks) {
          readNextChunk();
        } else {
          const hashBuffer = await crypto.subtle.digest('SHA-256', fullBuffer.buffer);
          if (onProgress) onProgress(100);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const rawHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve({
            rawHash,
            hashHex: '0x' + rawHash,
          });
        }
      }
    };

    function readNextChunk() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);
      reader.readAsArrayBuffer(blob);
    }

    readNextChunk();
  });
}

/**
 * Định dạng dung lượng file theo KB/MB/GB
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Rút gọn chuỗi Hash hoặc Địa chỉ ví (VD: 0x1234...5678)
 */
export function truncateHash(hash: string, startChars = 6, endChars = 6): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Định dạng ngày giờ chuẩn Việt Nam
 */
export function formatDate(timestamp: number | string): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Giả lập CID v1 từ mã SHA-256 cho môi trường offline fallback
 */
export function generateDeterministicCID(rawHash: string): string {
  const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let cidSuffix = '';
  for (let i = 0; i < 48; i++) {
    const charCode = rawHash.charCodeAt(i % rawHash.length);
    cidSuffix += base32Chars[charCode % base32Chars.length];
  }
  return `bafybeig${cidSuffix}`;
}
