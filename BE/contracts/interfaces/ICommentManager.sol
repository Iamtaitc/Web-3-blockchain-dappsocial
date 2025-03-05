// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICommentManager {
    event PostCommented(uint256 postId, uint256 commentId, address commenter);
    event CommentLiked(uint256 commentId, address liker);
    event CommentUnliked(uint256 commentId, address disliker);

    function createComment(uint256 _postId, string memory _content, uint256 _parentCommentId, bool _isAnonymous) external returns (uint256);
    function likeComment(uint256 _commentId) external;
    function unLikeComment(uint256 _commentId) external;

    function getPostComments(uint256 _postId) external view returns (uint256[] memory);
    function hasUserLikeComment(uint256 _postId, address _user) external view returns (bool);
}