// controllers/post.controller.js
const { validationResult } = require("express-validator");
const postService = require("../services/post/index");
const ApiResponse = require("../utils/apiResponse.utils");
const { processMediaFiles } = require("../utils/mediaHelper.utils");
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
        return ApiResponse.badRequest(
          res,
          "Invalid input data",
          errors.array()
        );
      }

      // Lấy dữ liệu từ form-data
      const { content } = req.body;

      // Parse tags nếu có (form-data gửi dưới dạng string)
      let tags = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (err) {
          console.warn("Failed to parse tags:", err);
          // Nếu không parse được, có thể xem xét tags là danh sách cách nhau bởi dấu phẩy
          tags = req.body.tags.split(",").map((tag) => tag.trim());
        }
      }

      // Parse mentions nếu có (form-data gửi dưới dạng string)
      let mentions = [];
      if (req.body.mentions) {
        try {
          mentions = JSON.parse(req.body.mentions);
        } catch (err) {
          console.warn("Failed to parse mentions:", err);
          mentions = req.body.mentions
            .split(",")
            .map((mention) => mention.trim());
        }
      }

      const address = req.user.address;

      const mediaObjects = await processMediaFiles(
        req.files?.media || (req.file ? [req.file] : [])
      );

      // Gửi data đến service
      const newPost = await postService.createPost(
        content,
        tags,
        mentions,
        address,
        mediaObjects
      );

      if (!newPost || !newPost.success) {
        return ApiResponse.badRequest(
          res,
          "Failed to create post",
          newPost.error || "Unknown error"
        );
      }

      ApiResponse.success(res, newPost.data, "Post created successfully");
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
      const postAll = await postService.getAllPosts(page, skip, limit);

      ApiResponse.success(
        res,
        {
          posts: postAll.posts,
          pagination: {
            total: postAll.total,
            page,
            limit,
            pages: Math.ceil(postAll.total / limit),
          },
        },
        "Get all posts successfully"
      );
    } catch (error) {
      console.error("Error getting posts:", error);
      ApiResponse.error(res, "Server error", error);
    }
  }

  async getTrendingPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const address = req.user?.address || null;

      const result = await postService.getTrendingPosts(page, limit, address);
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      return ApiResponse.success(
        res,
        {
          posts: result.data.posts,
          pagination: {
            total: result.data.total,
            page,
            limit,
            pages: Math.ceil(result.data.total / limit),
          },
        },
        "Get trending posts successfully"
      );
    } catch (error) {
      console.error("Error getting trending posts:", error);
      return ApiResponse.error(res, "Server error", error);
    }
  }

  async likePost(req, res) {
    try {
      const { postId } = req.params;
      const userAddress = req.user.address;

      const result = await postService.likePost(userAddress, postId);
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      // Tạo thông báo
      await notificationService.createNotification({
        recipient: result.data.postAuthor, // Thêm postAuthor trong kết quả trả về
        type: "like",
        sender: userAddress,
        content: `${userAddress} liked your post`,
        targetType: "post",
        targetId: postId,
      });

      return ApiResponse.success(res, result.data, result.message);
    } catch (error) {
      console.error("Error liking post:", error);
      return ApiResponse.error(res, "Server error", error);
    }
  }

  async unlikePost(req, res) {
    try {
      const { postId } = req.params;
      const userAddress = req.user.address;

      const result = await postService.unlikePostService(userAddress, postId);
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      return ApiResponse.success(res, result.data, result.message);
    } catch (error) {
      console.error("Error unliking post:", error);
      return ApiResponse.error(res, "Server error", error);
    }
  }

  async savePost(req, res) {
    try {
      const { postId } = req.params;
      const address = req.user.address;

      const result = await postService.savePostService(address, postId);
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      return ApiResponse.success(res, result.data, result.message);
    } catch (error) {
      console.error("savePost error:", error);
      return ApiResponse.error(res, "Internal server error", error);
    }
  }

  async unsavePost(req, res) {
    try {
      const { postId } = req.params;
      const address = req.user.address;

      const result = await postService.unsavePostService(address, postId);
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      return ApiResponse.success(res, result.data, result.message);
    } catch (error) {
      console.error("unsavePost error:", error);
      return ApiResponse.error(res, "Internal server error", error);
    }
  }

  async getSavedPosts(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const address = req.user.address;

      const result = await postService.getSavePostsService(
        address,
        page,
        limit
      );
      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      return ApiResponse.success(res, result.data, result.message);
    } catch (error) {
      console.error("getSavedPosts error:", error);
      return ApiResponse.error(res, "Internal server error", error);
    }
  }

  async createNFTFromPostMedia(req, res) {
    try {
      const { postId, mediaIndex } = req.params;
      const { name, description, royaltyPercent } = req.body;
      const userAddress = req.user.address;

      // Gọi service để chuyển đổi media thành NFT
      const result = await postService.createNFTFromPostMedia(
        postId,
        parseInt(mediaIndex),
        userAddress,
        { name, description, royaltyPercent }
      );

      if (!result.success) {
        return ApiResponse.error(res, result.message, result.error);
      }

      return ApiResponse.success(
        res,
        result.data,
        "NFT created successfully from post media"
      );
    } catch (error) {
      console.error("Error creating NFT from post media:", error);
      return ApiResponse.error(res, "Failed to create NFT", error);
    }
  }
  async listNFTpost(req, res) {
    const { tokenId } = req.params;
    const { postId } = req.params;
    const { price } = req.body;
    const userAddress = req.user.address;

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return ApiResponse.badRequest(res, "Giá không hợp lệ");
    }

    postService.listNFTFromPost(tokenId, price, userAddress, postId)
      .then((result) => {
        if (!result.success) {
          return ApiResponse.error(res, result.message, result.error);
        }
        ApiResponse.success(
          res,
          result.data,
          "NFT listed for sale successfully"
        );
      })
      .catch((error) => {
        ApiResponse.error(res, "Error listing NFT for sale", error);
      });
  }
}

module.exports = new PostController();
