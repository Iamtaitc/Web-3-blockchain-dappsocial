// services/user.services.js
const { User, Follow } = require("../models/index");
const IPFSService = require("./ipfs.services");
const blockchainService = require("./blockchain.services");
const notificationService = require("./notification.services");

class UserServices {
  /**
   * Lấy thông tin profile của user
   * @param {string} address - Địa chỉ ví của user cần lấy thông tin
   * @param {string} currentUserAddress - Địa chỉ ví của user đang đăng nhập (nếu có)
   * @returns {object} Kết quả xử lý
   */
  //TODO done
  async getUserProfile(address, currentUserAddress = null) {
    try {
      // Tìm user trong database
      const user = await User.findOne({
        walletAddress: address.address,
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Lấy thông tin subscription từ blockchain
      const subscriptionInfo =
        await blockchainService.getSubscriptionInfo(address.address);

      // Cập nhật thông tin subscription trong database nếu cần
      if (subscriptionInfo.isActive) {
        await User.updateOne(
          { walletAddress: address },
          {
            "subscription.level": subscriptionInfo.level,
            "subscription.expiration": subscriptionInfo.expiration,
          }
        );
      }

      // Kiểm tra nếu người dùng hiện tại follow user này
      let isFollowing = false;
      if (currentUserAddress) {
        const follow = await Follow.findOne({
          follower: currentUserAddress,
          following: address.address,
        });

        isFollowing = !!follow;
      }

      // Trả về thông tin user
      const userProfile = {
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        bio: user.bio,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        coverURI: user.coverURI
          ? IPFSService.formatIPFSUrl(user.coverURI)
          : null,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        postCount: user.postCount,
        points: user.points,
        subscription: {
          level: subscriptionInfo.level,
          isActive: subscriptionInfo.isActive,
          expiration: subscriptionInfo.expiration,
        },
        isVerified: user.isVerified,
        isFollowing,
        createdAt: user.createdAt,
      };

      return { success: true, data: userProfile };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        success: false,
        message: "Failed to retrieve user profile",
        error,
      };
    }
  }

  /**
   * Cập nhật thông tin profile của user
   * @param {string} address - Địa chỉ ví của user cần cập nhật
   * @param {object} userData - Dữ liệu cập nhật (username, bio,...)
   * @param {object} files - Các file upload (avatar, cover)
   * @returns {object} Kết quả xử lý
   */
  //TODO done
  async updateProfile(address, userData, files) {
    try {
      const { username, bio } = userData;

      // Kiểm tra xem username đã tồn tại chưa
      if (username) {
        const existingUser = await User.findOne({
          username,
          walletAddress: { $ne: address.address },
        });

        if (existingUser) {
          return { success: false, message: "Username already exists" };
        }
      }

      // Lấy thông tin user hiện tại
      const currentUser = await User.findOne({
        walletAddress: address,
      });

      if (!currentUser) {
        return { success: false, message: "User not found" };
      }

      // Upload avatar nếu có
      let avatarCID;
      if (files && files.avatar) {
        avatarCID = await IPFSService.uploadFile(
          files.avatar.data,
          files.avatar.name
        );
      }

      // Upload cover nếu có
      let coverCID;
      if (files && files.cover) {
        coverCID = await IPFSService.uploadFile(
          files.cover.data,
          files.cover.name
        );
      }

      // Tạo metadata và upload lên IPFS
      const profileMetadata = IPFSService.createProfileMetadata(
        username || currentUser.username,
        bio || currentUser.bio,
        avatarCID || currentUser.avatarURI,
        coverCID || currentUser.coverURI
      );

      const metadataCID = await IPFSService.uploadJSON(profileMetadata);

      // Update user trong database
      const updatedUser = await User.findOneAndUpdate(
        { walletAddress: address },
        {
          $set: {
            username: username || currentUser.username,
            bio: bio || currentUser.bio,
            metadataURI: `ipfs://${metadataCID}`,
            avatarURI: avatarCID
              ? `ipfs://${avatarCID}`
              : currentUser.avatarURI,
            coverURI: coverCID ? `ipfs://${coverCID}` : currentUser.coverURI,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      // Định dạng dữ liệu user trả về
      const formattedUser = {
        walletAddress: updatedUser.walletAddress,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatarURI: updatedUser.avatarURI
          ? IPFSService.formatIPFSUrl(updatedUser.avatarURI)
          : null,
        coverURI: updatedUser.coverURI
          ? IPFSService.formatIPFSUrl(updatedUser.coverURI)
          : null,
        metadataURI: updatedUser.metadataURI,
        updatedAt: updatedUser.updatedAt,
      };

      return { success: true, data: formattedUser };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: "Failed to update profile", error };
    }
  }

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

module.exports = new UserServices();
