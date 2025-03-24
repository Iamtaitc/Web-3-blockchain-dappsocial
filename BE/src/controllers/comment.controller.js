const CommentService = require('../services/comment.services');
const ApiResponse = require('../utils/apiResponse.utils');

class CommentController {
  /**
   * Lấy tất cả comments của một bài đăng
   */
  async getPostComments(req, res) {
    const { postId } = req.params;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort
    };
    const currentUser = req.user;
    
    const result = await CommentService.getPostComments(postId, options, currentUser);
    
    if (result.success) {
      const { data, pagination } = result;
      return ApiResponse.paginated(
        res, 
        data, 
        pagination.total, 
        pagination.page, 
        pagination.limit, 
        result.message
      );
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Lấy các reply cho một comment
   */
  async getCommentReplies(req, res) {
    const { commentId } = req.params;
    const options = {
      page: req.query.page,
      limit: req.query.limit
    };
    const currentUser = req.user;
    
    const result = await CommentService.getCommentReplies(commentId, options, currentUser);
    
    if (result.success) {
      const { data, pagination } = result;
      return ApiResponse.paginated(
        res, 
        data, 
        pagination.total, 
        pagination.page, 
        pagination.limit, 
        result.message
      );
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Tạo comment mới cho bài đăng
   */
  async createComment(req, res) {
    const { postId } = req.params;
    const { content } = req.body;
    const author = req.user.address;
    const mediaFiles = req.files;
    
    const result = await CommentService.createComment(postId, content, author, mediaFiles);
    
    if (result.success) {
      return ApiResponse.created(res, result.data, result.message);
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Trả lời một comment
   */
  async replyToComment(req, res) {
    const { commentId } = req.params;
    const { content } = req.body;
    const author = req.user.address;
    const mediaFiles = req.files;
    
    const result = await CommentService.replyToComment(commentId, content, author, mediaFiles);
    
    if (result.success) {
      return ApiResponse.created(res, result.data, result.message);
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Cập nhật comment
   */
  async updateComment(req, res) {
    const { commentId } = req.params;
    const { content } = req.body;
    const author = req.user.address;
    
    const result = await CommentService.updateComment(commentId, content, author);
    
    if (result.success) {
      return ApiResponse.success(res, result.data, result.message);
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Xóa comment
   */
  async deleteComment(req, res) {
    const { commentId } = req.params;
    const user = req.user;
    
    const result = await CommentService.deleteComment(commentId, user);
    
    if (result.success) {
      return ApiResponse.success(res, result.data, result.message);
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Like comment
   */
  async likeComment(req, res) {
    const { commentId } = req.params;
    const user = req.user;
    
    const result = await CommentService.likeComment(commentId, user);
    
    if (result.success) {
      return ApiResponse.success(res, result.data, result.message);
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }

  /**
   * Unlike comment
   */
  async unlikeComment(req, res) {
    const { commentId } = req.params;
    const user = req.user;
    
    const result = await CommentService.unlikeComment(commentId, user);
    
    if (result.success) {
      return ApiResponse.success(res, result.data, result.message);
    }
    
    return ApiResponse.error(res, result.message, result.status);
  }
}

module.exports = new CommentController();