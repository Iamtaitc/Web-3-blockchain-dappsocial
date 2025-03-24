// src/services/LeaderboardService.js
const { User, Post, NFTCache } = require("../models/index");
const IPFSService = require("./IPFSService");

/**
 * Service xử lý các chức năng bảng xếp hạng
 */
class LeaderboardService {
  /**
   * Lấy bảng xếp hạng người dùng dựa trên điểm số
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} period - Khoảng thời gian (daily, weekly, monthly, alltime)
   * @param {Object} currentUser - Thông tin người dùng hiện tại
   * @returns {Object} Kết quả bảng xếp hạng người dùng
   */
  async getUserLeaderboard(page, limit, period, currentUser) {
    try {
      const skip = (page - 1) * limit;

      // Xác định thời điểm bắt đầu dựa trên period
      let startDate = new Date(0); // Từ đầu thời gian
      if (period === "daily") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "weekly") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "monthly") {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Lấy danh sách người dùng có điểm cao nhất
      const users = await User.find({
        status: "active",
        points: { $gt: 0 },
      })
        .sort({ points: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "walletAddress username ensName avatarURI points followerCount postCount subscription isVerified"
        );

      // Format response
      const leaderboard = users.map((user) => ({
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        points: user.points,
        followerCount: user.followerCount,
        postCount: user.postCount,
        subscriptionLevel: user.subscription?.level || 1,
        isVerified: user.isVerified,
      }));

      // Lấy tổng số người dùng có điểm > 0
      const total = await User.countDocuments({
        status: "active",
        points: { $gt: 0 },
      });

      // Lấy thứ hạng của user hiện tại nếu đã đăng nhập
      let currentUserRank = null;
      if (currentUser) {
        const userAddress = currentUser.address.toLowerCase();
        const currentUserInfo = await User.findOne({
          walletAddress: userAddress,
        });

        if (currentUserInfo && currentUserInfo.points > 0) {
          const higherRankedUsers = await User.countDocuments({
            status: "active",
            points: { $gt: currentUserInfo.points },
          });

          currentUserRank = higherRankedUsers + 1;
        }
      }

      return {
        success: true,
        status: 200,
        message: "Lấy bảng xếp hạng người dùng thành công",
        data: {
          leaderboard,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
          period,
          currentUserRank,
        },
      };
    } catch (error) {
      console.error("Error getting user leaderboard:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy bảng xếp hạng người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Lấy bảng xếp hạng NFT dựa trên giá, lượt thích và lượt xem
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} sortBy - Tiêu chí sắp xếp (value, popularity, recent, trending)
   * @returns {Object} Kết quả bảng xếp hạng NFT
   */
  async getNFTLeaderboard(page, limit, sortBy) {
    try {
      const skip = (page - 1) * limit;

      // Xác định tiêu chí sắp xếp
      let sortCriteria = {};
      if (sortBy === "value") {
        // Sắp xếp theo giá (chỉ NFT đang bán)
        sortCriteria = { forSale: -1, price: -1 };
      } else if (sortBy === "popularity") {
        // Sắp xếp theo lượt thích và xem
        sortCriteria = { likeCount: -1, viewCount: -1 };
      } else if (sortBy === "recent") {
        // Sắp xếp theo thời gian tạo mới nhất
        sortCriteria = { mintedAt: -1 };
      } else {
        // Mặc định là trending score
        sortCriteria = { trendScore: -1 };
      }

      // Lấy danh sách NFT
      const nfts = await NFTCache.find()
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);

      // Format response
      const leaderboard = await Promise.all(
        nfts.map(async (nft) => {
          // Lấy thông tin creator
          const creator = await User.findOne({
            walletAddress: nft.creator.toLowerCase(),
          }).select("username avatarURI isVerified");

          // Lấy thông tin owner
          const owner = await User.findOne({
            walletAddress: nft.owner.toLowerCase(),
          }).select("username avatarURI isVerified");

          return {
            tokenId: nft.tokenId,
            name: nft.metadata.name,
            image: nft.metadata.image
              ? IPFSService.formatIPFSUrl(nft.metadata.image)
              : null,
            creator: {
              address: nft.creator,
              username: creator?.username || "Unknown",
              avatarURI: creator?.avatarURI
                ? IPFSService.formatIPFSUrl(creator.avatarURI)
                : null,
              isVerified: creator?.isVerified || false,
            },
            owner: {
              address: nft.owner,
              username: owner?.username || "Unknown",
              avatarURI: owner?.avatarURI
                ? IPFSService.formatIPFSUrl(owner.avatarURI)
                : null,
              isVerified: owner?.isVerified || false,
            },
            forSale: nft.forSale,
            price: nft.price,
            likeCount: nft.likeCount,
            viewCount: nft.viewCount,
            mintedAt: nft.mintedAt,
          };
        })
      );

      // Lấy tổng số NFT
      const total = await NFTCache.countDocuments();

      return {
        success: true,
        status: 200,
        message: "Lấy bảng xếp hạng NFT thành công",
        data: {
          leaderboard,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
          sortBy,
        },
      };
    } catch (error) {
      console.error("Error getting NFT leaderboard:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy bảng xếp hạng NFT",
        error: error.message,
      };
    }
  }

  /**
   * Lấy bảng xếp hạng bài đăng dựa trên lượt thích, comment và tương tác
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} period - Khoảng thời gian (daily, weekly, monthly, alltime)
   * @returns {Object} Kết quả bảng xếp hạng bài đăng
   */
  async getPostLeaderboard(page, limit, period) {
    try {
      const skip = (page - 1) * limit;

      // Xác định thời điểm bắt đầu dựa trên period
      let startDate = new Date();
      if (period === "daily") {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "weekly") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "monthly") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === "alltime") {
        startDate = new Date(0); // Từ đầu thời gian
      }

      // Tính toán trending score cho bài đăng
      const trendingPosts = await Post.aggregate([
        // Chỉ lấy bài đăng active và trong khoảng thời gian
        {
          $match: {
            status: "active",
            createdAt: { $gte: startDate },
          },
        },

        // Tính toán trending score
        {
          $addFields: {
            // Formula: (likes*3 + comments*2 + saves + views/10) / (age in hours + 2)^1.5
            ageInHours: {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                1000 * 60 * 60, // Convert to hours
              ],
            },
          },
        },
        {
          $addFields: {
            trendingScore: {
              $divide: [
                {
                  $add: [
                    { $multiply: ["$stats.likeCount", 3] },
                    { $multiply: ["$stats.commentCount", 2] },
                    "$stats.saveCount",
                    { $divide: [{ $ifNull: ["$viewCount", 0] }, 10] },
                  ],
                },
                { $pow: [{ $add: ["$ageInHours", 2] }, 1.5] },
              ],
            },
          },
        },

        // Sort by trending score
        { $sort: { trendingScore: -1 } },

        // Paginate
        { $skip: skip },
        { $limit: limit },
      ]);

