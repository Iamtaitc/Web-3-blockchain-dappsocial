// controllers/user.controller.js
const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/apiResponse.utils");
const userServices = require("../services/user.services");

class UserController {
  async getUserProfile(req, res) {
    const { address } = req.params;
    const currentUserAddress = req.user ? req.user.address : null;
    
    const result = await userServices.getUserProfile(address, currentUserAddress);
    
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    
    ApiResponse.success(res, result.data, "User profile retrieved successfully");
  }

  async updateProfile(req, res) {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(res, "Invalid request data", errors.array());
    }

    const address = req.user.address;
    const result = await userServices.updateProfile(address, req.body, req.files);
    
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    
    ApiResponse.success(res, result.data, "Profile updated successfully");
  }

  async followUser(req, res) {
    const { address } = req.params;
    const followerAddress = req.user.address;
    
    const result = await userServices.followUser(address, followerAddress);
    
    if (!result.success) {
      if (result.message === "User not found") {
        return ApiResponse.notFound(res, result.message);
      }
      return ApiResponse.badRequest(res, result.message);
    }
    
    ApiResponse.success(res, result.data, "Following user successfully");
  }

  async unfollowUser(req, res) {
    const { address } = req.params;
    const followerAddress = req.user.address;
    
    const result = await userServices.unfollowUser(address, followerAddress);
    
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    
    ApiResponse.success(res, result.data, "Unfollowed successfully");
  }

  async getUserFollowers(req, res) {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await userServices.getUserFollowers(address, page, limit);
    
    if (!result.success) {
      return ApiResponse.error(res, result.message);
    }
    
    const { followers, pagination } = result.data;
    
    ApiResponse.paginated(
      res,
      followers,
      pagination.total,
      pagination.page,
      pagination.limit,
      "Followers retrieved successfully"
    );
  }

  async getUserFollowing(req, res) {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await userServices.getUserFollowing(address, page, limit);
    
    if (!result.success) {
      return ApiResponse.error(res, result.message);
    }
    
    const { following, pagination } = result.data;
    
    ApiResponse.paginated(
      res,
      following,
      pagination.total,
      pagination.page,
      pagination.limit,
      "Following list retrieved successfully"
    );
  }

  async getLeaderboard(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await userServices.getLeaderboard(page, limit);
    
    if (!result.success) {
      return ApiResponse.error(res, result.message);
    }
    
    const { leaderboard, pagination } = result.data;
    
    ApiResponse.paginated(
      res,
      leaderboard,
      pagination.total,
      pagination.page,
      pagination.limit,
      "Leaderboard retrieved successfully"
    );
  }
}

module.exports = new UserController();