// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../interfaces/ICommentManager.sol";
import "../models/CommentModel.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../libraries/PostLibrary.sol";
import "../interfaces/IPostQuery.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IRewardManager.sol";

contract CommentManager is ICommentManager, ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;
    using CommentModel for CommentModel.Comment;

    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    Counters.Counter private _commentIdCounter;

    mapping(uint256 => CommentModel.Comment) public comments;
    mapping(uint256 => uint256[]) public postComments;
    mapping(address => mapping(uint256 => bool)) public commentLikes;

    IPostQuery public postManager;
    IRewardManager public rewardManager;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setPostreference(
        address _postManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        postManager = IPostQuery(_postManager);
    }

    function setRewardManage(
        address _rewardManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardManager = IRewardManager(_rewardManager);
    }

    function createComment(
        uint256 _postId,
        string memory _content,
        uint256 _parentCommentID,
        bool _isAnonymous
    ) public override nonReentrant returns (uint256) {
        require(postManager.postExists(_postId), "Post does not exist");
        require(
            postManager.getPostStatus(_postId) ==
                PostLibrary.PostStatus.Published,
            "Post is not published"
        );
        if (_parentCommentID > 0) {
            require(
                _parentCommentID <= _commentIdCounter.current(),
                "Invalid parent comment"
            );
            require(
                comments[_parentCommentID].postId == _postId,
                "Invalid parent comment"
            );
        }
        _commentIdCounter.increment();
        uint256 newCommentId = _commentIdCounter.current();

        CommentModel.Comment storage newComment = comments[newCommentId];
        newComment.initialize(
            newCommentId,
            _postId,
            _content,
            _parentCommentID,
            msg.sender,
            _isAnonymous
        );
        postComments[_postId].push(newCommentId);

        emit PostCommented(newCommentId, _postId, msg.sender);

        if (address(rewardManager) != address(0) && !_isAnonymous) {
            rewardManager.rewardCommentCreation(msg.sender);
        }

        return newCommentId;
    }

    function likeComment(uint256 _commentId) public override {
        require(
            _commentId > 0 && _commentId <= _commentIdCounter.current(),
            "Invalid comment"
        );
        require(!commentLikes[msg.sender][_commentId], "Already liked");
        CommentModel.Comment storage comment = comments[_commentId];
        comment.likeCount++;
        commentLikes[msg.sender][_commentId] = true;
        emit CommentLiked(_commentId, msg.sender);
    }

    function unLikeComment(uint256 _commentId) public override {
        require(
            _commentId > 0 && _commentId <= _commentIdCounter.current(),
            "Invalid comment"
        );
        require(
            commentLikes[msg.sender][_commentId],
            "You have not liked this comment"
        );
        CommentModel.Comment storage comment = comments[_commentId];
        comment.likeCount--;
        commentLikes[msg.sender][_commentId] = false;
        emit CommentUnliked(_commentId, msg.sender);
    }

    function getPostComments(
        uint256 _postId
    ) public view override returns (uint256[] memory) {
        return postComments[_postId];
    }

    function hasUserLikeComment(
        uint256 _commentId,
        address _user
    ) public view override returns (bool) {
        return commentLikes[_user][_commentId];
    }

    function setPostManagerAddress(address _postManagerAddress) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        postManager = IPostQuery(_postManagerAddress);
    }
}
