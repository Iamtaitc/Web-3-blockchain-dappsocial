const ApiResponse = require('../utils/apiResponse.utils');
const SearchService = require('../services/search.services');

/**
 * Controller xử lý các chức năng tìm kiếm
 */
class SearchController {

  /**
   * Tìm kiếm tổng hợp (users, posts, NFTs, tags)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async search(req, res) {
    const { query, type, limit = 10, page = 1 } = req.query;
    
    if (!query || query.length < 2) {
      return ApiResponse.badRequest(res, 'Chuỗi tìm kiếm phải có ít nhất 2 ký tự');
    }
    
    const result = await SearchService.search(query, type, parseInt(limit), parseInt(page), req.user);
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status, result.error);
    }
    
    return ApiResponse.success(res, {
      query,
      results: result.data
    });
  }

  /**
   * Tìm kiếm người dùng
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchUsers(req, res) {
    const { query, limit = 10, page = 1, sortBy = 'followers' } = req.query;
    
    if (!query || query.length < 2) {
      return ApiResponse.badRequest(res, 'Chuỗi tìm kiếm phải có ít nhất 2 ký tự');
    }
    
    const result = await SearchService.searchUsers(query, parseInt(limit), parseInt(page), sortBy, req.user);
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, 500, result.error);
    }
    
    return ApiResponse.paginated(
      res, 
      result.data.users, 
      result.data.pagination.total, 
      result.data.pagination.page, 
      result.data.pagination.limit,
      'Tìm kiếm người dùng thành công'
    );
  }
  async searchUserForMention(req, res) {
    const { keyword, limit } = req.query;
    
    if (!keyword) {
      return ApiResponse.badRequest(res, 'Vui lòng cung cấp từ khóa tìm kiếm');
    }
    
    const result = await SearchService.searchUserForMention(
      keyword, 
      parseInt(limit) || 5, 
      req.user
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status || 500, result.error);
    }
    
    return ApiResponse.success(res, result.data, result.message);
  }
  /**
   * Tìm kiếm posts
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchPosts(req, res) {
    const { query, limit = 10, page = 1, sortBy = 'recent', withMedia, hasNFT } = req.query;
    
    if (!query && !withMedia && !hasNFT) {
      return ApiResponse.badRequest(res, 'Phải cung cấp ít nhất một tiêu chí tìm kiếm');
    }
    
    const result = await SearchService.searchPosts(
      query, 
      parseInt(limit), 
      parseInt(page), 
      sortBy, 
      withMedia, 
      hasNFT, 
      req.user
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, 500, result.error);
    }
    
    return ApiResponse.paginated(
      res, 
      result.data.posts, 
      result.data.pagination.total, 
      result.data.pagination.page, 
      result.data.pagination.limit,
      'Tìm kiếm bài đăng thành công'
    );
  }

  /**
   * Tìm kiếm NFTs
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchNFTs(req, res) {
    const { 
      query, 
      limit = 10, 
      page = 1, 
      sortBy = 'recent', 
      forSale, 
      mediaType, 
      minPrice, 
      maxPrice 
    } = req.query;
    
    if (!query && !forSale && !mediaType && !minPrice && !maxPrice) {
      return ApiResponse.badRequest(res, 'Phải cung cấp ít nhất một tiêu chí tìm kiếm');
    }
    
    const result = await SearchService.searchNFTs(
      query, 
      parseInt(limit), 
      parseInt(page), 
      sortBy, 
      forSale, 
      mediaType, 
      minPrice, 
      maxPrice
    );
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, 500, result.error);
    }
    
    return ApiResponse.paginated(
      res, 
      result.data.nfts, 
      result.data.pagination.total, 
      result.data.pagination.page, 
      result.data.pagination.limit,
      'Tìm kiếm NFT thành công'
    );
  }

  /**
   * Tìm kiếm tags
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchTags(req, res) {
    const { query, limit = 20 } = req.query;
    
    if (!query || query.length < 2) {
      return ApiResponse.badRequest(res, 'Chuỗi tìm kiếm phải có ít nhất 2 ký tự');
    }
    
    const result = await SearchService.searchTags(query, parseInt(limit));
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, 500, result.error);
    }
    
    return ApiResponse.success(res, { tags: result.data });
  }

  /**
   * Lấy trending tags
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getTrendingTags(req, res) {
    const { limit = 10 } = req.query;
    
    const result = await SearchService.getTrendingTags(parseInt(limit));
    
    if (!result.success) {
      return ApiResponse.error(res, result.message, 500, result.error);
    }
    
    return ApiResponse.success(res, { tags: result.data });
  }
}

module.exports = new SearchController();