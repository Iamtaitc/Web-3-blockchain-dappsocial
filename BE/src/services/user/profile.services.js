// services/user/profile.services.js
const { User, Follow } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const blockchainService = require("../blockchain.services");

/**
 * Service xử lý thông tin profile người dùng
 */
class ProfileService {
  /**
   * Lấy thông tin profile của user
   * @param {string} address - Địa chỉ ví của user cần lấy thông tin
   * @param {string} currentUserAddress - Địa chỉ ví của user đang đăng nhập (nếu có)
   * @returns {object} Kết quả xử lý
   */
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
      const subscriptionInfo = await blockchainService.getSubscriptionInfo(
        address.address
      );

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
}

module.exports = new ProfileService();