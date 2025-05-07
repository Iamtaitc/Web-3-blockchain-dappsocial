// services/comment/read.service.js
const { Comment, Post } = require("../../models/index");
const BaseCommentService = require("./base.service");

/**
 * Service xử lý việc đọc comments
 */
class CommentReadService extends BaseCommentService {
  
  /**
   * Lấy tất cả comments của một bài đăng
   */
  async getPostComments(postId, options = {}, currentUser = null) {
    try {
      const { page = 1, limit = 20, sort = "newest" } = options;
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // Tìm bài đăng
      const post = await Post.findById(postId);
      if (!post) {
        return {
          success: false,
          status: 404,
          message: "Bài đăng không tồn tại",
        };
      }
  
      // Xác định cách sắp xếp
      const sortOption = this._getSortOption(sort);
  
      // Lấy comments cấp 1
      const comments = await Comment.find({
        postId,
        parentId: null,
        status: "active",
      })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
  
      console.log("Found comments:", comments.length);
      
      let formattedComments = [];
      try {
        formattedComments = await this._formatCommentsWithUserInfo(comments, currentUser);
        console.log("Formatted comments:", formattedComments ? formattedComments.length : "undefined");
      } catch (formatError) {
        console.error("Error formatting comments:", formatError);
        formattedComments = comments.map(comment => ({
          _id: comment._id,
          content: comment.content,
          author: comment.author,
          createdAt: comment.createdAt
        }));
      }
  
      const total = await Comment.countDocuments({ postId, parentId: null, status: "active" });
  
      return {
        success: true,
        message: "Lấy danh sách bình luận thành công",
        data: formattedComments || [],
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in getPostComments:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách bình luận",
        error: error.message
      };
    }
  }

  /**
   * Lấy các reply cho một comment
   */
  async getCommentReplies(commentId, options = {}, currentUser = null) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Tìm comment cha
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại",
        };
      }

      // Lấy replies
      const replies = await Comment.find({
        parentId: commentId,
        status: "active",
      })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Lấy thông tin người dùng và like
      const [formattedReplies, total] = await Promise.all([
        this._formatCommentsWithUserInfo(replies, currentUser),
        Comment.countDocuments({ parentId: commentId, status: "active" }),
      ]);

      return {
        success: true,
        message: "Lấy danh sách bình luận thành công",
        data: formattedReplies,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in getCommentReplies:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách phản hồi",
      };
    }
  }
}

module.exports = CommentReadService;