/**
 * User Management Service - Quản lý người dùng
 */

const { User, Post, Comment, Notification } = require("../../models/index");
const IPFSService = require("../ipfs.services");

class UserManagementService {
  /**
   * Quản lý người dùng - Lấy danh sách
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} search - Từ khóa tìm kiếm
   * @param {String} status - Trạng thái người dùng
   * @returns {Object} Kết quả lấy danh sách
   */
  async getUsers(page, limit, search, status) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query
      const query = {};

      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { walletAddress: { $regex: search, $options: "i" } },
          { ensName: { $regex: search, $options: "i" } },
        ];
      }

      if (status) {
        query.status = status;
      }

      // Lấy danh sách users
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Đếm tổng số users
      const total = await User.countDocuments(query);

      const formattedUsers = users.map((user) => ({
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        socialStats: user.socialStats,
        points: user.points,
        subscription: user.subscription,
        status: user.status,
        createdAt: user.createdAt,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách người dùng thành công",
        data: {
          users: formattedUsers,
          pagination: {
            total,
            page: page,
            limit: limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting users:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái người dùng
   * @param {String} walletAddress - Địa chỉ ví
   * @param {String} status - Trạng thái mới
   * @returns {Object} Kết quả cập nhật
   */
  async updateUserStatus(walletAddress, status) {
    try {
      // Cập nhật người dùng
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { $set: { status } },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      // Nếu user bị suspend, ẩn tất cả bài đăng của họ
      if (status === "suspended") {
        await Post.updateMany(
          { author: walletAddress.toLowerCase() },
          { $set: { status: "hidden" } }
        );

        await Comment.updateMany(
          { author: walletAddress.toLowerCase() },
          { $set: { status: "hidden" } }
        );
      }

      // Nếu user được kích hoạt lại, hiện lại bài đăng
      if (status === "active") {
        await Post.updateMany(
          { author: walletAddress.toLowerCase(), status: "hidden" },
          { $set: { status: "active" } }
        );

        await Comment.updateMany(
          { author: walletAddress.toLowerCase(), status: "hidden" },
          { $set: { status: "active" } }
        );
      }

      return {
        success: true,
        status: 200,
        message: "Cập nhật trạng thái người dùng thành công",
        data: {
          walletAddress: user.walletAddress,
          username: user.username,
          status: user.status,
        },
      };
    } catch (error) {
      console.error("Error updating user status:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật trạng thái người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Xác minh người dùng (verified)
   * @param {String} walletAddress - Địa chỉ ví
   * @param {Boolean} verified - Trạng thái xác minh
   * @returns {Object} Kết quả xác minh
   */
  async verifyUser(walletAddress, verified) {
    try {
      // Cập nhật người dùng
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { $set: { isVerified: verified } },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      // Gửi thông báo cho người dùng nếu được xác minh
      if (verified) {
        // Tạo thông báo
        await Notification.create({
          recipient: walletAddress.toLowerCase(),
          type: "system",
          content: "Tài khoản của bạn đã được xác minh!",
          read: false,
          createdAt: new Date(),
        });
      }

      return {
        success: true,
        status: 200,
        message: verified
          ? "Xác minh người dùng thành công"
          : "Hủy xác minh người dùng thành công",
        data: {
          walletAddress: user.walletAddress,
          username: user.username,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      console.error("Error verifying user:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xác minh người dùng",
        error: error.message,
      };
    }
  }
}

module.exports = new UserManagementService();
