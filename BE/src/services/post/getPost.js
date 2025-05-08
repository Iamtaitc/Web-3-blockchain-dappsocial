const { User, Post, Like, SavePost } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const { getPostsWithDetails } = require("../../utils/getPostDetails.utils");
const { formatPostResponse, getPostInteractionStatus, createPaginationObject } = require("./utils");

/**
 * Lấy danh sách bài đăng của một người dùng
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {Number} skip - Số lượng bỏ qua
 * @param {Number} limit - Giới hạn kết quả
 * @returns {Object} Danh sách bài đăng
 */
const getPostsByUser = async (address, skip = 0, limit = 10) => {
  try {
    if (!address) {
      return {
        success: false,
        status: 400,
        message: "Address is required",
      };
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ walletAddress: address });
    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    // Lấy danh sách bài đăng
    const posts = await Post.find({ author: address, status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!posts.length) {
      return {
        success: true,
        status: 200,
        message: "No posts found",
        data: [],
      };
    }

    // Lấy chi tiết bài đăng kèm thông tin tác giả
    const postsWithAuthorDetails = await getPostsWithDetails(posts, user);

    return {
      success: true,
      status: 200,
      message: "Posts retrieved successfully",
      data: postsWithAuthorDetails,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Error getting posts by user",
      error: error.message,
    };
  }
};

/**
 * Lấy thông tin chi tiết của một bài đăng theo ID
 * @param {String} postId - ID bài đăng
 * @returns {Object} Thông tin bài đăng
 */
const getIdPost = async (postId) => {
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return {
        success: false,
        status: 404,
        message: "Post not found",
        data: null,
      };
    }

    // Tăng lượt xem
    await Post.updateOne({ _id: postId }, { $inc: { viewCount: 1 } });

    return {
      success: true,
      status: 200,
      message: "Post retrieved successfully",
      data: post,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Error getting post by ID",
      error: error.message,
    };
  }
};

/**
 * Lấy tất cả bài đăng
 * @param {Number} page - Trang hiện tại
 * @param {Number} skip - Số lượng bỏ qua
 * @param {Number} limit - Giới hạn kết quả
 * @returns {Object} Danh sách bài đăng
 */
const getAllPosts = async (page, skip, limit) => {
  try {
    const posts = await Post.find({ status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!posts || posts.length === 0) {
      return {
        success: true,
        status: 200,
        message: "No posts found",
        posts: [],
        total: 0,
      };
    }

    // Lấy tổng số bài đăng để phân trang
    const total = await Post.countDocuments({ status: "active" });
    const postsWithAuthorDetails = await getPostsWithDetails(posts);

    return {
      success: true,
      status: 200,
      message: "Posts retrieved successfully",
      posts: postsWithAuthorDetails,
      total,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Error getting all posts",
      error: error.message,
    };
  }
};

/**
 * Lấy danh sách bài đăng thịnh hành
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Giới hạn kết quả
 * @param {String} currentUserAddress - Địa chỉ ví của người dùng hiện tại
 * @returns {Object} Danh sách bài đăng thịnh hành
 */
const getTrendingPosts = async (page, limit, currentUserAddress = null) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const skip = (page - 1) * limit;

    // Tính trending score
    const trendingPosts = await Post.aggregate([
      { $match: { status: "active", createdAt: { $gte: threeDaysAgo } } },
      {
        $addFields: {
          ageInHours: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60,
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
                  { $multiply: ["$likeCount", 3] },
                  { $multiply: ["$commentCount", 2] },
                  "$saveCount",
                  { $divide: ["$viewCount", 10] },
                ],
              },
              { $pow: [{ $add: ["$ageInHours", 2] }, 1.5] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Tổng số bài đăng để phân trang
    const total = await Post.countDocuments({
      status: "active",
      createdAt: { $gte: threeDaysAgo },
    });

    // Lấy thông tin chi tiết của tác giả và trạng thái like/save
    const postsWithDetails = await Promise.all(
      trendingPosts.map(async (post) => {
        const author = await User.findOne({ walletAddress: post.author });
        let isLiked = false;
        let isSaved = false;

        if (currentUserAddress) {
          isLiked = !!(await Like.findOne({
            user: currentUserAddress.toLowerCase(),
            postId: post._id,
          }));
          isSaved = !!(await SavePost.findOne({
            user: currentUserAddress.toLowerCase(),
            postId: post._id,
          }));
        }

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
          contentURI: post.contentURI,
          media: post.media.map((media) => ({
            ...media,
            uri: IPFSService.formatIPFSUrl(media.uri),
          })),
          tags: post.tags,
          mentions: post.mentions,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          saveCount: post.saveCount,
          viewCount: post.viewCount,
          trendingScore: Math.round(post.trendingScore * 100) / 100,
          isLiked,
          isSaved,
          createdAt: post.createdAt,
        };
      })
    );

    return {
      success: true,
      status: 200,
      data: { posts: postsWithDetails, total },
    };
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return {
      success: false,
      status: 500,
      message: "Error getting trending posts",
      error: error.message,
    };
  }
};

module.exports = {
  getPostsByUser,
  getIdPost,
  getAllPosts,
  getTrendingPosts,
};