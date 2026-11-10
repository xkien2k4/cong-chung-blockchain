# HỆ THỐNG CÔNG CHỨNG TÀI LIỆU SỐ BẰNG BLOCKCHAIN VÀ IPFS

Hệ thống ứng dụng Web3 chuyên dụng cho phép công chứng, lưu trữ phân tán và xác minh tính toàn vẹn của các tài liệu số (PDF, DOCX, DOC, PNG, JPG) bằng mã băm **SHA-256**, mạng lưu trữ **IPFS (Kubo Node)** và Smart Contract trên **Ethereum Sepolia Testnet**.

---

## 🚀 TÍNH NĂNG CHÍNH

1. **Công chứng tài liệu số**:
   - Tính mã băm SHA-256 nguyên bản từ tập tin bằng Web Crypto API.
   - Tải và Pin tài liệu lên mạng lưu trữ phân tán IPFS qua thư viện `kubo-rpc-client`.
   - Ghi nhận thông tin công chứng (Mã SHA-256, CID, Địa chỉ ví, Thời gian) vĩnh viễn trên Smart Contract Ethereum Sepolia.

2. **Xác minh tính toàn vẹn tài liệu**:
   - Tải tài liệu cần kiểm tra hoặc nhập mã SHA-256 để đối chiếu thời gian thực trên Blockchain.
   - Phát hiện chính xác tài liệu **Hợp lệ (100% trùng khớp)**, **Đã bị thay đổi/chỉnh sửa** hoặc **Chưa từng được công chứng**.

3. **Trình xem tài liệu công chứng (Document Viewer)**:
   - Xem nội dung trực tuyến file PDF, hình ảnh, văn bản được tải từ IPFS Gateway (`ipfs.io`, `pinata.cloud`, `dweb.link`).
   - Hiển thị dấu mộc chứng nhận số, địa chỉ ví công chứng và thông tin giao dịch đi kèm.

4. **Lịch sử & Quản lý tài liệu**:
   - Tra cứu, lọc theo định dạng, sao chép mã CID/Tx Hash.
   - Xuất báo cáo danh sách công chứng dạng JSON.

5. **Kết nối ví MetaMask**:
   - Tự động nhận diện mạng, hỗ trợ 1-click chuyển đổi sang mạng Ethereum Sepolia Testnet.

---

## 🛠 HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI HỆ THỐNG (WINDOWS)

### 1. Cài đặt & Chạy Kubo IPFS Node địa phương (127.0.0.1:5001)

Để ứng dụng web có thể tải tài liệu trực tiếp lên IPFS qua `kubo-rpc-client`, bạn cần khởi chạy Kubo IPFS Daemon trên máy tính:

1. **Tải Kubo CLI**:
   - Truy cập [Kubo IPFS Releases](https://github.com/ipfs/kubo/releases) và tải bản `kubo_vX.XX.X_windows-amd64.zip`.
2. **Giải nén**:
   - Giải nén file vào thư mục `C:\ipfs`.
3. **Mở Command Prompt (cmd) hoặc PowerShell với quyền Administrator**:
   ```bash
   # Khởi tạo repository dữ liệu IPFS
   ipfs init

   # Cấu hình mở CORS cho cổng RPC API 5001 (cho phép trình duyệt truy cập)
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"

   # Khởi chạy Daemon
   ipfs daemon
   ```
4. Khi xuất hiện thông báo `Daemon is ready`, Kubo RPC API đã chạy thành công tại `http://127.0.0.1:5001`.

---

### 2. Triển khai Smart Contract Solidity lên Ethereum Sepolia Testnet

Mã nguồn Smart Contract nằm tại: `contracts/DocumentNotary.sol`

#### Cách 1: Triển khai nhanh bằng Remix Ethereum IDE (Khuyên dùng)
1. Truy cập [Remix Ethereum IDE](https://remix.ethereum.org).
2. Tạo file mới `DocumentNotary.sol` và sao chép nội dung từ `contracts/DocumentNotary.sol`.
3. Tại tab **Solidity Compiler**, chọn phiên bản Compiler `0.8.20` trở lên và nhấn **Compile DocumentNotary.sol**.
4. Tại tab **Deploy & Run Transactions**:
   - Chọn **Environment**: `Injected Provider - MetaMask`.
   - Kết nối MetaMask với mạng **Ethereum Sepolia Testnet**.
   - Nhấn **Deploy** và xác nhận giao dịch trên ví MetaMask.
5. Sao chép **Địa chỉ Contract vừa triển khai** (ví dụ: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`).

#### Cách 2: Triển khai bằng Hardhat CLI
```bash
# Biên dịch hợp đồng
npx hardhat compile

# Triển khai lên Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

---

### 3. Lấy ETH Sepolia Testnet miễn phí (Faucet)

Để thực hiện giao dịch trên Sepolia, bạn cần một ít ETH testnet làm phí gas:
- [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

---

### 4. Chạy Ứng Dụng Web (Frontend)

1. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

2. **Cấu hình môi trường (Tùy chọn)**:
   - Tạo file `.env` từ `.env.example` và cập nhật địa chỉ Contract Sepolia nếu bạn tự triển khai contract riêng:
     ```env
     VITE_CONTRACT_ADDRESS="0x_DIA_CHI_CONTRACT_CUA_BAN"
     ```

3. **Khởi chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   - Mở trình duyệt tại `http://localhost:3000`.

---

## 📁 CẤU TRÚC MÃ NGUỒN

```
/
├── contracts/
│   └── DocumentNotary.sol      # Smart Contract Solidity công chứng tài liệu
├── scripts/
│   └── deploy.ts               # Script triển khai hợp đồng
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Thanh tiêu đề, kết nối ví MetaMask & IPFS status
│   │   └── Sidebar.tsx         # Menu hệ thống
│   ├── pages/
│   ├── Dashboard.tsx           # Bảng điều khiển & thống kê KPI
│   ├── CertifyDocument.tsx     # Chức năng tải file, tính SHA-256, upload IPFS & công chứng
│   ├── VerifyDocument.tsx      # Chức năng xác minh tài liệu on-chain
│   ├── DocumentViewer.tsx      # Trình xem trực tuyến nội dung tài liệu đã công chứng từ IPFS
│   ├── History.tsx             # Lịch sử công chứng & xuất báo cáo JSON
│   ├── ManageDocuments.tsx     # Quản lý & phân loại tài liệu
│   └── DocumentDetailModal.tsx # Modal xem chi tiết hồ sơ chứng nhận
│   ├── services/
│   │   ├── hashUtils.ts        # Hàm tính SHA-256 Web Crypto API
│   │   ├── ipfs.ts             # Tích hợp kubo-rpc-client kết nối Kubo IPFS Node
│   │   └── blockchain.ts       # Kết nối Ethers.js, MetaMask & Smart Contract
│   ├── types/
│   │   └── index.ts            # Định nghĩa kiểu dữ liệu TypeScript
│   ├── App.tsx                 # Thành phần điều phối chính
│   └── main.tsx
├── package.json
└── README.md
```

---

## 🔒 BẢO MẬT & QUYỀN RIÊNG TƯ
- **Không tiết lộ nội dung bí mật**: Chỉ có mã băm cryptographic **SHA-256** được lưu trên Blockchain. Nội dung gốc của tài liệu nằm trên IPFS và có thể truy cập bằng mã CID duy nhất.
- **Tính bất biến**: Một khi thông tin công chứng đã ghi nhận lên Blockchain, không ai (kể cả quản trị viên) có thể sửa đổi hoặc xóa bỏ bản ghi.