      // Lấy thông tin authors
      const authorAddresses = [
        ...new Set(trendingPosts.map((post) => post.author)),
      ];
      const authors = await User.find({
        walletAddress: { $in: authorAddresses },
      }).select("walletAddress username avatarURI isVerified");

      const authorsMap = {};
      authors.forEach((author) => {
        authorsMap[author.walletAddress] = author;
      });

      // Format response
      const leaderboard = trendingPosts.map((post) => {
        const author = authorsMap[post.author];

        return {
          _id: post._id,
          author: post.author,
          authorDetails: author
            ? {
                username: author.username,
                avatarURI: author.avatarURI
                  ? IPFSService.formatIPFSUrl(author.avatarURI)
                  : null,
                isVerified: author.isVerified,
              }
            : null,
          content: post.content,
          media:
            post.media && post.media.length > 0
              ? post.media.map((m) => ({
                  ...m,
                  uri: IPFSService.formatIPFSUrl(m.uri),
                }))
              : [],
          stats: post.stats,
          trendingScore: Math.round(post.trendingScore * 100) / 100,
          createdAt: post.createdAt,
        };
      });

      // Lấy tổng số bài đăng thỏa điều kiện
      const total = await Post.countDocuments({
        status: "active",
        createdAt: { $gte: startDate },
      });

