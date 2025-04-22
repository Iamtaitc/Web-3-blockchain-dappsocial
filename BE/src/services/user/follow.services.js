// services/user/follow.services.js
const { User, Follow } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const notificationService = require("../notification.services");

/**
 * Service xử lý các chức năng follow/unfollow
 */
class FollowService {
  /**
   * Follow một user
   * @param {string} targetAddress - Địa chỉ ví của user được follow
   * @param {string} followerAddress - Địa chỉ ví của user thực hiện follow
   * @returns {object} Kết quả xử lý
   */
  async followUser(targetAddress, followerAddress) {
    try {
      // Không thể follow chính mình
      if (targetAddress === followerAddress) {
        return { success: false, message: "Cannot follow yourself" };
      }

      // Kiểm tra user có tồn tại không
      const userToFollow = await User.findOne({
        walletAddress: targetAddress,
      });

      if (!userToFollow) {
        return { success: false, message: "User not found" };
      }

      // Kiểm tra đã follow chưa
      const existingFollow = await Follow.findOne({
        follower: followerAddress,
        following: targetAddress,
      });

      if (existingFollow) {
        return { success: false, message: "Already following this user" };
      }

      // Tạo follow mới
      await Follow.create({
        follower: followerAddress,
        following: targetAddress,
        createdAt: new Date(),
      });

      // Cập nhật follower và following count
      await User.updateOne(
        { walletAddress: targetAddress },
        { $inc: { followerCount: 1 } }
      );

      await User.updateOne(
        { walletAddress: followerAddress },
        { $inc: { followingCount: 1 } }
      );

      // Gửi thông báo khi follow thành công
      await notificationService.createNotification({
        recipient: targetAddress,
        type: "follow",
        sender: followerAddress,
        content: `${followerAddress} started following you!`,
        targetType: "user",
        targetId: followerAddress,
        createdAt: new Date(),
      });

      return {
        success: true,
        data: {
          follower: followerAddress,
          following: targetAddress,
        },
      };
    } catch (error) {
      console.error("Error following user:", error);
      return { success: false, message: "Failed to follow user", error };
    }
  }

  /**
   * Unfollow một user
   * @param {string} targetAddress - Địa chỉ ví của user được unfollow
   * @param {string} followerAddress - Địa chỉ ví của user thực hiện unfollow
   * @returns {object} Kết quả xử lý
   */
  async unfollowUser(targetAddress, followerAddress) {
    try {
      // Kiểm tra follow có tồn tại không
      const existingFollow = await Follow.findOne({
        follower: followerAddress,
        following: targetAddress,
      });

      if (!existingFollow) {
        return { success: false, message: "Follow not found" };
      }

      // Xóa follow
      await Follow.deleteOne({
        follower: followerAddress,
        following: targetAddress,
      });

      // Cập nhật follower và following count
      await User.updateOne(
        { walletAddress: targetAddress },
        { $inc: { followerCount: -1 } }
      );

      await User.updateOne(
        { walletAddress: followerAddress },
        { $inc: { followingCount: -1 } }
      );

      return {
        success: true,
        data: {
          follower: followerAddress,
          following: targetAddress,
        },
      };
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return { success: false, message: "Failed to unfollow user", error };
    }
  }

  /**
   * Lấy danh sách người theo dõi (followers) của một user
   * @param {string} address - Địa chỉ ví của user cần lấy danh sách followers
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng item trên một trang
   * @returns {object} Kết quả xử lý
   */
  async getUserFollowers(address, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Lấy danh sách followers
      const followers = await Follow.find({
        following: address,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy thông tin chi tiết của mỗi follower
      const followerDetails = await Promise.all(
        followers.map(async (follow) => {
          const user = await User.findOne({
            walletAddress: follow.follower,
          });

          if (!user) return null;

          return {
            walletAddress: user.walletAddress,
            username: user.username,
            avatarURI: user.avatarURI
              ? IPFSService.formatIPFSUrl(user.avatarURI)
              : null,
            followedAt: follow.createdAt,
          };
        })
      );

      // Filter out nulls
      const filteredFollowers = followerDetails.filter(
        (follower) => follower !== null
      );

      // Lấy tổng số followers để phân trang
      const total = await Follow.countDocuments({
        following: address,
      });

      return {
        success: true,
        data: {
          followers: filteredFollowers,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting followers:", error);
      return { success: false, message: "Failed to get followers", error };
    }
  }

  /**
   * Lấy danh sách người được theo dõi (following) của một user
   * @param {string} address - Địa chỉ ví của user cần lấy danh sách following
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng item trên một trang
   * @returns {object} Kết quả xử lý
   */
  async getUserFollowing(address, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Lấy danh sách following
      const following = await Follow.find({
        follower: address,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy thông tin chi tiết của mỗi người đang follow
      const followingDetails = await Promise.all(
        following.map(async (follow) => {
          const user = await User.findOne({
            walletAddress: follow.following,
          });

          if (!user) return null;

          return {
            walletAddress: user.walletAddress,
            username: user.username,
            avatarURI: user.avatarURI
              ? IPFSService.formatIPFSUrl(user.avatarURI)
              : null,
            followedAt: follow.createdAt,
          };
        })
      );

      // Filter out nulls
      const filteredFollowing = followingDetails.filter(
        (user) => user !== null
      );

      // Lấy tổng số following để phân trang
      const total = await Follow.countDocuments({
        follower: address,
      });

      return {
        success: true,
        data: {
          following: filteredFollowing,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting following:", error);
      return { success: false, message: "Failed to get following", error };
    }
  }
}

module.exports = new FollowService();