// services/comment/index.js
const ReadService = require("./read.service");
const readService = new ReadService();

const WriteService = require("./write.service");
const writeService = new WriteService();

const InteractionService = require("./interaction.service");
const interactionService = new InteractionService();


/**
 * Service tổng hợp xử lý các chức năng liên quan đến comments
 */
class CommentService {
  constructor() {
    // Bind phương thức từ readService
    this.getPostComments = readService.getPostComments.bind(readService);
    this.getCommentReplies = readService.getCommentReplies.bind(readService);

    // Các phương thức khác giữ nguyên
    this.createComment = writeService.createComment;
    this.replyToComment = writeService.replyToComment;
    this.updateComment = writeService.updateComment;
    this.deleteComment = writeService.deleteComment;
    this.likeComment = interactionService.likeComment;
    this.unlikeComment = interactionService.unlikeComment;
  }
}

module.exports = new CommentService();