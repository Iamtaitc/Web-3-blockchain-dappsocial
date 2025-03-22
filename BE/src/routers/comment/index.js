"use strict";
const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/comment.controller');

// Lấy comments của bài đăng
router.get("/posts/:postId/comments", commentController.getPostComments);

// Lấy replies của comment
router.get("/comments/:commentId/replies", commentController.getCommentReplies);

// Tạo comment mới cho bài đăng
router.post("/posts/:postId/comments", commentController.createComment);

// Trả lời một comment
router.post("/comments/:commentId/reply", commentController.replyToComment);

// Cập nhật comment
router.patch("/comments/:commentId", commentController.updateComment);

// Xóa comment
router.delete("/comments/:commentId", commentController.deleteComment);

// Like comment
router.post("/comments/:commentId/like", commentController.likeComment);

// Unlike comment
router.post("/comments/:commentId/unlike", commentController.unlikeComment);

module.exports = router;