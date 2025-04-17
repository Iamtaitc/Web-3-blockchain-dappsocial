const { User, Post, SavePost, Like } = require("../models/index");
const IPFSService = require("./ipfs.services");
const ApiResponse = require("../utils/apiResponse.utils");
const { getPostsWithDetails } = require("../utils/getPostDetails.utils");

class PostServices {
  async getPostsByUser(address, skip = 0, limit = 10) {
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
  }
  async getIdPost(postId) {
    try {
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        return {
          success: true,
          status: 400,
          message: "Post not found",
          data: null,
        };
      }
      return {
        success: true,
        status: 200,
        message: "Posts retrieved successfully",
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
  }
  async createPost(content, tags, mentions, address, mediaObjects) {
    try {
      // Tạo metadata và upload lên IPFS
      const mediaCIDs = mediaObjects.map((media) =>
        media.uri.replace("ipfs://", "")
      );
      const postMetadata = IPFSService.createPostMetadata(
        content,
        mediaCIDs,
        tags || [],
        mentions || []
      );
      const metadataCID = await IPFSService.uploadJSON(postMetadata);

      // Tạo post
      const newPost = new Post({
        author: address,
        content,
        contentURI: `ipfs://${metadataCID}`,
        media: mediaObjects,
        tags: tags || [],
        mentions: mentions || [],
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        status: "active",
        createdAt: new Date(),
      });

      await newPost.save();

      // Cập nhật postCount của user
      await User.updateOne(
        { walletAddress: address },
        { $inc: { postCount: 1 } }
      );

      return {
        success: true,
        status: 201,
        message: "Post created successfully",
        data: {
          id: newPost._id,
          author: newPost.author,
          content: newPost.content,
          contentURI: newPost.contentURI,
          media: newPost.media,
          tags: newPost.tags,
          mentions: newPost.mentions,
          likeCount: newPost.likeCount,
          commentCount: newPost.commentCount,
          saveCount: newPost.saveCount,
          createdAt: newPost.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: "Error creating post",
        error: error.message,
      };
    }
  }
  async getPostById(postId) {
    try {
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        ApiResponse.badRequest(res, "Post not found");
      }

      return post;
    } catch (error) {
      throw new Error("Error getting post by ID: " + error);
    }
  }
  async getAllPosts(page, skip, limit) {
    try {
      const posts = await Post.find({ status: "active" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      if (!posts) {
        return {
          success: false,
          status: 400,
          message: "No posts found",
          data: [],
        };
      }

      // Lấy tổng số bài đăng để phân trang
      const total = await Post.countDocuments({ status: "active" });
      const postsWithAuthorDetails = await getPostsWithDetails(posts);
      return {
        success: true,
        status: 201,
        message: "Post created successfully",
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
  }
  async getTrendingPosts(page, ship, limit) {
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

      return {
        success: true,
        status: 200,
        data: { posts: trendingPosts, total },
      };
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      return { success: false, status: 500, message: "Server error" };
    }
  }
  async likePost(address, postId) {
    try {
      // Kiểm tra bài đăng có tồn tại không
      const post = await Post.findById(postId);
      if (!post || post.status !== "active") {
        return { success: false, status: 404, message: "Post not found" };
      }

      // Kiểm tra đã like chưa
      const existingLike = await Like.findOne({
        user: address,
        postId,
      });

      if (existingLike) {
        return { success: false, status: 400, message: "Post already liked" };
      }

      // Tạo like mới
      await Like.create({
        user: address,
        postId,
        createdAt: new Date(),
      });

      // Cập nhật likeCount của bài đăng
      await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });

      return {
        success: true,
        status: 200,
        message: "Post liked successfully",
        data: { postId },
      };
    } catch (error) {
      console.error("Error liking post:", error);
      return { success: false, status: 500, message: "Server error" };
    }
  }
  async unlikePostService(address, postId) {
    try {
      const existingLike = await Like.findOne({
        user: address,
        postId,
      });

      if (!existingLike) {
        return { success: false, status: 400, message: "Post not liked" };
      }

      await Like.deleteOne({ user: address, postId });
      await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });

      return {
        success: true,
        status: 200,
        message: "Post unliked successfully",
        data: { postId },
      };
    } catch (error) {
      console.error("Error unliking post:", error);
      return { success: false, status: 500, message: "Server error" };
    }
  }
  async savePostService(address, postId) {
    try {
      const post = await Post.findById(postId);

      if (!post || post.status !== "active") {
        return { success: false, status: 404, message: "Post not found" };
      }

      const existingSave = await SavePost.findOne({
        user: address,
        postId,
      });

      if (existingSave) {
        return { success: false, status: 400, message: "Post already saved" };
      }

      await SavePost.create({
        user: address,
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
      return { success: false, status: 500, message: "Server error" };
    }
  }
  async unsavePostService(address, postId) {
    try {
      const existingSave = await SavePost.findOne({
        user: address,
        postId,
      });

      if (!existingSave) {
        return { success: false, status: 404, message: "Post not saved" };
      }

      await SavePost.deleteOne({
        user: address,
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
      return { success: false, status: 500, message: "Server error" };
    }
  }
  async getSavePostsService(address, page, limit) {
    try {
      const skip = (page - 1) * limit;

      // Tìm tất cả bài đã lưu
      const SavePosts = await SavePost.find({ user: address })
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
        user: address,
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
        user: address,
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
      return { success: false, status: 500, message: "Server error" };
    }
  }
}

module.exports = new PostServices();
