// services/user/leaderboard.services.js
const { User } = require("../../models/index");
const IPFSService = require("../ipfs.services");

/**
 * Service xử lý bảng xếp hạng người dùng
 */
class LeaderboardService {
  /**
   * Lấy bảng xếp hạng người dùng
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng item trên một trang
   * @returns {object} Kết quả xử lý
   */
  async getLeaderboard(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Lấy users theo points
      const users = await User.find({ status: "active" })
        .sort({ points: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "walletAddress username avatarURI points followerCount postCount subscription"
        );

      // Format response
      const leaderboard = users.map((user) => ({
        walletAddress: user.walletAddress,
        username: user.username,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        points: user.points,
        followerCount: user.followerCount,
        postCount: user.postCount,
        subscriptionLevel: user.subscription?.level || 1,
      }));

      // Lấy tổng số users để phân trang
      const total = await User.countDocuments({ status: "active" });

      return {
        success: true,
        data: {
          leaderboard,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return { success: false, message: "Failed to get leaderboard", error };
    }
  }
}

module.exports = new LeaderboardService();