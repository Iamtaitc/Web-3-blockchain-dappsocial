const { Comment, Post, User, Like } = require("../models/index");
const IPFSService = require("./ipfs.services");
const notificationService = require("./notification.services");

/**
 * Service xử lý logic nghiệp vụ liên quan đến comments
 */
class CommentService {
  /**
   * Lấy tất cả comments của một bài đăng
   */
  async getPostComments(postId, options = {}, currentUser = null) {
    try {
      const { page = 1, limit = 20, sort = "newest" } = options;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Tìm bài đăng
      const post = await Post.findById(postId);
      if (!post) {
        return {
          success: false,
          status: 404,
          message: "Bài đăng không tồn tại",
        };
      }

      // Xác định cách sắp xếp
      const sortOption = _getSortOption(sort);

      // Lấy comments cấp 1
      const comments = await Comment.find({
        postId,
        parentId: null,
        status: "active",
      })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

      // Lấy thông tin người dùng và like
      const [formattedComments, total] = await Promise.all([
        _formatCommentsWithUserInfo(comments, currentUser),
        Comment.countDocuments({ postId, parentId: null, status: "active" }),
      ]);

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách bình luận thành công",
        data: formattedComments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error("Error in getPostComments:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách bình luận",
      };
    }
  }

  /**
   * Lấy các reply cho một comment
   */
  async getCommentReplies(commentId, options = {}, currentUser = null) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Tìm comment cha
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại",
        };
      }

      // Lấy replies
      const replies = await Comment.find({
        parentId: commentId,
        status: "active",
      })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Lấy thông tin người dùng và like
      const [formattedReplies, total] = await Promise.all([
        _formatCommentsWithUserInfo(replies, currentUser),
        Comment.countDocuments({ parentId: commentId, status: "active" }),
      ]);

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách phản hồi thành công",
        data: formattedReplies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error("Error in getCommentReplies:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách phản hồi",
      };
    }
  }

  /**
   * Tạo comment mới cho bài đăng
   */
  async createComment(postId, content, author, mediaFiles = null) {
    try {
      // Kiểm tra content
      if (!content || content.trim() === "") {
        return {
          success: false,
          status: 400,
          message: "Nội dung bình luận không được để trống",
        };
      }

      // Tìm bài đăng
      const post = await Post.findById(postId);
      if (!post) {
        return {
          success: false,
          status: 404,
          message: "Bài đăng không tồn tại",
        };
      }

      // Xử lý media và metadata
      const mediaResult = await _processMediaAndMetadata(content, mediaFiles);
      if (!mediaResult.success) {
        return mediaResult;
      }

      const [mediaObjects, contentURI] = mediaResult.data;

      // Tạo comment mới
      const newComment = await _createCommentObject({
        postId,
        parentId: null,
        depth: 0,
        author: author.toLowerCase(),
        content,
        contentURI,
        media: mediaObjects,
      });

      // Cập nhật số lượng comment của bài đăng
      await Post.findByIdAndUpdate(postId, {
        $inc: { "stats.commentCount": 1 },
        $set: { updatedAt: new Date() },
      });

      // Gửi thông báo cho tác giả bài đăng (nếu không phải chính họ comment)
      if (post.author.toLowerCase() !== author.toLowerCase()) {
        _sendCommentNotification(post.author, author, content, "post", postId);
      }

      // Lấy thông tin user và format kết quả
      const formattedComment = await _formatSingleCommentWithUserInfo(
        newComment,
        author
      );

      return {
        success: true,
        status: 201,
        message: "Tạo bình luận thành công",
        data: formattedComment,
      };
    } catch (error) {
      console.error("Error in createComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo bình luận",
      };
    }
  }

  /**
   * Trả lời một comment
   */
  async replyToComment(commentId, content, author, mediaFiles = null) {
    try {
      // Kiểm tra content
      if (!content || content.trim() === "") {
        return {
          success: false,
          status: 400,
          message: "Nội dung phản hồi không được để trống",
        };
      }

      // Tìm comment cha
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại",
        };
      }

      // Kiểm tra độ sâu của comment
      const depth = parentComment.depth + 1;
      if (depth > 3) {
        return {
          success: false,
          status: 400,
          message: "Vượt quá giới hạn độ sâu reply",
        };
      }

      // Xử lý media và metadata
      const mediaResult = await _processMediaAndMetadata(content, mediaFiles);
      if (!mediaResult.success) {
        return mediaResult;
      }

      const [mediaObjects, contentURI] = mediaResult.data;

      // Tạo reply mới
      const newReply = await _createCommentObject({
        postId: parentComment.postId,
        parentId: commentId,
        depth,
        author: author.toLowerCase(),
        content,
        contentURI,
        media: mediaObjects,
      });

      // Cập nhật số lượng reply và comment
      await Promise.all([
        Comment.findByIdAndUpdate(commentId, {
          $inc: { "stats.replyCount": 1 },
          $set: { updatedAt: new Date() },
        }),
        Post.findByIdAndUpdate(parentComment.postId, {
          $inc: { "stats.commentCount": 1 },
          $set: { updatedAt: new Date() },
        }),
      ]);

      // Gửi thông báo cho tác giả comment cha (nếu không phải chính họ reply)
      if (parentComment.author.toLowerCase() !== author.toLowerCase()) {
        _sendCommentNotification(
          parentComment.author,
          author,
          content,
          "comment",
          commentId
        );
      }

      // Lấy thông tin user và format kết quả
      const formattedReply = await _formatSingleCommentWithUserInfo(
        newReply,
        author
      );

      return {
        success: true,
        status: 201,
        message: "Trả lời bình luận thành công",
        data: formattedReply,
      };
    } catch (error) {
      console.error("Error in replyToComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi trả lời bình luận",
      };
    }
  }

  /**
   * Cập nhật comment
   */
  async updateComment(commentId, content, author) {
    try {
      // Kiểm tra content
      if (!content || content.trim() === "") {
        return {
          success: false,
          status: 400,
          message: "Nội dung bình luận không được để trống",
        };
      }

      // Tìm comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại",
        };
      }

      // Kiểm tra quyền sở hữu
      if (comment.author.toLowerCase() !== author.toLowerCase()) {
        return {
          success: false,
          status: 403,
          message: "Không có quyền chỉnh sửa comment này",
        };
      }

      // Kiểm tra thời gian (cho phép chỉnh sửa trong 30 phút)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (comment.createdAt < thirtyMinutesAgo) {
        return {
          success: false,
          status: 400,
          message: "Không thể chỉnh sửa comment sau 30 phút",
        };
      }

      // Cập nhật content
      comment.content = content;
      comment.updatedAt = new Date();

      // Cập nhật contentURI
      try {
        const commentMetadata = IPFSService.createCommentMetadata(
          content,
          comment.media.map((media) => media.uri.replace("ipfs://", ""))
        );

        const metadataCID = await IPFSService.uploadJSON(commentMetadata);
        comment.contentURI = `ipfs://${metadataCID}`;
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: "Lỗi khi cập nhật metadata",
        };
      }

      await comment.save();

      return {
        success: true,
        status: 200,
        message: "Cập nhật bình luận thành công",
        data: {
          _id: comment._id,
          content: comment.content,
          contentURI: comment.contentURI,
          updatedAt: comment.updatedAt,
        },
      };
    } catch (error) {
      console.error("Error in updateComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật bình luận",
      };
    }
  }

  /**
   * Xóa comment
   */
  async deleteComment(commentId, user) {
    try {
      // Tìm comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại",
        };
      }

      // Kiểm tra quyền
      const isAdmin = user.role === "admin";
      const isAuthor =
        comment.author.toLowerCase() === user.address.toLowerCase();

      if (!isAuthor && !isAdmin) {
        return {
          success: false,
          status: 403,
          message: "Không có quyền xóa comment này",
        };
      }

      // "Soft delete"
      comment.status = "deleted";
      comment.content = isAdmin ? "[Removed by admin]" : "[Deleted by user]";
      comment.updatedAt = new Date();

      await comment.save();

      // Cập nhật số lượng comments/replies
      const updatePromises = [
        Post.findByIdAndUpdate(comment.postId, {
          $inc: { "stats.commentCount": -1 },
        }),
      ];

      if (comment.parentId) {
        updatePromises.push(
          Comment.findByIdAndUpdate(comment.parentId, {
            $inc: { "stats.replyCount": -1 },
          })
        );
      }

      await Promise.all(updatePromises);

      return {
        success: true,
        status: 200,
        message: "Xóa bình luận thành công",
        data: { commentId },
      };
    } catch (error) {
      console.error("Error in deleteComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xóa bình luận",
      };
    }
  }

  /**
   * Like comment
   */
  async likeComment(commentId, user) {
    try {
      // Tìm comment
      const comment = await Comment.findById(commentId);
      if (!comment || comment.status !== "active") {
        return {
          success: false,
          status: 404,
          message: "Comment không tồn tại hoặc đã bị xóa",
        };
      }

      // Kiểm tra đã like chưa
      const existingLike = await Like.findOne({
        user: user.address.toLowerCase(),
        commentId,
      });

      if (existingLike) {
        return {
          success: false,
          status: 400,
          message: "Đã like comment này rồi",
        };
      }

      // Tạo like mới và cập nhật likeCount
      const newLike = new Like({
        user: user.address.toLowerCase(),
        commentId,
        createdAt: new Date(),
      });

      await Promise.all([
        newLike.save(),
        Comment.findByIdAndUpdate(commentId, {
          $inc: { "stats.likeCount": 1 },
        }),
      ]);

      // Gửi thông báo
      if (comment.author.toLowerCase() !== user.address.toLowerCase()) {
        _sendCommentNotification(
          comment.author,
          user.address,
          "đã thích bình luận của bạn",
          "like",
          commentId
        );
      }

      return {
        success: true,
        status: 200,
        message: "Đã thích bình luận",
        data: { commentId },
      };
    } catch (error) {
      console.error("Error in likeComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi thích bình luận",
      };
    }
  }

  /**
   * Unlike comment
   */
  async unlikeComment(commentId, user) {
    try {
      // Kiểm tra đã like chưa
      const existingLike = await Like.findOne({
        user: user.address.toLowerCase(),
        commentId,
      });

      if (!existingLike) {
        return {
          success: false,
          status: 400,
          message: "Chưa like comment này",
        };
      }

      // Xóa like và cập nhật likeCount
      await Promise.all([
        Like.findByIdAndDelete(existingLike._id),
        Comment.findByIdAndUpdate(commentId, {
          $inc: { "stats.likeCount": -1 },
        }),
      ]);

      return {
        success: true,
        status: 200,
        message: "Đã bỏ thích bình luận",
        data: { commentId },
      };
    } catch (error) {
      console.error("Error in unlikeComment:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi bỏ thích bình luận",
      };
    }
  }

  // Phương thức trợ giúp private
  _getSortOption(sort) {
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { "stats.likeCount": -1 },
    };

    return sortOptions[sort] || sortOptions["newest"];
  }

  async _createCommentObject(commentData) {
    try {
      const newComment = new Comment({
        ...commentData,
        stats: {
          likeCount: 0,
          replyCount: 0,
        },
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await newComment.save();
    } catch (error) {
      console.error("Error in _createCommentObject:", error);
      throw error; // Rethrow để xử lý ở hàm gọi
    }
  }

  async _processMediaAndMetadata(content, mediaFiles) {
    try {
      let mediaCIDs = [];
      let mediaObjects = [];

      if (mediaFiles) {
        const files = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];

        for (const file of files) {
          try {
            const cid = await IPFSService.uploadFile(file.data, file.name);
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
          } catch (error) {
            return {
              success: false,
              status: 500,
              message: "Lỗi khi tải lên media",
            };
          }
        }
      }

      // Tạo metadata và upload lên IPFS
      try {
        const metadata = IPFSService.createCommentMetadata(content, mediaCIDs);
        const metadataCID = await IPFSService.uploadJSON(metadata);

        return {
          success: true,
          data: [mediaObjects, `ipfs://${metadataCID}`],
        };
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: "Lỗi khi tạo metadata",
        };
      }
    } catch (error) {
      console.error("Error in _processMediaAndMetadata:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xử lý media",
      };
    }
  }

  async _formatCommentsWithUserInfo(comments, currentUser) {
    try {
      if (!comments.length) return [];

      // Lấy thông tin người dùng
      const userAddresses = [
        ...new Set(comments.map((comment) => comment.author)),
      ];
      const users = await User.find({
        walletAddress: { $in: userAddresses },
      }).select("walletAddress username avatarURI isVerified");

      const usersMap = {};
      users.forEach((user) => {
        usersMap[user.walletAddress] = user;
      });

      // Lấy thông tin like nếu user đã đăng nhập
      let userLikes = {};
      if (currentUser) {
        const address = currentUser.address.toLowerCase();
        const commentIds = comments.map((comment) => comment._id);

        const likes = await Like.find({
          user: address,
          commentId: { $in: commentIds },
        });

        likes.forEach((like) => {
          userLikes[like.commentId] = true;
        });
      }

      // Format kết quả
      return comments.map((comment) =>
        _formatCommentObject(comment, usersMap, userLikes)
      );
    } catch (error) {
      console.error("Error in _formatCommentsWithUserInfo:", error);
      throw error;
    }
  }

  _formatCommentObject(comment, usersMap, userLikes = {}) {
    const author = usersMap[comment.author];

    return {
      _id: comment._id,
      postId: comment.postId,
      parentId: comment.parentId,
      depth: comment.depth,
      author: comment.author,
      authorDetails: author
        ? {
            username: author.username,
            avatarURI: author.avatarURI
              ? IPFSService.ipfsUriToGatewayUrl(author.avatarURI)
              : null,
            isVerified: author.isVerified,
          }
        : null,
      content: comment.content,
      contentURI: comment.contentURI,
      media: comment.media
        ? comment.media.map((media) => ({
            ...media,
            uri: IPFSService.ipfsUriToGatewayUrl(media.uri),
          }))
        : [],
      stats: comment.stats,
      isLiked: userLikes[comment._id] || false,
      hasReplies: comment.stats.replyCount > 0,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  async _formatSingleCommentWithUserInfo(comment, authorAddress) {
    try {
      const user = await User.findOne({
        walletAddress: authorAddress.toLowerCase(),
      });
      const usersMap = {};

      if (user) {
        usersMap[user.walletAddress] = user;
      }

      return _formatCommentObject(comment, usersMap);
    } catch (error) {
      console.error("Error in _formatSingleCommentWithUserInfo:", error);
      throw error;
    }
  }

  async _sendCommentNotification(
    recipient,
    sender,
    content,
    targetType,
    targetId
  ) {
    try {
      await notificationService.createNotification({
        recipient,
        type: targetType === "like" ? "like" : "comment",
        sender: sender.toLowerCase(),
        content:
          targetType === "like"
            ? content
            : `đã ${targetType === "post" ? "bình luận về bài đăng" : "trả lời bình luận"} của bạn: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
        targetType: targetType === "like" ? "comment" : targetType,
        targetId,
      });
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      // Không throw lỗi ở đây vì không muốn việc thông báo thất bại ảnh hưởng đến việc tạo comment
    }
  }
}

module.exports = new CommentService();
