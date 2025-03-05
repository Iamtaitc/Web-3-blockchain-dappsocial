// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PostLibrary {
    // Định nghĩa enum để phân loại trạng thái bài đăng và loại nội dung
    enum PostStatus { Draft, Published, Private, Archived }
    enum ContentType { Text, Image, Video, Audio }

    // Struct cho bài đăng với đầy đủ thông tin theo yêu cầu của PostManager
    struct Post {
        uint256 id;
        string ipfsHash;      // CID của nội dung bài đăng trên IPFS
        string title;         // Tiêu đề bài đăng
        string[] tags;        // Các thẻ (tags) liên quan
        address author;       // Tác giả bài đăng
        uint256 timestamp;    // Thời gian tạo bài đăng
        uint256 likeCount;    // Số lượt like
        uint256 commentCount; // Số lượt bình luận
        uint256 repostCount;  // Số lượt repost
        uint256 viewCount;      // Số lượt xem
        PostStatus status;    // Trạng thái của bài đăng (Draft, Published, Private, Archived)
        ContentType contentType; // Loại nội dung (Text, Image, Video, Audio)
        string category;      // Danh mục bài đăng
        string location;      // Vị trí hoặc địa điểm liên quan
        bool isAnonymous;     // Nếu bài đăng ẩn danh
        bool isFeatured;      // Nếu bài đăng được đánh dấu nổi bật
        bool isNFT;           // Nếu bài đăng có liên quan đến NFT
    }

    /**
     * @dev Hàm khởi tạo bài đăng, thiết lập các giá trị ban đầu.
     * @param self Reference đến đối tượng Post (storage)
     * @param _id ID của bài đăng
     * @param _ipfsHash CID của nội dung bài đăng
     * @param _title Tiêu đề bài đăng
     * @param _tags Các thẻ (tags) liên quan
     * @param _author Địa chỉ tác giả (sẽ được xác định theo yêu cầu ẩn danh)
     * @param _status Trạng thái của bài đăng (Draft, Published, Private, Archived)
     * @param _contentType Loại nội dung của bài đăng (Text, Image, Video, Audio) hiện tại sẽ dùng Text
     * @param _category Danh mục bài đăng
     * @param _location Vị trí hoặc địa điểm liên quan
     * @param _isAnonymous true nếu bài đăng được đăng ẩn danh
     * @param _isFeatured true nếu bài đăng được đánh dấu nổi bật
     * @param _isNFT true nếu bài đăng liên quan đến NFT
     */
    function initialize(
        Post storage self,
        uint256 _id,
        string memory _ipfsHash,
        string memory _title,
        string[] memory _tags,
        address _author,
        PostStatus _status,
        ContentType _contentType,
        string memory _category,
        string memory _location,
        bool _isAnonymous,
        bool _isFeatured,
        bool _isNFT
    ) internal {
        self.id = _id; 
        self.ipfsHash = _ipfsHash;
        self.title = _title;
        self.tags = _tags;
        self.author = _isAnonymous ? address(0) : _author;
        self.timestamp = block.timestamp;
        self.likeCount = 0;
        self.commentCount = 0;
        self.repostCount = 0;
        self.viewCount = 0;
        self.status = _status;
        self.contentType = _contentType;
        self.category = _category;
        self.location = _location;
        self.isAnonymous = _isAnonymous;
        self.isFeatured = _isFeatured;
        self.isNFT = _isNFT;
    }
}