      return {
        success: true,
        status: 200,
        message: "Lấy bảng xếp hạng bài đăng thành công",
        data: {
          leaderboard,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
          period,
        },
      };
    } catch (error) {
      console.error("Error getting post leaderboard:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy bảng xếp hạng bài đăng",
        error: error.message,
      };
    }
  }

  /**
   * Lấy bảng xếp hạng các tags phổ biến
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} period - Khoảng thời gian (daily, weekly, monthly, alltime)
   * @returns {Object} Kết quả bảng xếp hạng tags
   */
  async getTagLeaderboard(limit, period) {
    try {
      // Xác định thời điểm bắt đầu dựa trên period
      let startDate = new Date();
      if (period === "daily") {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "weekly") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "monthly") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === "alltime") {
        startDate = new Date(0); // Từ đầu thời gian
      }

      // Lấy các tags phổ biến và số lượng sử dụng
      const popularTags = await Post.aggregate([
        {
          $match: {
            status: "active",
            createdAt: { $gte: startDate },
            tags: { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$tags" },
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 },
            likes: { $sum: "$stats.likeCount" },
            comments: { $sum: "$stats.commentCount" },
            saves: { $sum: "$stats.saveCount" },
          },
        },
        {
          $project: {
            tag: "$_id",
            count: 1,
            likes: 1,
            comments: 1,
            saves: 1,
            score: {
              $add: [
                "$count",
                { $multiply: ["$likes", 0.5] },
                { $multiply: ["$comments", 0.3] },
                { $multiply: ["$saves", 0.2] },
              ],
            },
          },
        },
        { $sort: { score: -1 } },
        { $limit: limit },
      ]);

      // Format response
      const leaderboard = popularTags.map((item) => ({
        tag: item.tag,
        postCount: item.count,
        likes: item.likes,
        comments: item.comments,
        saves: item.saves,
        score: Math.round(item.score * 100) / 100,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy bảng xếp hạng tags thành công",
        data: {
          leaderboard,
          period,
        },
      };
    } catch (error) {
      console.error("Error getting tag leaderboard:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy bảng xếp hạng tags",
        error: error.message,
      };
    }
  }

  /**
   * Lấy thứ hạng của người dùng hiện tại trên leaderboard
   * @param {String} walletAddress - Địa chỉ ví của người dùng
   * @returns {Object} Thông tin thứ hạng
   */
  async getCurrentUserRank(walletAddress) {
    try {
      // Lấy thông tin user hiện tại
      const user = await User.findOne({
        walletAddress: walletAddress.toLowerCase(),
      });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      if (user.points <= 0) {
        return {
          success: true,
          status: 200,
          message: "Người dùng chưa có điểm",
          data: {
            rank: null,
            points: 0,
            message: "User has no points yet",
          },
        };
      }

      // Đếm số người dùng có điểm cao hơn
      const higherRankedUsers = await User.countDocuments({
        status: "active",
        points: { $gt: user.points },
      });

      // Thứ hạng = số người có điểm cao hơn + 1
      const rank = higherRankedUsers + 1;

      // Lấy top 3 (để so sánh)
      const topUsers = await User.find({ status: "active" })
        .sort({ points: -1 })
        .limit(3)
        .select("walletAddress username points");

      // Tính điểm cần để lên hạng tiếp theo
      let pointsToNextRank = null;
      if (rank > 1) {
        const nextRankUser = await User.findOne({
          status: "active",
          points: { $gt: user.points },
        })
          .sort({ points: 1 })
          .select("points");

        if (nextRankUser) {
          pointsToNextRank = nextRankUser.points - user.points;
        }
      }

      return {
        success: true,
        status: 200,
        message: "Lấy thứ hạng người dùng thành công",
        data: {
          rank,
          points: user.points,
          topUsers: topUsers.map((u) => ({
            walletAddress: u.walletAddress,
            username: u.username,
            points: u.points,
          })),
          pointsToNextRank,
        },
      };
    } catch (error) {
      console.error("Error getting user rank:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy thứ hạng người dùng",
        error: error.message,
      };
    }
  }
}

module.exports = new LeaderboardService();
