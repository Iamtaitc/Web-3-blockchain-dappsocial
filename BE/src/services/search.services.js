const { User, Post, NFTCache, Comment, Follow } = require("../models/index");
const AddressUtils = require("../utils/address.utils");
const FormatUtils = require("../utils/format.utils");

/**
 * Service xử lý các chức năng tìm kiếm
 */
class SearchService {
  /**
   * Tạo query cơ bản cho tìm kiếm user
   * @param {String} query - Chuỗi tìm kiếm
   * @returns {Object} Query object cho MongoDB
   * @private
   */
  _createUserSearchQuery(query) {
    return {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { ensName: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ],
      status: "active",
    };
  }

  /**
   * Xác định cách sắp xếp dựa trên sortBy
   * @param {String} sortBy - Loại sắp xếp
   * @param {String} entityType - Loại entity (users, posts, nfts)
   * @returns {Object} Sort object cho MongoDB
   * @private
   */
  _getSortOptions(sortBy, entityType = "users") {
    const sortOptions = {
      users: {
        default: { followerCount: -1 },
        newest: { createdAt: -1 },
        points: { points: -1 },
      },
      posts: {
        default: { createdAt: -1 },
        trending: { trendScore: -1 },
        popular: { "stats.likeCount": -1 },
      },
      nfts: {
        default: { mintedAt: -1 },
        trending: { trendScore: -1 },
        "price-asc": { price: 1 },
        "price-desc": { price: -1 },
      },
    };

    return sortOptions[entityType][sortBy] || sortOptions[entityType].default;
  }

