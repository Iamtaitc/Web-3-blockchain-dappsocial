const User = require("../models/User");
const Follow = require("../models/Follow");
const ipfsService = require("../services/ipfsService");
const blockchainService = require("../services/blockchainService");
const { validationResult } = require("express-validator");

// Lấy profile người dùng
exports.getUserProfile = async (req, res) => {
  try {
    const { address } = req.params;

    // Tìm user trong database
    const user = await User.findOne({
      walletAddress: address.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
      coverURI: user.coverURI ? ipfsService.formatIPFSUrl(user.coverURI) : null,
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

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
        return res.status(400).json({ error: "Username already taken" });
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
          avatarURI: avatarCID ? `ipfs://${avatarCID}` : currentUser.avatarURI,
          coverURI: coverCID ? `ipfs://${coverCID}` : currentUser.coverURI,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        walletAddress: updatedUser.walletAddress,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatarURI: updatedUser.avatarURI
          ? ipfsService.formatIPFSUrl(updatedUser.avatarURI)
          : null,
        coverURI: updatedUser.coverURI
          ? ipfsService.formatIPFSUrl(updatedUser.coverURI)
          : null,
        metadataURI: updatedUser.metadataURI,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const { address } = req.params;
    const followerAddress = req.user.address;

    // Không thể follow chính mình
    if (address.toLowerCase() === followerAddress.toLowerCase()) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // Kiểm tra user có tồn tại không
    const userToFollow = await User.findOne({
      walletAddress: address.toLowerCase(),
    });

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await Follow.findOne({
      follower: followerAddress.toLowerCase(),
      following: address.toLowerCase(),
    });

    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
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

    res.status(200).json({
      message: "User followed successfully",
      following: address,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const { address } = req.params;
    const followerAddress = req.user.address;

    // Kiểm tra follow có tồn tại không
    const existingFollow = await Follow.findOne({
      follower: followerAddress.toLowerCase(),
      following: address.toLowerCase(),
    });

    if (!existingFollow) {
      return res.status(400).json({ error: "Not following this user" });
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

    res.status(200).json({
      message: "User unfollowed successfully",
      unfollowed: address,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy danh sách followers
exports.getUserFollowers = async (req, res) => {
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

    res.status(200).json({
      followers: filteredFollowers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy danh sách đang follow
exports.getUserFollowing = async (req, res) => {
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
    const filteredFollowing = followingDetails.filter((user) => user !== null);

    // Lấy tổng số following để phân trang
    const total = await Follow.countDocuments({
      follower: address.toLowerCase(),
    });

    res.status(200).json({
      following: filteredFollowing,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Leaderboard
exports.getLeaderboard = async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
};
