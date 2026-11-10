// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentNotary
 * @dev Smart Contract cho hệ thống công chứng tài liệu số bằng Blockchain.
 * Lưu trữ mã băm SHA-256, mã CID IPFS, địa chỉ ví người đăng ký và thời gian công chứng.
 */
contract DocumentNotary {
    
    // Cấu trúc dữ liệu chứng nhận tài liệu
    struct DocumentProof {
        bytes32 docHash;       // Mã băm SHA-256 của tài liệu (32 bytes)
        string cid;            // Content Identifier (CID) lưu trên IPFS
        string fileName;       // Tên tài liệu
        uint256 fileSize;      // Dung lượng file (bytes)
        string fileType;       // Định dạng file (PDF, DOCX, PNG, v.v.)
        address certifier;     // Địa chỉ ví thực hiện công chứng
        uint256 timestamp;     // Thời gian ghi nhận công chứng (Unix timestamp)
        uint256 blockNumber;   // Số khối trên Blockchain
        bool exists;           // Cờ xác nhận tồn tại
    }

    // Mapping lưu trữ danh sách chứng nhận theo mã SHA-256
    mapping(bytes32 => DocumentProof) private documents;

    // Danh sách tất cả các mã băm đã được đăng ký (dùng cho truy vấn danh sách)
    bytes32[] private registeredHashes;

    // Sự kiện khi tài liệu mới được công chứng thành công
    event DocumentCertified(
        bytes32 indexed docHash,
        string cid,
        string fileName,
        address indexed certifier,
        uint256 timestamp,
        uint256 blockNumber
    );

    // Modifier kiểm tra tính hợp lệ của mã băm
    modifier validHash(bytes32 _docHash) {
        require(_docHash != bytes32(0), "Ma bam SHA-256 khong hop le");
        _;
    }

    /**
     * @dev Đăng ký công chứng tài liệu mới lên Blockchain
     * @param _docHash Mã băm SHA-256 của tài liệu (bytes32)
     * @param _cid Mã CID nhận được từ IPFS
     * @param _fileName Tên tập tin
     * @param _fileSize Kích thước tập tin (bytes)
     * @param _fileType Định dạng loại tập tin
     */
    function certifyDocument(
        bytes32 _docHash,
        string memory _cid,
        string memory _fileName,
        uint256 _fileSize,
        string memory _fileType
    ) public validHash(_docHash) returns (bool) {
        require(!documents[_docHash].exists, "Tai lieu da duoc cong chung truoc do tren Blockchain");
        require(bytes(_cid).length > 0, "Ma IPFS CID khong duoc de rong");

        // Tạo bản ghi chứng nhận
        documents[_docHash] = DocumentProof({
            docHash: _docHash,
            cid: _cid,
            fileName: _fileName,
            fileSize: _fileSize,
            fileType: _fileType,
            certifier: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true
        });

        registeredHashes.push(_docHash);

        // Phát sự kiện lên Blockchain
        emit DocumentCertified(
            _docHash,
            _cid,
            _fileName,
            msg.sender,
            block.timestamp,
            block.number
        );

        return true;
    }

    /**
     * @dev Xác minh tài liệu dựa vào mã băm SHA-256
     * @param _docHash Mã băm SHA-256 cần tra cứu
     */
    function verifyDocument(bytes32 _docHash) 
        public 
        view 
        validHash(_docHash) 
        returns (
            bool isCertified,
            string memory cid,
            string memory fileName,
            uint256 fileSize,
            string memory fileType,
            address certifier,
            uint256 timestamp,
            uint256 blockNumber
        ) 
    {
        DocumentProof memory doc = documents[_docHash];
        if (!doc.exists) {
            return (false, "", "", 0, "", address(0), 0, 0);
        }
        return (
            true,
            doc.cid,
            doc.fileName,
            doc.fileSize,
            doc.fileType,
            doc.certifier,
            doc.timestamp,
            doc.blockNumber
        );
    }

    /**
     * @dev Lấy toàn bộ thông tin tài liệu theo mã băm SHA-256
     */
    function getDocumentByHash(bytes32 _docHash) public view returns (DocumentProof memory) {
        require(documents[_docHash].exists, "Khong tim thay tai lieu voi ma bam nay");
        return documents[_docHash];
    }

    /**
     * @dev Lấy tổng số lượng tài liệu đã công chứng trên Smart Contract
     */
    function getTotalDocuments() public view returns (uint256) {
        return registeredHashes.length;
    }

    /**
     * @dev Lấy danh sách mã băm theo trang (Pagination)
     */
    function getDocumentHashes(uint256 offset, uint256 limit) public view returns (bytes32[] memory) {
        uint256 total = registeredHashes.length;
        if (offset >= total) {
            return new bytes32[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = registeredHashes[i];
        }
        return result;
    }
}
