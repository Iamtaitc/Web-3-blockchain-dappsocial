// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/PostLibrary.sol";

interface IPostQuery {
    
    /**
     * @notice Check if a post exists
     * @param _postId The post ID to check
     * @return Whether the post exists
     */
    function postExists(uint256 _postId) external view returns (bool);

    /**
     * @notice Get the status of a post
     * @param _postId The post ID
     * @return Post status
     */
    function getPostStatus(
        uint256 _postId
    ) external view returns (PostLibrary.PostStatus);

    /**
     * @notice Get the author of a post
     * @param _postId The post ID
     * @return Author address
     */
    function getPostAuthor(uint256 _postId) external view returns (address);

    /**
     * @notice Get the like count of a post
     * @param _postId The post ID
     * @return Like count
     */
    function getPostLikeCount(uint256 _postId) external view returns (uint256);

    /**
     * @notice Get the total number of posts
     * @return Total number of posts
     */
    function getTotalPosts() external view returns (uint256);

    /**
     * @notice Check if a post is anonymous
     * @param _postId The post ID
     * @return Whether the post is anonymous
     */
    function isPostAnonymous(uint256 _postId) external view returns (bool);

    /**
     * @notice Changes the status of a post
     * @param _postId Post ID
     * @param _status New status for the post
     */

    function changePostStatus(
        uint256 _postId,
        PostLibrary.PostStatus _status
    ) external;

    /**
     * @notice Sets the featured status of a post
     * @param _postId Post ID
     * @param _isFeatured New featured status
     */
    function getPostFeatured(uint256 _postId, bool _isFeatured) external;
}
