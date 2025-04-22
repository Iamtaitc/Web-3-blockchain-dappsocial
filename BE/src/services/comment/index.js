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
    this.getPostComments = readService.getPostComments.bind(readService);
    this.getCommentReplies = readService.getCommentReplies.bind(readService);

    // Đăng ký các phương thức từ write service
    this.createComment = writeService.createComment.bind(writeService);
    this.replyToComment = writeService.replyToComment.bind(writeService);
    this.updateComment = writeService.updateComment.bind(writeService);
    this.deleteComment = writeService.deleteComment.bind(writeService);

    // Đăng ký các phương thức từ interaction service
    this.likeComment = interactionService.likeComment.bind(interactionService);
    this.unlikeComment =
      interactionService.unlikeComment.bind(interactionService);
  }
}

module.exports = new CommentService();
