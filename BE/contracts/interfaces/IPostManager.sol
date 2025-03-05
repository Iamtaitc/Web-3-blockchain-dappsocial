// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../libraries/PostLibrary.sol";

interface IPostManager {
    event PostCreated(
        uint256 id,
        string ipfsHash,
        address author,
        uint256 timestamp
    );
    event PostUpdated(uint256 id, string newIpfsHash);
    event PostLiked(uint256 id, address liker);
    event PostUnliked(uint256 id, address disliker);
    event PostStatusChanged(uint256 postId, PostLibrary.PostStatus newStatus);
    event PostBookmarked(uint256 postId, address user);
    event PostUnbookmarked(uint256 postId, address user);
    event PostReposted(uint256 originalPostId, address reposter);

    function createPost(
        string memory _ipfsHash,
        string memory _title,
        string[] memory _tags,
        PostLibrary.PostStatus _status,
        PostLibrary.ContentType _contentType,
        string memory _category,
        string memory _location,
        bool _isAnonymous,
        bool _isFeatured,
        bool _isNFT
    ) external returns (uint256);

    function updatePost(
        uint256 _postId,
        string memory _ipfsHash,
        string memory _title,
        string[] memory _tags,
        string memory _category,
        string memory _location,
        PostLibrary.PostStatus _status
    ) external;

    function likePost(uint256 _postId) external;

    function unlikePost(uint256 _postId) external;

    function repostContent(uint256 _postId) external;

    function bookmarkPost(uint256 _postId) external;

    function removeBookmark(uint256 _postId) external;

    function markAsRead(uint256 _postId) external;

    //View Funtions
    function getPostsByUser(
        address _user
    ) external view returns (uint256[] memory);

    function getDraftsByUser(
        address _user
    ) external view returns (uint256[] memory);

    function getBookmarks(
        address _user
    ) external view returns (uint256[] memory);

    function getPostsByCategory(
        string memory _category
    ) external view returns (uint256[] memory);

    function getPostsByTag(
        string memory _tag
    ) external view returns (uint256[] memory);

    function getTrendingPosts() external view returns (uint256[] memory);

    function getFeaturedPosts() external view returns (uint256[] memory);

    function hasUserLikedPost(
        address _user,
        uint256 _postId
    ) external view returns (bool);

    function getReadStatus(
        address _user,
        uint256 _postId
    ) external view returns (bool);
}
