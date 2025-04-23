// services/post.services.js
const { User, Post, SavePost, Like } = require("../models/index");
const IPFSService = require("./ipfs.services");
const NFTService = require("./nft.services");
const { getPostsWithDetails } = require("../utils/getPostDetails.utils");
const axios = require("axios");

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
  }
  /**
   * Tìm kiếm thông tin người dùng từ chuỗi mention có @
   * @param {String} mention - Chuỗi mention có thể bắt đầu bằng @, ví dụ: "@username"
   * @returns {Promise<Object>} - Thông tin người dùng bao gồm username và địa chỉ ví
   */
  async findUserFromMention(mention) {
    try {
      // Loại bỏ ký tự @ nếu có
      const username = mention.startsWith("@") ? mention.substring(1) : mention;

      // Tìm kiếm user dựa trên username
      const user = await User.findOne({ username });

      if (!user) {
        return null;
      }

      // Trả về thông tin cần thiết
      return {
        username: user.username,
        walletAddress: user.walletAddress,
      };
    } catch (error) {
      console.error("Error finding user from mention:", error);
      return null;
    }
  }

  /**
   * Xử lý danh sách các mentions và chuyển đổi thành thông tin người dùng
   * @param {Array<String>} mentions - Mảng các chuỗi mention (có thể có hoặc không có @)
   * @returns {Promise<Array<Object>>} - Mảng thông tin người dùng
   */
  async processMentions(mentions) {
    if (!mentions || !Array.isArray(mentions) || mentions.length === 0) {
      return [];
    }

    try {
      // Xử lý từng mention và lấy thông tin người dùng
      const usersPromises = mentions.map((mention) =>
        this.findUserFromMention(mention)
      );

      // Đợi tất cả các promises hoàn thành
      const users = await Promise.all(usersPromises);

      // Lọc bỏ các kết quả null (không tìm thấy user)
      return users.filter((user) => user !== null);
    } catch (error) {
      console.error("Error processing mentions:", error);
      return [];
    }
  }

  async createPost(content, tags, mentions, address, mediaObjects) {
    try {
      // Validate input
      if (!content && (!mediaObjects || mediaObjects.length === 0)) {
        return {
          success: false,
          status: 400,
          message: "Post must contain either content or media",
        };
      }

      const user = await User.findOne({ walletAddress: address });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: "User not found",
        };
      }

      // Xử lý mentions để có thông tin đầy đủ
      const processedMentions = await this.processMentions(mentions || []);

      // Tạo metadata và upload lên IPFS
      const mediaCIDs = mediaObjects.map((media) =>
        media.uri.replace("ipfs://", "")
      );

      const postMetadata = IPFSService.createPostMetadata(
        content || "",
        mediaCIDs,
        tags || [],
        processedMentions.map((user) => user.username) // Chỉ lưu username trong metadata
      );

      const metadataCID = await IPFSService.uploadJSON(postMetadata);

      // Tạo post với mentions đã xử lý
      const newPost = new Post({
        author: address.toLowerCase(),
        content: content || "",
        contentURI: `ipfs://${metadataCID}`,
        media: mediaObjects,
        tags: tags || [],
        mentions: processedMentions, // Lưu thông tin đầy đủ của mentions
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        viewCount: 0,
        status: "active",
        createdAt: new Date(),
      });

      await newPost.save();

      // Cập nhật postCount của user
      await User.updateOne(
        { walletAddress: address.toLowerCase() },
        { $inc: { "socialStats.postCount": 1 } }
      );

      return {
        success: true,
        status: 201,
        message: "Post created successfully",
        data: {
          id: newPost._id,
          username: user.username,
          author: newPost.author,
          content: newPost.content,
          contentURI: newPost.contentURI,
          media: newPost.media,
          tags: newPost.tags,
          mentions: processedMentions,
          likeCount: newPost.likeCount,
          commentCount: newPost.commentCount,
          saveCount: newPost.saveCount,
          createdAt: newPost.createdAt,
        },
      };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        status: 500,
        message: "Error creating post",
        error: error.message,
      };
    }
  }

  async getAllPosts(page, skip, limit) {
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
  }

  async getTrendingPosts(page, limit, currentUserAddress = null) {
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
  }

  async unlikePostService(address, postId) {
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
  }

  async savePostService(address, postId) {
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
  }

  async unsavePostService(address, postId) {
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
  }
  async getSavePostsService(address, page, limit) {
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
  }

  /**
   * Chuyển đổi media từ bài viết thành NFT
   */
  async createNFTFromPostMedia(postId, mediaIndex, userAddress, nftMetadata) {
    try {
      // Kiểm tra bài đăng có tồn tại không
      const post = await Post.findById(postId);
      if (!post || post.status !== "active") {
        return { 
          success: false, 
          status: 404, 
          message: "Post not found" 
        };
      }
  
      // Kiểm tra media có tồn tại không
      if (!post.media || !post.media[mediaIndex]) {
        return { 
          success: false, 
          status: 404, 
          message: "Media not found in post" 
        };
      }
  
      // Kiểm tra người dùng có phải là tác giả của bài viết không
      if (post.author.toLowerCase() !== userAddress.toLowerCase()) {
        return { 
          success: false, 
          status: 403, 
          message: "Only the post author can create NFT from this media" 
        };
      }
  
      // Lấy thông tin media
      const media = post.media[mediaIndex];
      const mediaUri = media.uri; // ipfs://CID
      const mimetype = media.mimeType;
      const originalname =
        media.filename || `media-${mediaIndex}.${mimetype.split("/")[1]}`;
  
      // Lấy CID từ URI
      const ipfsCid = IPFSService.parseIPFSUri(mediaUri);
      
      // Tạo gateway URL để tải file
      const ipfsGatewayUrl = IPFSService.formatIPFSUrl(mediaUri);
  
      // Tải file từ IPFS gateway
      const response = await axios.get(ipfsGatewayUrl, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(response.data);
  
      // Tạo NFT
      const nftResult = await NFTService.mintNFT(
        nftMetadata,
        userAddress,
        fileBuffer,
        mimetype,
        originalname
      );
  
      // Cập nhật bài viết với thông tin NFT
      await Post.findByIdAndUpdate(postId, {
        $push: {
          nfts: {
            tokenId: nftResult.tokenId,
            mediaIndex,
            mintedAt: new Date()
          }
        }
      });
  
      return {
        success: true,
        status: 201,
        message: "NFT created successfully from post media",
        data: {
          tokenId: nftResult.tokenId,
          name: nftResult.name,
          description: nftResult.description,
          imageUrl: ipfsGatewayUrl,
          mediaType: nftResult.mediaType,
          royaltyPercent: nftResult.royaltyPercent,
          txHash: nftResult.txHash,
          postId: post._id
        }
      };
    } catch (error) {
      console.error("Error creating NFT from post media:", error);
      return { 
        success: false, 
        status: 500, 
        message: "Error creating NFT", 
        error: error.message 
      };
    }
  }

  /**
   * Đăng bán NFT đã tạo từ bài viết
   */
  async listNFTFromPost(tokenId, price, userAddress, postId) {
    try {
      // Kiểm tra NFT có tồn tại không
      const nftResult = await NFTService.listNFTForSale(
        tokenId,
        price,
        userAddress
      );

      // Cập nhật thông tin NFT trong bài viết
      await Post.updateOne(
        { _id: postId, "nfts.tokenId": tokenId },
        {
          $set: {
            "nfts.$.forSale": true,
            "nfts.$.price": price,
            "nfts.$.listedAt": new Date(),
          },
        }
      );

      return {
        success: true,
        status: 200,
        message: "NFT listed for sale successfully",
        data: {
          tokenId: nftResult.tokenId,
          price: nftResult.price,
          txHash: nftResult.txHash,
          postId,
        },
      };
    } catch (error) {
      console.error("Error listing NFT for sale:", error);
      return {
        success: false,
        status: 500,
        message: "Error listing NFT for sale",
        error: error.message,
      };
    }
  }
}

module.exports = new PostServices();
