// services/comment/write.service.js
const { Comment, Post } = require("../../models/index");
const BaseCommentService = require("./base.service");
const notificationService = require("../notification.services");

/**
 * Service xử lý việc tạo và cập nhật comments
 */
class CommentWriteService extends BaseCommentService {
  /**
   * Tạo comment mới
   */
  async createComment(postId, commentData, user) {
    try {
      // Kiểm tra bài đăng
      const post = await Post.findById(postId);
      if (!post) {
        return {
          success: false,
          status: 404,
          message: "Bài đăng không tồn tại",
        };
      }

      // Tạo comment mới
      const newComment = new Comment({
        postId,
        author: user.address.toLowerCase(),
        content: commentData.content,
        contentURI: commentData.contentURI || null,
        media: commentData.media || [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newComment.save();

      // Cập nhật số lượng comment trong bài đăng
      await Post.findByIdAndUpdate(postId, {
        $inc: { commentCount: 1 },
      });

      // Format comment với thông tin người dùng
      const formattedComment = await this._formatSingleCommentWithUserInfo(
        newComment,
        user.address
      );

      return {
        success: true,
        message: "Tạo bình luận thành công",
        data: formattedComment,
      };
    } catch (error) {
      console.error("Error in createComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo bình luận",
        error: error.message,
      };
    }
  }

  /**
   * Trả lời một comment
   */
  async replyToComment(commentId, replyData, user) {
    try {
      // Kiểm tra comment gốc
      const parentComment = await Comment.findById(commentId);
      if (!parentComment || parentComment.status !== "active") {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại hoặc đã bị xóa",
        };
      }

      // Tính độ sâu của reply
      const depth = (parentComment.depth || 0) + 1;
      if (depth > 3) {
        return {
          success: false,
          status: 400,
          message: "Không thể trả lời sâu hơn 3 cấp",
        };
      }

      // Tạo reply
      const newReply = new Comment({
        postId: parentComment.postId,
        parentId: commentId,
        depth,
        author: user.address.toLowerCase(),
        content: replyData.content,
        contentURI: replyData.contentURI || null,
        media: replyData.media || [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newReply.save();

      // Cập nhật số lượng reply của comment cha
      await Comment.findByIdAndUpdate(commentId, {
        $inc: { replyCount: 1 },
      });

      // Gửi thông báo nếu đây không phải là reply cho chính mình
      if (parentComment.author.toLowerCase() !== user.address.toLowerCase()) {
        await this._sendReplyNotification(
          parentComment.author,
          user.address,
          "đã trả lời bình luận của bạn",
          commentId
        );
      }

      // Format reply với thông tin người dùng
      const formattedReply = await this._formatSingleCommentWithUserInfo(
        newReply,
        user.address
      );

      return {
        success: true,
        message: "Trả lời bình luận thành công",
        data: formattedReply,
      };
    } catch (error) {
      console.error("Error in replyToComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi trả lời bình luận",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật comment
   */
  async updateComment(commentId, updateData, user) {
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

      // Kiểm tra quyền chỉnh sửa
      if (comment.author.toLowerCase() !== user.address.toLowerCase()) {
        return {
          success: false,
          status: 403,
          message: "Không có quyền chỉnh sửa bình luận này",
        };
      }

      // Cập nhật comment
      const updatedFields = {
        content: updateData.content || comment.content,
        contentURI: updateData.contentURI || comment.contentURI,
        media: updateData.media || comment.media,
        updatedAt: new Date(),
      };

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: updatedFields },
        { new: true }
      );

      // Format comment với thông tin người dùng
      const formattedComment = await this._formatSingleCommentWithUserInfo(
        updatedComment,
        user.address
      );

      return {
        success: true,
        message: "Cập nhật bình luận thành công",
        data: formattedComment,
      };
    } catch (error) {
      console.error("Error in updateComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật bình luận",
        error: error.message,
      };
    }
  }

  /**
   * Xóa comment
   */
  async deleteComment(commentId, user) {
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

      // Kiểm tra quyền xóa
      if (comment.author.toLowerCase() !== user.address.toLowerCase()) {
        return {
          success: false,
          status: 403,
          message: "Không có quyền xóa bình luận này",
        };
      }

      // Xóa comment (soft delete)
      await Comment.findByIdAndUpdate(commentId, {
        $set: {
          status: "deleted",
          updatedAt: new Date(),
        },
      });

      // Cập nhật số lượng comment trong bài đăng
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: -1 },
      });

      // Nếu là comment cấp 1, giảm số lượng comment trong post
      if (!comment.parentId) {
        await Post.findByIdAndUpdate(comment.postId, {
          $inc: { commentCount: -1 },
        });
      } else {
        // Nếu là reply, giảm số lượng reply trong comment cha
        await Comment.findByIdAndUpdate(comment.parentId, {
          $inc: { replyCount: -1 },
        });
      }

      return {
        success: true,
        message: "Xóa bình luận thành công",
        data: { commentId },
      };
    } catch (error) {
      console.error("Error in deleteComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xóa bình luận",
        error: error.message,
      };
    }
  }

  /**
   * Gửi thông báo về reply
   */
  async _sendReplyNotification(recipient, sender, content, commentId) {
    try {
      return await notificationService.createNotification({
        recipient,
        type: "reply",
        sender,
        content,
        targetType: "comment",
        targetId: commentId,
      });
    } catch (error) {
      console.error("Error sending reply notification:", error);
      return null;
    }
  }
}

module.exports = new CommentWriteService();
