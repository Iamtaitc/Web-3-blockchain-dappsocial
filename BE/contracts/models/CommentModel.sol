// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CommentModel
 * @dev Contains all data structures related to comments
 */
library CommentModel {
    // Status values for comments
    enum CommentStatus {
        Active,
        Hidden,
        Archived
    }

    struct Comment {
        uint256 id;
        uint256 postId;
        string content;
        uint256 timestamp;
        uint256 parentCommentId;
        address author;
        uint256 likeCount;
        bool isAnonymous;
        CommentStatus status;
        string moderationReason;
    }

    function initialize(
        Comment storage _comment,
        uint256 _id,
        uint256 _postId,
        string memory _content,
        uint256 _parentCommentId,
        address _author,
        bool _isAnonymous
    ) internal {
        _comment.id = _id;
        _comment.postId = _postId;
        _comment.content = _content;
        _comment.timestamp = block.timestamp;
        _comment.parentCommentId = _parentCommentId;
        _comment.author = _isAnonymous ? address(0) : _author;
        _comment.likeCount = 0;
        _comment.isAnonymous = _isAnonymous;
        _comment.status = CommentStatus.Active;
        _comment.moderationReason = "";
    }
}
