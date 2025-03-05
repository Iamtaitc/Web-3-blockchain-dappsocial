// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICommentModeration
 * @dev Interface for comment moderation actions
 */
interface ICommentModeration {
    /**
     * @notice Archives a comment due to violation
     * @param _commentId Comment ID
     */
    function archiveComment(uint256 _commentId) external;
    
    /**
     * @notice Restores an archived comment
     * @param _commentId Comment ID
     */
    function restoreComment(uint256 _commentId) external;
    
    /**
     * @notice Marks a comment as hidden (still in database but not shown)
     * @param _commentId Comment ID
     * @param _reason Reason for hiding
     */
    function hideComment(uint256 _commentId, string calldata _reason) external;
    
    /**
     * @notice Checks if a comment exists
     * @param _commentId Comment ID
     * @return Whether the comment exists
     */
    function commentExists(uint256 _commentId) external view returns (bool);
    
    /**
     * @notice Gets a comment's current status
     * @param _commentId Comment ID
     * @return The status code (implementation-specific)
     */
    function getCommentStatus(uint256 _commentId) external view returns (uint8);
}