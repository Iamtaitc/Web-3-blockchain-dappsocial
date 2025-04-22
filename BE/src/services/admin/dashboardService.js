/**
 * Dashboard Service - Xử lý thống kê tổng quan hệ thống
 */

const { User, Post, Comment, NFTCache } = require("../../models/index");
const IPFSService = require("../ipfs.services");

class DashboardService {
  /**
   * Lấy thống kê tổng quan hệ thống
   * @returns {Object} Kết quả thống kê
   */
  async getDashboardStats() {
    try {
      // Đếm số lượng users
      const totalUsers = await User.countDocuments({ status: "active" });

      // Người dùng mới trong 7 ngày qua
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const newUsers = await User.countDocuments({
        status: "active",
        createdAt: { $gte: lastWeek },
      });

      // Thống kê bài đăng
      const totalPosts = await Post.countDocuments({ status: "active" });
      const newPosts = await Post.countDocuments({
        status: "active",
        createdAt: { $gte: lastWeek },
      });

      // Thống kê NFT
      const totalNFTs = await NFTCache.countDocuments();
      const listedNFTs = await NFTCache.countDocuments({ forSale: true });

      // Thống kê tương tác
      const totalComments = await Comment.countDocuments({ status: "active" });

      // Top người dùng theo điểm
      const topUsers = await User.find({ status: "active" })
        .sort({ points: -1 })
        .limit(10)
        .select("walletAddress username avatarURI points");

      // Subscriptions
      const premiumUsers = await User.countDocuments({
        "subscription.level": { $gt: 1 },
        "subscription.expiration": { $gt: new Date() },
      });

      const formattedTopUsers = topUsers.map((user) => ({
        walletAddress: user.walletAddress,
        username: user.username,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        points: user.points,
      }));

      const stats = {
        users: {
          total: totalUsers,
          new: newUsers,
          premium: premiumUsers,
        },
        content: {
          posts: totalPosts,
          newPosts,
          comments: totalComments,
          nfts: totalNFTs,
          listedNFTs,
        },
        topUsers: formattedTopUsers,
      };

      return {
        success: true,
        status: 200,
        message: "Lấy thống kê dashboard thành công",
        data: stats,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy thống kê dashboard",
        error: error.message,
      };
    }
  }
}

module.exports = new DashboardService();
