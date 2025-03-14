const Post = require("../models/Post.mongoose");
const User = require("../models/User.mongoose");
const Like = require("../models/Like.mongoose");
const SavedPost = require("../models/SavedPost.mongoose");
const Follow = require("../models/Follow.mongoose");
const ipfsService = require("../services/ipfs.services");
const { validationResult } = require("express-validator");

// Tạo bài đăng mới
exports.createPost = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, tags, mentions } = req.body;
    const address = req.user.address;

    // Upload media lên IPFS nếu có
    let mediaCIDs = [];
    let mediaObjects = [];

    if (req.files && req.files.media) {
      // Hỗ trợ multiple files
      const mediaFiles = Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media];

      for (const file of mediaFiles) {
        const cid = await ipfsService.uploadFile(file.data, file.name);

        mediaCIDs.push(cid);
        mediaObjects.push({
          type: file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
              ? "video"
              : "audio",
          uri: `ipfs://${cid}`,
          mimeType: file.mimetype,
        });
      }
    }

    // Tạo metadata và upload lên IPFS
    const postMetadata = ipfsService.createPostMetadata(
      content,
      mediaCIDs,
      tags || [],
      mentions || []
    );

    const metadataCID = await ipfsService.uploadJSON(postMetadata);

    // Tạo bài đăng trong database
    const newPost = new Post({
      author: address.toLowerCase(),
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
      { walletAddress: address.toLowerCase() },
      { $inc: { postCount: 1 } }
    );

    // Format response
    const postResponse = {
      _id: newPost._id,
      author: newPost.author,
      content: newPost.content,
      contentURI: newPost.contentURI,
      media: newPost.media.map((media) => ({
        ...media,
        uri: ipfsService.formatIPFSUrl(media.uri),
      })),
      tags: newPost.tags,
      mentions: newPost.mentions,
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      createdAt: newPost.createdAt,
    };

    res.status(201).json({
      message: "Post created successfully",
      post: postResponse,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy tất cả bài đăng
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Lấy danh sách bài đăng
    const posts = await Post.find({ status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Lấy thông tin chi tiết của tác giả cho mỗi bài đăng
    const postsWithAuthorDetails = await Promise.all(
      posts.map(async (post) => {
        const author = await User.findOne({ walletAddress: post.author });

        // Kiểm tra nếu user đã đăng nhập đã like/save bài đăng này chưa
        let isLiked = false;
        let isSaved = false;

        if (req.user) {
          const address = req.user.address.toLowerCase();

          // Thực hiện tìm kiếm Like và SavedPost cùng lúc để tối ưu tốc độ
          const [like, saved] = await Promise.all([
            Like.findOne({ user: address, postId: post._id }),
            SavedPost.findOne({ user: address, postId: post._id }),
          ]);

          isLiked = !!like;
          isSaved = !!saved;
        }

        // Đảm bảo luôn return một object hợp lệ
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
          isLiked,
          isSaved,
          createdAt: post.createdAt,
        };
      })
    );

    // Lấy tổng số bài đăng để phân trang
    const total = await Post.countDocuments({ status: "active" });

    res.status(200).json({
      posts: postsWithAuthorDetails,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Tính toán trending score
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Pipeline để tính trending score
    const trendingPosts = await Post.aggregate([
      { $match: { status: "active", createdAt: { $gte: threeDaysAgo } } },
      {
        $addFields: {
          // Thuật toán đơn giản: score = (likes*3 + comments*2 + saves + views/10) / (age in hours + 2)^1.5
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

    // Lấy thông tin chi tiết của tác giả cho mỗi bài đăng
    const postsWithAuthorDetails = await Promise.all(
      trendingPosts.map(async (post) => {
        const author = await User.findOne({
          walletAddress: post.author,
        });

        // Kiểm tra nếu user đã đăng nhập đã like/save bài đăng này chưa
        let isLiked = false;
        let isSaved = false;

        if (req.user) {
          const address = req.user.address;

          const like = await Like.findOne({
            user: address.toLowerCase(),
            postId: post._id,
          });

          const saved = await SavedPost.findOne({
            user: address.toLowerCase(),
            postId: post._id,
          });

          isLiked = !!like;
          isSaved = !!saved;
        }

        // Format response
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

    // Lấy tổng số bài đăng trend để phân trang
    const total = await Post.countDocuments({
      status: "active",
      createdAt: { $gte: threeDaysAgo },
    });

    res.status(200).json({
      posts: postsWithAuthorDetails,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting trending posts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy feed từ những người đang follow
exports.getFollowingFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const address = req.user.address;

    // Lấy danh sách đang follow
    const following = await Follow.find({
      follower: address.toLowerCase(),
    }).select("following");

    const followingAddresses = following.map((f) => f.following);

    // Nếu không follow ai thì trả về empty
    if (followingAddresses.length === 0) {
      return res.status(200).json({
        posts: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      });
    }

    // Lấy bài đăng từ người đang follow
    const posts = await Post.find({
      author: { $in: followingAddresses },
      status: "active",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Lấy thông tin chi tiết của tác giả cho mỗi bài đăng
    const postsWithAuthorDetails = await Promise.all(
      posts.map(async (post) => {
        const author = await User.findOne({
          walletAddress: post.author,
        });

        // Kiểm tra nếu user đã like/save bài đăng này chưa
        const like = await Like.findOne({
          user: address.toLowerCase(),
          postId: post._id,
        });

        const saved = await SavedPost.findOne({
          user: address.toLowerCase(),
          postId: post._id,
        });

        const isLiked = !!like;
        const isSaved = !!saved;

        // Format response
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
          isLiked,
          isSaved,
          createdAt: post.createdAt,
        };
      })
    );

    // Lấy tổng số bài đăng để phân trang
    const total = await Post.countDocuments({
      author: { $in: followingAddresses },
      status: "active",
    });

    res.status(200).json({
      posts: postsWithAuthorDetails,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting following feed:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Like bài đăng
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const address = req.user.address;

    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findById(postId);

    if (!post || post.status !== "active") {
      return res.status(404).json({ error: "Post not found" });
    }

    // Kiểm tra đã like chưa
    const existingLike = await Like.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (existingLike) {
      return res.status(400).json({ error: "Post already liked" });
    }

    // Tạo like mới
    await Like.create({
      user: address.toLowerCase(),
      postId,
      createdAt: new Date(),
    });

    // Cập nhật likeCount của bài đăng
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });

    res.status(200).json({
      message: "Post liked successfully",
      postId,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Unlike bài đăng
exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const address = req.user.address;

    // Kiểm tra like có tồn tại không
    const existingLike = await Like.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (!existingLike) {
      return res.status(400).json({ error: "Post not liked" });
    }

    // Xóa like
    await Like.deleteOne({
      user: address.toLowerCase(),
      postId,
    });

    // Cập nhật likeCount của bài đăng
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });

    res.status(200).json({
      message: "Post unliked successfully",
      postId,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Save bài đăng
exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const address = req.user.address;

    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findById(postId);

    if (!post || post.status !== "active") {
      return res.status(404).json({ error: "Post not found" });
    }

    // Kiểm tra đã save chưa
    const existingSave = await SavedPost.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (existingSave) {
      return res.status(400).json({ error: "Post already saved" });
    }

    // Tạo saved post mới
    await SavedPost.create({
      user: address.toLowerCase(),
      postId,
      createdAt: new Date(),
    });

    // Cập nhật saveCount của bài đăng
    await Post.updateOne({ _id: postId }, { $inc: { saveCount: 1 } });

    res.status(200).json({
      message: "Post saved successfully",
      postId,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Unsave bài đăng
exports.unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const address = req.user.address;

    // Kiểm tra saved post có tồn tại không
    const existingSave = await SavedPost.findOne({
      user: address.toLowerCase(),
      postId,
    });

    if (!existingSave) {
      return res.status(400).json({ error: "Post not saved" });
    }

    // Xóa saved post
    await SavedPost.deleteOne({
      user: address.toLowerCase(),
      postId,
    });

    // Cập nhật saveCount của bài đăng
    await Post.updateOne({ _id: postId }, { $inc: { saveCount: -1 } });

    res.status(200).json({
      message: "Post unsaved successfully",
      postId,
    });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy saved posts của user
exports.getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const address = req.user.address;

    // Lấy danh sách saved posts
    const savedPosts = await SavedPost.find({
      user: address.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Lấy thông tin chi tiết của mỗi bài đăng
    const savedPostDetails = await Promise.all(
      savedPosts.map(async (saved) => {
        const post = await Post.findOne({
          _id: saved.postId,
          status: "active",
        });

        if (!post) return null;

        const author = await User.findOne({
          walletAddress: post.author,
        });

        // Format response
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
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          saveCount: post.saveCount,
          isLiked: await Like.exists({
            user: address.toLowerCase(),
            postId: post._id,
          }),
          isSaved: true,
          savedAt: saved.createdAt,
          createdAt: post.createdAt,
        };
      })
    );

    // Filter out nulls
    const filteredPosts = savedPostDetails.filter((post) => post !== null);

    // Lấy tổng số saved posts để phân trang
    const total = await SavedPost.countDocuments({
      user: address.toLowerCase(),
    });

    res.status(200).json({
      posts: filteredPosts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting saved posts:", error);
    res.status(500).json({ error: "Server error" });
  }
};
