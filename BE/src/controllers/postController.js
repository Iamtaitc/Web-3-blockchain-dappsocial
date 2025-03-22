const { validationResult } = require("express-validator");
const postService = require("../services/post.services");
const ApiResponse = require("../utils/ApiResponse.utils");
const { processMediaFiles } = require("../utils/mediaHelper.utils");
const { SavedPost, Like } = require("../models/index");
const notificationService = require("../services/notification.services");

class PostController {
  async getPostUser(req, res, next) {
    try {
      const { address } = req.params;
      const posts = await postService.getPostsByUser(address);
      ApiResponse.success(res, posts, "Get posts by user successfully");
    } catch (error) {
      console.error("Error getting posts by user:", error);
      ApiResponse.error(res, "Server error", error);
    }
  }
  async getIdPost(req, res, next) {
    try {
      const { postId } = req.params;
      const post = await postService.getIdPost(postId);
      ApiResponse.success(res, post, "Get post by id successfully");
    } catch (error) {
      console.error("Error getting post by id:", error);
      ApiResponse.error(res, "Server error", error);
    }
  }
  async createPost(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, tags, mentions } = req.body;
      const address = req.user.address;

      // 📌 Xử lý upload file trước khi gửi đến service
      const mediaObjects = await processMediaFiles(req.files?.media);

      // Gửi data đến service
      const newPost = await postService.createPost(
        content,
        tags,
        mentions,
        address,
        mediaObjects
      );

      // Format ApiResponse
      const postApiResponse = {
        id: newPost._id,
        author: newPost.author,
        content: newPost.content,
        contentURI: newPost.contentURI,
        media: newPost.mediaObjects,
        tags: newPost.tags,
        mentions: newPost.mentions,
        likeCount: newPost.likeCount,
        commentCount: newPost.commentCount,
        saveCount: newPost.saveCount,
        createdAt: newPost.createdAt,
      };

      ApiResponse.status(res, postApiResponse, "Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      ApiResponse.error(res, "Server error", error);
    }
  }
  async getAllPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Lấy danh sách bài đăng
      await postService.getAllPosts(page, skip, limit);

      ApiResponse.status(
        res,
        {
          posts: postsWithAuthorDetails,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
        "Get all posts successfully"
      );
    } catch (error) {
      console.error("Error getting posts:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getTrendingPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const address = req.user?.address || null;

      const result = await postService.getTrendingPosts(page, limit);
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.status);
      }

      const { posts, total } = result.data;

      // Lấy thông tin chi tiết của tác giả và trạng thái like/save
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const author = await User.findOne({ walletAddress: post.author });
          let isLiked = false;
          let isSaved = false;

          if (address) {
            isLiked = !!(await Like.findOne({
              user: address.toLowerCase(),
              postId: post._id,
            }));
            isSaved = !!(await SavedPost.findOne({
              user: address.toLowerCase(),
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
                    ? ipfsService.formatIPFSUrl(author.avatarURI)
                    : null,
                  isVerified: author.isVerified,
                }
              : null,
            content: post.content,
            contentURI: post.contentURI,
            media: post.media.map((media) => ({
              ...media,
              uri: ipfsService.formatIPFSUrl(media.uri),
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

      return ApiResponse.success(
        res,
        {
          posts: postsWithDetails,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
        "Get trending posts successfully"
      );
    } catch (error) {
      console.error("Error getting trending posts:", error);
      return ApiResponse.error(res, "Server error", 500);
    }
  }
  async likePost(req, res) {
    const { postId } = req.params;
    const userAddress = req.user.address;

    const result = await postService.likePost(userAddress, postId);

    await notificationService.createNotification({
      recipient: postId,
      type: "Like",
      sender: userAddress,
      content: `${userAddress} liked your post`,
      targetType: "Post",
      targetId: postId,
      createdAt: new Date(),
    });
    if (result.success) {
      return ApiResponse.success(
        res,
        result.data,
        result.message,
        result.status
      );
    }

    return ApiResponse.error(res, result.message, result.status);
  }
  async unlikePost(req, res) {
    const { postId } = req.params;
    const userAddress = req.user.address;

    const result = await postService.unlikePostService(userAddress, postId);

    if (result.success) {
      return ApiResponse.success(
        res,
        result.data,
        result.message,
        result.status
      );
    }

    return ApiResponse.error(res, result.message, result.status);
  }
  async savePost(req, res) {
    const { postId } = req.params;
    const address = req.user.address;

    const result = await postService.savePostService(address, postId);

    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status);
    }

    return ApiResponse.success(res, result.data, result.message, result.status);
  }
  async unsavePost(req, res) {
    const { postId } = req.params;
    const address = req.user.address;

    const result = await postService.unsavePostService(address, postId);

    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status);
    }

    return ApiResponse.success(res, result.data, result.message, result.status);
  }
  async getSavedPosts(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const address = req.user.address;

    const result = await postService.getSavedPostsService(address, page, limit);

    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status);
    }

    return ApiResponse.success(res, result.data, result.message, result.status);
  }
}

module.exports = new PostController();
