// services/comment/interaction.service.js
const { Comment, Like } = require("../../models/index");
const BaseCommentService = require("./base.service");
const notificationService = require("../notification.services");

/**
 * Service xử lý các tương tác với comment (like, unlike)
 */
class CommentInteractionService extends BaseCommentService {
  /**
   * Like comment
   */
  async likeComment(commentId, user) {
    try {
      // Tìm comment
      const comment = await Comment.findById(commentId);
      if (!comment || comment.status !== "active") {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại hoặc đã bị xóa",
        };
      }

      // Kiểm tra đã like chưa
      const existingLike = await Like.findOne({
        user: user.address.toLowerCase(),
        commentId,
      });

      if (existingLike) {
        return {
          success: false,
          status: 400,
          message: "Đã like comment này rồi",
        };
      }

      // Tạo like mới và cập nhật likeCount
      const newLike = new Like({
        user: user.address.toLowerCase(),
        postId: commentId,
        createdAt: new Date(),
      });

      await Promise.all([
        newLike.save(),
        Comment.findByIdAndUpdate(commentId, {
          $inc: { likeCount: 1 },
        }),
      ]);

      // Gửi thông báo
      if (comment.author.toLowerCase() !== user.address.toLowerCase()) {
        this._sendCommentNotification(
          comment.author,
          user.address,
          "đã thích bình luận của bạn",
          "like",
          commentId
        );
      }

      return {
        success: true,
        status: 200,
        message: "Đã thích bình luận",
        data: { commentId },
      };
    } catch (error) {
      console.error("Error in likeComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi thích bình luận",
      };
    }
  }

  /**
   * Unlike comment
   */
  async unlikeComment(commentId, user) {
    try {
      // Kiểm tra đã like chưa
      const existingLike = await Like.findOne({
        user: user.address.toLowerCase(),
        postId: commentId,
      });

      if (!existingLike) {
        return {
          success: false,
          status: 400,
          message: "Chưa like comment này",
        };
      }

      // Xóa like và cập nhật likeCount
      await Promise.all([
        Like.findByIdAndDelete(existingLike._id),
        Comment.findByIdAndUpdate(commentId, {
          $inc: { likeCount: -1 },
        }),
      ]);

      return {
        success: true,
        status: 200,
        message: "Đã bỏ thích bình luận",
        data: { commentId },
      };
    } catch (error) {
      console.error("Error in unlikeComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi bỏ thích bình luận",
      };
    }
  }

  /**
   * Gửi thông báo về tương tác (like)
   */
  async _sendCommentNotification(
    recipient,
    sender,
    content,
    targetType,
    targetId
  ) {
    try {
      // Tạo thông báo mới
      return await notificationService.createNotification({
        recipient,
        type: "like",
        sender,
        content,
        targetType,
        targetId,
      });
    } catch (error) {
      console.error("Error sending interaction notification:", error);
      return null;
    }
  }
}

module.exports = new CommentInteractionService();
