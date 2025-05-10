const { User, Post, Like, SavePost } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const { formatPostResponse, createPaginationObject } = require("./utils");

/**
 * Like bài đăng
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {String} postId - ID bài đăng
 * @returns {Object} Kết quả like bài đăng
 */
const likePost = async (address, postId) => {
  try {
    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findById(postId);
    if (!post || post.status !== "active") {
      return { success: false, status: 404, message: "Post not found" };
    }

    // Kiểm tra đã like chưa
    const existingLike = await Like.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (existingLike) {
      return { success: false, status: 400, message: "Post already liked" };
    }

    // Tạo like mới
    await Like.create({
      user: address.toLowerCase(),
      postId,
      createdAt: new Date(),
    });

    // Cập nhật likeCount của bài đăng
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });

    return {
      success: true,
      status: 200,
      message: "Post liked successfully",
      data: {
        postId,
        postAuthor: post.author,
      },
    };
  } catch (error) {
    console.error("Error liking post:", error);
    return {
      success: false,
      status: 500,
      message: "Error liking post",
      error: error.message,
    };
  }
};

/**
 * Unlike bài đăng
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {String} postId - ID bài đăng
 * @returns {Object} Kết quả unlike bài đăng
 */
const unlikePostService = async (address, postId) => {
  try {
    const existingLike = await Like.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (!existingLike) {
      return { success: false, status: 400, message: "Post not liked" };
    }

    await Like.deleteOne({ user: address.toLowerCase(), postId });
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });

    return {
      success: true,
      status: 200,
      message: "Post unliked successfully",
      data: { postId },
    };
  } catch (error) {
    console.error("Error unliking post:", error);
    return {
      success: false,
      status: 500,
      message: "Error unliking post",
      error: error.message,
    };
  }
};

/**
 * Lưu bài đăng
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {String} postId - ID bài đăng
 * @returns {Object} Kết quả lưu bài đăng
 */
const savePostService = async (address, postId) => {
  try {
    const post = await Post.findById(postId);

    if (!post || post.status !== "active") {
      return { success: false, status: 404, message: "Post not found" };
    }

    const existingSave = await SavePost.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (existingSave) {
      return { success: false, status: 400, message: "Post already saved" };
    }

    await SavePost.create({
      user: address.toLowerCase(),
      postId,
      createdAt: new Date(),
    });

    await Post.updateOne({ _id: postId }, { $inc: { saveCount: 1 } });

    return {
      success: true,
      status: 200,
      message: "Post saved successfully",
      data: { postId },
    };
  } catch (error) {
    console.error("Error saving post:", error);
    return {
      success: false,
      status: 500,
      message: "Error saving post",
      error: error.message,
    };
  }
};

/**
 * Bỏ lưu bài đăng
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {String} postId - ID bài đăng
 * @returns {Object} Kết quả bỏ lưu bài đăng
 */
const unsavePostService = async (address, postId) => {
  try {
    const existingSave = await SavePost.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (!existingSave) {
      return { success: false, status: 404, message: "Post not saved" };
    }

    await SavePost.deleteOne({
      user: address.toLowerCase(),
      postId,
    });

    await Post.updateOne({ _id: postId }, { $inc: { saveCount: -1 } });

    return {
      success: true,
      status: 200,
      message: "Post unsaved successfully",
      data: { postId },
    };
  } catch (error) {
    console.error("Error unsaving post:", error);
    return {
      success: false,
      status: 500,
      message: "Error unsaving post",
      error: error.message,
    };
  }
};

/**
 * Lấy danh sách bài đăng đã lưu
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Giới hạn kết quả
 * @returns {Object} Danh sách bài đăng đã lưu
 */
const getSavePostsService = async (address, page, limit) => {
  try {
    const skip = (page - 1) * limit;

    // Tìm tất cả bài đã lưu
    const SavePosts = await SavePost.find({ user: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Dùng `lean()` để giảm tải bộ nhớ

    if (!SavePosts.length) {
      return {
        success: true,
        status: 200,
        data: { posts: [], pagination: { total: 0, page, limit, pages: 0 } },
        message: "No saved posts found",
      };
    }

    // Lấy danh sách postId để tối ưu truy vấn
    const postIds = SavePosts.map((saved) => saved.postId);
    const posts = await Post.find({
      _id: { $in: postIds },
      status: "active",
    }).lean();

    // Lấy danh sách tác giả để tối ưu
    const authorIds = posts.map((post) => post.author);
    const authors = await User.find({ walletAddress: { $in: authorIds } })
      .select("walletAddress username avatarURI isVerified")
      .lean();

    // Tạo Map cho authors để truy cập nhanh hơn
    const authorMap = new Map(
      authors.map((author) => [author.walletAddress, author])
    );

    // Lấy danh sách bài viết yêu thích
    const likedPosts = await Like.find({
      user: address.toLowerCase(),
      postId: { $in: postIds },
    })
      .select("postId")
      .lean();
    const likedPostIds = new Set(
      likedPosts.map((like) => like.postId.toString())
    );

    // Xây dựng danh sách post trả về
    const SavePostDetails = SavePosts.map((saved) => {
      const post = posts.find(
        (p) => p._id.toString() === saved.postId.toString()
      );
      if (!post) return null;

      const author = authorMap.get(post.author) || null;

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
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        saveCount: post.saveCount,
        isLiked: likedPostIds.has(post._id.toString()),
        isSaved: true,
        savedAt: saved.createdAt,
        createdAt: post.createdAt,
      };
    }).filter((post) => post !== null);

    // Đếm tổng số bài viết đã lưu
    const total = await SavePost.countDocuments({
      user: address.toLowerCase(),
    });

    return {
      success: true,
      status: 200,
      data: {
        posts: SavePostDetails,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Saved posts retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting saved posts:", error);
    return {
      success: false,
      status: 500,
      message: "Error getting saved posts",
      error: error.message,
    };
  }
};

module.exports = {
  likePost,
  unlikePostService,
  savePostService,
  unsavePostService,
  getSavePostsService,
};