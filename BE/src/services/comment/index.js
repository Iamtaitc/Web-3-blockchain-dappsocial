// services/comment/index.js
const readService = require("./read.service");
const writeService = require("./write.service");
const interactionService = require("./interaction.service");

/**
 * Service tổng hợp xử lý các chức năng liên quan đến comments
 */
class CommentService {
  constructor() {
    // Đăng ký các phương thức từ read service
    this.getPostComments = readService.getPostComments;
    this.getCommentReplies = readService.getCommentReplies;

    // Đăng ký các phương thức từ write service
    this.createComment = writeService.createComment;
    this.replyToComment = writeService.replyToComment;
    this.updateComment = writeService.updateComment;
    this.deleteComment = writeService.deleteComment;

    // Đăng ký các phương thức từ interaction service
    this.likeComment = interactionService.likeComment;
    this.unlikeComment = interactionService.unlikeComment;
  }
}

module.exports = new CommentService();