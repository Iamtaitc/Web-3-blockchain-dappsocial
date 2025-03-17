const { User, Follow } = require("../models/index");
const ipfsService = require("../services/ipfs.services");
const blockchainService = require("../services/blockchain.services");
const { validationResult } = require("express-validator");
const { response } = require("../utils/ApiResponse.utils");

class UserManagerController {
  async getUserProfile(req, res) {
    try {
      const { address } = req.params;

      // Tìm user trong database
      const user = await User.findOne({
        walletAddress: address.toLowerCase(),
      });

      if (!user) {
        return response.notFound(res, "User not found");
      }

      // Lấy thông tin subscription từ blockchain
      const subscriptionInfo =
        await blockchainService.getSubscriptionInfo(address);

      // Cập nhật thông tin subscription trong database nếu cần
      if (subscriptionInfo.isActive) {
        await User.updateOne(
          { walletAddress: address.toLowerCase() },
          {
            "subscription.level": subscriptionInfo.level,
            "subscription.expiration": subscriptionInfo.expiration,
          }
        );
      }

      // Kiểm tra nếu người dùng hiện tại follow user này
      let isFollowing = false;
      if (req.user) {
        const follow = await Follow.findOne({
          follower: req.user.address.toLowerCase(),
          following: address.toLowerCase(),
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
          ? ipfsService.formatIPFSUrl(user.avatarURI)
          : null,
        coverURI: user.coverURI
          ? ipfsService.formatIPFSUrl(user.coverURI)
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

      response.success(res, "User profile retrieved successfully", userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      response.serverError(res, "Failed to retrieve user profile");
    }
  }
  async updateProfile(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response.badRequest(res, { errors: errors.array() });
      }

      const { username, bio } = req.body;
      const address = req.user.address;

      // Kiểm tra xem username đã tồn tại chưa
      if (username) {
        const existingUser = await User.findOne({
          username,
          walletAddress: { $ne: address.toLowerCase() },
        });

        if (existingUser) {
          return response.badRequest(res, "Username already exists");
        }
      }

      // Update profile
      let avatarCID, coverCID;

      // Upload avatar nếu có
      if (req.files && req.files.avatar) {
        avatarCID = await ipfsService.uploadFile(
          req.files.avatar.data,
          req.files.avatar.name
        );
      }

      // Upload cover nếu có
      if (req.files && req.files.cover) {
        coverCID = await ipfsService.uploadFile(
          req.files.cover.data,
          req.files.cover.name
        );
      }

      // Lấy thông tin user hiện tại
      const currentUser = await User.findOne({
        walletAddress: address.toLowerCase(),
      });

      // Tạo metadata và upload lên IPFS
      const profileMetadata = ipfsService.createProfileMetadata(
        username || currentUser.username,
        bio || currentUser.bio,
        avatarCID || currentUser.avatarURI,
        coverCID || currentUser.coverURI
      );

      const metadataCID = await ipfsService.uploadJSON(profileMetadata);

      // Update user trong database
      const updatedUser = await User.findOneAndUpdate(
        { walletAddress: address.toLowerCase() },
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

      response.success(res, "Profile updated successfully", updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      response.serverError(res, "Error", error);
    }
  }

  async followUser(req, res) {
    try {
      const { address } = req.params;
      const followerAddress = req.user.address;

      // Không thể follow chính mình
      if (address.toLowerCase() === followerAddress.toLowerCase()) {
        return response.badRequest(res, "Cannot follow yourself");
      }

      // Kiểm tra user có tồn tại không
      const userToFollow = await User.findOne({
        walletAddress: address.toLowerCase(),
      });

      if (!userToFollow) {
        return response.notFound(res, "User not found");
      }

      // Kiểm tra đã follow chưa
      const existingFollow = await Follow.findOne({
        follower: followerAddress.toLowerCase(),
        following: address.toLowerCase(),
      });

      if (existingFollow) {
        return response.badRequest(res, "Already following this user");
      }

      // Tạo follow mới
      await Follow.create({
        follower: followerAddress.toLowerCase(),
        following: address.toLowerCase(),
        createdAt: new Date(),
      });

      // Cập nhật follower và following count
      await User.updateOne(
        { walletAddress: address.toLowerCase() },
        { $inc: { followerCount: 1 } }
      );

      await User.updateOne(
        { walletAddress: followerAddress.toLowerCase() },
        { $inc: { followingCount: 1 } }
      );

      response.status(res, "Following", address);
    } catch (error) {
      console.error("Error following user:", error);
      response.serverError(res, { error: error });
    }
  }
  async unfollowUser(req, res) {
    try {
      const { address } = req.params;
      const followerAddress = req.user.address;

      // Kiểm tra follow có tồn tại không
      const existingFollow = await Follow.findOne({
        follower: followerAddress.toLowerCase(),
        following: address.toLowerCase(),
      });

      if (!existingFollow) {
        return response.notFound(res, "Follow not found");
      }

      // Xóa follow
      await Follow.deleteOne({
        follower: followerAddress.toLowerCase(),
        following: address.toLowerCase(),
      });

      // Cập nhật follower và following count
      await User.updateOne(
        { walletAddress: address.toLowerCase() },
        { $inc: { followerCount: -1 } }
      );

      await User.updateOne(
        { walletAddress: followerAddress.toLowerCase() },
        { $inc: { followingCount: -1 } }
      );

      response.status(res, "Unfollowed", address);
    } catch (error) {
      console.error("Error unfollowing user:", error);
      response.serverError(error);
    }
  }
  async getUserFollowers(req, res) {
    try {
      const { address } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Lấy danh sách followers
      const followers = await Follow.find({
        following: address.toLowerCase(),
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
              ? ipfsService.formatIPFSUrl(user.avatarURI)
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
        following: address.toLowerCase(),
      });

      response.status(
        res,
        { followers: filteredFollowers },
        {
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        }
      );
    } catch (error) {
      console.error("Error getting followers:", error);
      response.serverError(res, { error: error });
    }
  }
  async getUserFollowing(req, res) {
    try {
      const { address } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Lấy danh sách following
      const following = await Follow.find({
        follower: address.toLowerCase(),
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
              ? ipfsService.formatIPFSUrl(user.avatarURI)
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
        follower: address.toLowerCase(),
      });

      response.status(
        res,
        {
          following: filteredFollowing,
        },
        {
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        }
      );
    } catch (error) {
      console.error("Error getting following:", error);
      response.serverError(res, { error: error });
    }
  }
  async getLeaderboard(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
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
          ? ipfsService.formatIPFSUrl(user.avatarURI)
          : null,
        points: user.points,
        followerCount: user.followerCount,
        postCount: user.postCount,
        subscriptionLevel: user.subscription?.level || 1,
      }));

      // Lấy tổng số users để phân trang
      const total = await User.countDocuments({ status: "active" });

      res.status(200).json({
        leaderboard,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      response.serverError(res, { error: error });
    }
  }
}
