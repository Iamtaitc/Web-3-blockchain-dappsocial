// src/controllers/LeaderboardController.js
const ApiResponse = require('../utils/apiResponse.utils');
const LeaderboardService = require('../services/leaderBoard.services');

/**
 * Controller xử lý các chức năng bảng xếp hạng
 */
class LeaderboardController {

  /**
   * Lấy bảng xếp hạng người dùng dựa trên điểm số
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserLeaderboard(req, res) {
    const { limit = 20, page = 1, period = 'alltime' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const currentUser = req.user || null;
    
    const result = await LeaderboardService.getUserLeaderboard(
      pageNumber, 
      limitNumber, 
      period, 
      currentUser
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status, result.error);
    }
    
    return ApiResponse.success(res, {
      leaderboard: result.data.leaderboard,
      pagination: result.data.pagination,
      period: result.data.period,
      currentUserRank: result.data.currentUserRank
    });
  }

  /**
   * Lấy bảng xếp hạng NFT dựa trên giá, lượt thích và lượt xem
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getNFTLeaderboard(req, res) {
    const { limit = 20, page = 1, sortBy = 'value' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const result = await LeaderboardService.getNFTLeaderboard(
      pageNumber, 
      limitNumber, 
      sortBy
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status, result.error);
    }
    
    return ApiResponse.success(res, {
      leaderboard: result.data.leaderboard,
      pagination: result.data.pagination,
      sortBy: result.data.sortBy
    });
  }

  /**
   * Lấy bảng xếp hạng bài đăng dựa trên lượt thích, comment và tương tác
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPostLeaderboard(req, res) {
    const { limit = 20, page = 1, period = 'weekly' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const result = await LeaderboardService.getPostLeaderboard(
      pageNumber, 
      limitNumber, 
      period
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status, result.error);
    }
    
    return ApiResponse.success(res, {
      leaderboard: result.data.leaderboard,
      pagination: result.data.pagination,
      period: result.data.period
    });
  }

  /**
   * Lấy bảng xếp hạng các tags phổ biến
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getTagLeaderboard(req, res) {
    const { limit = 20, period = 'weekly' } = req.query;
    const limitNumber = parseInt(limit);
    
    const result = await LeaderboardService.getTagLeaderboard(
      limitNumber, 
      period
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status, result.error);
    }
    
    return ApiResponse.success(res, {
      leaderboard: result.data.leaderboard,
      period: result.data.period
    });
  }

  /**
   * Lấy thứ hạng của người dùng hiện tại trên leaderboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCurrentUserRank(req, res) {
    const walletAddress = req.user.address;
    
    const result = await LeaderboardService.getCurrentUserRank(walletAddress);
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status, result.error);
    }
    
    return ApiResponse.success(res, result.data);
  }
}

module.exports = new LeaderboardController();