  /**
   * Xử lý lỗi chung cho các hàm trong service
   * @param {Error} error - Lỗi gặp phải
   * @param {String} operation - Tên hoạt động
   * @returns {Object} Response error chuẩn hóa
   * @private
   */
  _handleError(error, operation) {
    console.error(`${operation} error:`, error);
    return {
      success: false,
      status: error.status || 500,
      message: `Lỗi khi ${operation}`,
      error: error.message,
    };
  }
  /**
   * Tìm kiếm tổng hợp (users, posts, NFTs, tags)
   * @param {String} query - Chuỗi tìm kiếm
   * @param {String} type - Loại tìm kiếm (users, posts, nfts, tags)
   * @param {Number} limit - Giới hạn kết quả
   * @param {Number} page - Trang kết quả
   * @param {Object} currentUser - Thông tin user hiện tại
   * @returns {Object} Kết quả tìm kiếm
   */
  async search(query, type, limit, page, currentUser) {
    try {
      const skip = (page - 1) * limit;
      const searchLimit = limit;
      const results = {};

      // Tìm kiếm người dùng
      if (!type || type === "users") {
        const userQuery = this._createUserSearchQuery(query);
        const users = await User.find(userQuery)
          .select(
            "walletAddress username ensName avatarURI bio isVerified followerCount"
          )
          .sort({ followerCount: -1, createdAt: -1 })
          .skip(skip)
          .limit(searchLimit);

        const totalUsers = await User.countDocuments(userQuery);

        results.users = {
          items: users.map((user) => FormatUtils.formatUserData(user)),
          pagination: FormatUtils.createPagination(
            totalUsers,
            page,
            searchLimit
          ),
        };
      }

      // Tìm kiếm bài viết
      if (!type || type === "posts") {
        const postQuery = {
          $or: [
            { content: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
          ],
          status: "active",
        };

        const posts = await Post.find(postQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(searchLimit);

        const totalPosts = await Post.countDocuments(postQuery);
        const postResults = await FormatUtils.formatPostsWithAuthor(
          posts,
          currentUser
        );

        results.posts = {
          items: postResults,
          pagination: FormatUtils.createPagination(
            totalPosts,
            page,
            searchLimit
          ),
        };
      }

      // Tìm kiếm NFTs
      if (!type || type === "nfts") {
        const nfts = await NFTCache.find({
          $or: [
            { "metadata.name": { $regex: query, $options: "i" } },
            { "metadata.description": { $regex: query, $options: "i" } },
          ],
        })
          .sort({ mintedAt: -1 })
          .skip(skip)
          .limit(searchLimit);

        const totalNFTs = await NFTCache.countDocuments({
          $or: [
            { "metadata.name": { $regex: query, $options: "i" } },
            { "metadata.description": { $regex: query, $options: "i" } },
          ],
        });

        results.nfts = {
          items: nfts.map((nft) => FormatUtils.formatNFTData(nft)),
          pagination: FormatUtils.createPagination(
            totalNFTs,
            page,
            searchLimit
          ),
        };
      }

      // Tìm kiếm tags
      if (!type || type === "tags") {
        // Aggregation để lấy tags phổ biến
        const tagsAggregation = await Post.aggregate([
          {
            $match: {
              tags: { $regex: query, $options: "i" },
              status: "active",
            },
          },
          { $unwind: "$tags" },
          { $match: { tags: { $regex: query, $options: "i" } } },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: searchLimit },
        ]);

        results.tags = {
          items: tagsAggregation.map((tag) => ({
            name: tag._id,
            postCount: tag.count,
          })),
        };
      }

      // Tìm kiếm comments
      if (type === "comments") {
        const comments = await Comment.find({
          content: { $regex: query, $options: "i" },
          status: "active",
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(searchLimit);

        const totalComments = await Comment.countDocuments({
          content: { $regex: query, $options: "i" },
          status: "active",
        });

        // Lấy thông tin author và post cho mỗi comment
        const commentResults =
          await FormatUtils.formatCommentsWithAuthor(comments);

        results.comments = {
          items: commentResults,
          pagination: FormatUtils.createPagination(
            totalComments,
            page,
            searchLimit
          ),
        };
      }

      // Tìm kiếm địa chỉ ví
      if (type === "address" && AddressUtils.isValidEthereumAddress(query)) {
        // Chuẩn hóa địa chỉ
        const address = AddressUtils.normalizeAddress(query);

        // Tìm user với địa chỉ này
        const user = await User.findOne({ walletAddress: address });

        if (user) {
          results.addressMatch = {
            found: true,
            user: FormatUtils.formatUserBasicData(user),
          };
        } else {
          results.addressMatch = {
            found: false,
            address,
          };
        }
      }

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm thành công",
        data: results,
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tìm kiếm",
        error: error.message,
      };
    }
  }

  /**
   * Tìm kiếm người dùng
   * @param {String} query - Chuỗi tìm kiếm
   * @param {Number} limit - Giới hạn kết quả
   * @param {Number} page - Trang kết quả
   * @param {String} sortBy - Sắp xếp theo trường
   * @param {Object} currentUser - Thông tin user hiện tại
   * @returns {Object} Kết quả tìm kiếm
   */
  async searchUsers(query, limit, page, sortBy, currentUser) {
    try {
      const skip = (page - 1) * limit;
      const searchQuery = this._createUserSearchQuery(query);
      const sort = this._getSortOptions(sortBy, "users");

      const users = await User.find(searchQuery)
        .select(
          "walletAddress username ensName avatarURI bio isVerified followerCount followingCount subscription.level createdAt"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const totalUsers = await User.countDocuments(searchQuery);
      const formattedUsers = FormatUtils.formatUserListWithFollow(
        users,
        currentUser
      );

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm người dùng thành công",
        data: {
          users: formattedUsers,
          pagination: FormatUtils.createPagination(totalUsers, page, limit),
        },
      };
    } catch (error) {
      return this._handleError(error, "tìm kiếm người dùng");
    }
  }

  /**
   * Tìm kiếm người dùng cho tính năng mention
   * @param {String} keyword - Từ khóa tìm kiếm (không bao gồm @)
   * @param {Number} limit - Giới hạn kết quả (mặc định 5)
   * @param {Object} currentUser - Thông tin user hiện tại
   * @returns {Object} Danh sách gợi ý người dùng
   */
  async searchUserForMention(keyword, limit = 5, currentUser) {
    try {
      // Truy vấn optimized cho prefix search
      // Gợi ý chỉ lấy username bắt đầu bằng keyword
      const query = {
        username: { $regex: `^${keyword}`, $options: "i" },
        status: "active",
      };

      // Chỉ select các trường cần thiết tối thiểu
      const users = await User.find(query)
        .select("_id walletAddress username avatarURI isVerified")
        .limit(limit * 2); // Lấy nhiều hơn để có đủ sau khi sắp xếp ưu tiên

      let prioritizedUsers = [...users];

      // Nếu có current user, thêm logic ưu tiên người dùng đang follow
      if (currentUser && currentUser.walletAddress) {
        // 1. Tìm danh sách người dùng mà currentUser đang follow
        const followingList = await Follow.find({
          follower: currentUser.walletAddress.toLowerCase(),
        }).select("following");

        // Tạo set các địa chỉ ví đang follow để tìm kiếm nhanh
        const followingSet = new Set(followingList.map((f) => f.following));

        // Sắp xếp lại danh sách user: ưu tiên người đang follow lên đầu
        prioritizedUsers.sort((a, b) => {
          const aIsFollowing = followingSet.has(a.walletAddress.toLowerCase());
          const bIsFollowing = followingSet.has(b.walletAddress.toLowerCase());

          if (aIsFollowing && !bIsFollowing) return -1;
          if (!aIsFollowing && bIsFollowing) return 1;
          return 0;
        });

        // Giới hạn lại theo limit ban đầu
        prioritizedUsers = prioritizedUsers.slice(0, limit);
      }

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm mention thành công",
        data: prioritizedUsers.map((user) => ({
          _id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          avatarURI: user.avatarURI,
          isVerified: user.isVerified,
          // Thêm flag để frontend biết đây là người dùng đang follow
          isFollowing:
            currentUser && currentUser.walletAddress
              ? prioritizedUsers.findIndex(
                  (u) =>
                    u.walletAddress.toLowerCase() ===
                    user.walletAddress.toLowerCase()
                ) <
                prioritizedUsers.length / 2
              : false,
        })),
      };
    } catch (error) {
      return this._handleError(error, "tìm kiếm mention");
    }
  }

  /**
   * Xử lý mentions trong nội dung
   * @param {String} content - Nội dung có chứa mentions
   * @returns {Object} Nội dung đã xử lý và danh sách mentions
   */
  async processMentions(content) {
    try {
      // Regex để tìm các mentions trong nội dung
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;

      // Tìm tất cả mentions trong nội dung
      while ((match = mentionRegex.exec(content)) !== null) {
        const username = match[1];
        mentions.push(username);
      }

      // Tìm thông tin người dùng cho mỗi mention
      const userMentions = [];

      for (const username of mentions) {
        const user = await User.findOne({ username, status: "active" }).select(
          "_id walletAddress username"
        );

        if (user) {
          userMentions.push({
            _id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            mentionText: `@${username}`,
          });
        }
      }

      return {
        success: true,
        status: 200,
        message: "Xử lý mentions thành công",
        data: {
          processedContent: content,
          mentions: userMentions,
        },
      };
    } catch (error) {
      return this._handleError(error, "xử lý mentions");
    }
  }

  /**
   * Tìm kiếm posts
   * @param {String} query - Chuỗi tìm kiếm
   * @param {Number} limit - Giới hạn kết quả
   * @param {Number} page - Trang kết quả
   * @param {String} sortBy - Sắp xếp theo trường
   * @param {Boolean} withMedia - Có media
   * @param {Boolean} hasNFT - Có NFT
   * @param {Object} currentUser - Thông tin user hiện tại
   * @returns {Object} Kết quả tìm kiếm
   */
  async searchPosts(
    query,
    limit,
    page,
    sortBy,
    withMedia,
    hasNFT,
    currentUser
  ) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query
      const searchQuery = { status: "active" };

      if (query && query.length >= 2) {
        searchQuery.$or = [
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ];
      }

      if (withMedia === "true") {
        searchQuery["media.0"] = { $exists: true };
      }

      if (hasNFT === "true") {
        searchQuery["linkedNFT"] = { $exists: true };
      }

      // Xác định cách sắp xếp
      let sort = { createdAt: -1 }; // Mặc định: gần đây nhất
      if (sortBy === "trending") {
        sort = { trendScore: -1 };
      } else if (sortBy === "popular") {
        sort = { "stats.likeCount": -1 };
      }

      // Tìm kiếm posts
      const posts = await Post.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const totalPosts = await Post.countDocuments(searchQuery);

      // Format kết quả với thông tin author và user interaction
      const formattedPosts =
        await FormatUtils.formatPostsWithAuthorAndInteractions(
          posts,
          currentUser
        );

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm bài đăng thành công",
        data: {
          posts: formattedPosts,
          pagination: FormatUtils.createPagination(totalPosts, page, limit),
        },
      };
    } catch (error) {
      console.error("Post search error:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tìm kiếm bài đăng",
        error: error.message,
      };
    }
  }

  /**
   * Tìm kiếm NFTs
   * @param {String} query - Chuỗi tìm kiếm
   * @param {Number} limit - Giới hạn kết quả
   * @param {Number} page - Trang kết quả
   * @param {String} sortBy - Sắp xếp theo trường
   * @param {Boolean} forSale - Đang bán
   * @param {String} mediaType - Loại media
   * @param {Number} minPrice - Giá tối thiểu
   * @param {Number} maxPrice - Giá tối đa
   * @returns {Object} Kết quả tìm kiếm
   */
  async searchNFTs(
    query,
    limit,
    page,
    sortBy,
    forSale,
    mediaType,
    minPrice,
    maxPrice
  ) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query
      const searchQuery = {};

      if (query && query.length >= 2) {
        searchQuery.$or = [
          { "metadata.name": { $regex: query, $options: "i" } },
          { "metadata.description": { $regex: query, $options: "i" } },
        ];
      }

      if (forSale === "true") {
        searchQuery.forSale = true;
      }

      if (mediaType) {
        searchQuery.mediaType = mediaType;
      }

      if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = Number(minPrice);
        if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
      }

      // Xác định cách sắp xếp
      let sort = { mintedAt: -1 }; // Mặc định: gần đây nhất
      if (sortBy === "trending") {
        sort = { trendScore: -1 };
      } else if (sortBy === "price-asc") {
        sort = { price: 1 };
      } else if (sortBy === "price-desc") {
        sort = { price: -1 };
      }

      // Tìm kiếm NFTs
      const nfts = await NFTCache.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const totalNFTs = await NFTCache.countDocuments(searchQuery);

      // Format kết quả với thông tin creator và owner
      const formattedNFTs = await FormatUtils.formatNFTsWithUserDetails(nfts);

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm NFT thành công",
        data: {
          nfts: formattedNFTs,
          pagination: FormatUtils.createPagination(totalNFTs, page, limit),
        },
      };
    } catch (error) {
      console.error("NFT search error:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tìm kiếm NFT",
        error: error.message,
      };
    }
  }

  /**
   * Tìm kiếm tags
   * @param {String} query - Chuỗi tìm kiếm
   * @param {Number} limit - Giới hạn kết quả
   * @returns {Object} Kết quả tìm kiếm
   */
  async searchTags(query, limit) {
    try {
      // Tìm tags phổ biến
      const tagsAggregation = await Post.aggregate([
        { $match: { status: "active" } },
        { $unwind: "$tags" },
        { $match: { tags: { $regex: query, $options: "i" } } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);

      const formattedTags = tagsAggregation.map((tag) => ({
        name: tag._id,
        postCount: tag.count,
      }));

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm tags thành công",
        data: formattedTags,
      };
    } catch (error) {
      console.error("Tag search error:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tìm kiếm tags",
        error: error.message,
      };
    }
  }

  /**
   * Lấy trending tags
   * @param {Number} limit - Giới hạn kết quả
   * @returns {Object} Kết quả trending tags
   */
  async getTrendingTags(limit) {
    try {
      // Tìm tags phổ biến trong 7 ngày qua
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const tagsAggregation = await Post.aggregate([
        {
          $match: {
            status: "active",
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);

      const formattedTags = tagsAggregation.map((tag) => ({
        name: tag._id,
        postCount: tag.count,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy trending tags thành công",
        data: formattedTags,
      };
    } catch (error) {
      console.error("Trending tags error:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy trending tags",
        error: error.message,
      };
    }
  }
}

module.exports = new SearchService();
