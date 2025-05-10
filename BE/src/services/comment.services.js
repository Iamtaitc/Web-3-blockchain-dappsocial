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
      const sortOption = this._getSortOption(sort);
  
      // Lấy comments cấp 1
      const comments = await Comment.find({
        postId,
        parentId: null,
        status: "active",
      })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
  
      console.log("Found comments:", comments.length);
      
      let formattedComments = [];
      try {
        formattedComments = await this._formatCommentsWithUserInfo(comments, currentUser);
        console.log("Formatted comments:", formattedComments ? formattedComments.length : "undefined");
      } catch (formatError) {
        console.error("Error formatting comments:", formatError);
        formattedComments = comments.map(comment => ({
          _id: comment._id,
          content: comment.content,
          author: comment.author,
          createdAt: comment.createdAt
        }));
      }
  
      const total = await Comment.countDocuments({ postId, parentId: null, status: "active" });
  
      return {
        success: true,
        message: "Lấy danh sách bình luận thành công",
        data: formattedComments || [],
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in getPostComments:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách bình luận",
        error: error.message
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
        this._formatCommentsWithUserInfo(replies, currentUser),
        Comment.countDocuments({ parentId: commentId, status: "active" }),
      ]);

      return {
        success: true,
        message: "Lấy danh sách bình luận thành công",
        data: formattedReplies,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        timestamp: new Date().toISOString()
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
      const mediaResult = await this._processMediaAndMetadata(content, mediaFiles);
      if (!mediaResult.success) {
        return mediaResult;
      }

      const [mediaObjects, contentURI] = mediaResult.data;

      // Tạo comment mới
      const newComment = await this._createCommentObject({
        postId,
        parentId: null,
        depth: 0,
        author: author.toLowerCase(),
        content,
        contentURI,
        likeCount: 0,
        replyCount: 0,
        media: mediaObjects,
      });

      // Cập nhật số lượng comment của bài đăng
      await Post.findByIdAndUpdate(postId, {
        $inc: { "commentCount": 1 },
        $set: { updatedAt: new Date() },
      });

      // Gửi thông báo cho tác giả bài đăng (nếu không phải chính họ comment)
      if (post.author.toLowerCase() !== author.toLowerCase()) {
        this._sendCommentNotification(
          post.author,
          author,
          content,
          "post",
          postId
        );
      }

      // Lấy thông tin user và format kết quả
      const formattedComment = await this._formatSingleCommentWithUserInfo(
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
      const mediaResult = await this._processMediaAndMetadata(content, mediaFiles);
      if (!mediaResult.success) {
        return mediaResult;
      }

      const [mediaObjects, contentURI] = mediaResult.data;

      // Tạo reply mới
      const newReply = await this._createCommentObject({
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
          $inc: { replyCount: 1 },
          $set: { updatedAt: new Date() },
        }),
        Post.findByIdAndUpdate(parentComment.postId, {
          $inc: { "commentCount": 1 },
          $set: { updatedAt: new Date() },
        }),
      ]);

      // Gửi thông báo cho tác giả comment cha (nếu không phải chính họ reply)
      if (parentComment.author.toLowerCase() !== author.toLowerCase()) {
        this._sendCommentNotification(
          parentComment.author,
          author,
          content,
          "comment",
          commentId
        );
      }

      // Lấy thông tin user và format kết quả
      const formattedReply = await this._formatSingleCommentWithUserInfo(
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
      const isAuthor = comment.author.toLowerCase() === user.address.toLowerCase();

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
          $inc: { "commentCount": -1 },
        }),
      ];

      if (comment.parentId) {
        updatePromises.push(
          Comment.findByIdAndUpdate(comment.parentId, {
            $inc: { "replyCount": -1 },
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
        postId: commentId,
        createdAt: new Date(),
      });

      await Promise.all([
        newLike.save(),
        Comment.findByIdAndUpdate(commentId, {
          $inc: { "likeCount": 1 },
        }),
      ]);

      // Gửi thông báo
      if (comment.author.toLowerCase() !== user.address.toLowerCase()) {
        this._sendCommentNotification(
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
        postId:commentId,
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
          $inc: { "likeCount": -1 },
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
  /**
 * Helper methods for CommentService
 */
  /**
   * Xác định tùy chọn sắp xếp
   */
  _getSortOption(sort) {
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { likeCount: -1 },
    };

    return sortOptions[sort] || sortOptions["newest"];
  }

  /**
   * Tạo đối tượng comment mới
   */
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
      throw error;
    }
  }

  /**
   * Xử lý media và tạo metadata cho comment
   */
  async _processMediaAndMetadata(content, mediaFiles) {
    try {
      let mediaCIDs = [];
      let mediaObjects = [];

      // Xử lý files media nếu có
      if (mediaFiles) {
        const files = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];

        // Giới hạn số lượng media
        if (files.length > 2) {
          return {
            success: false,
            status: 400,
            message: "Không thể đính kèm quá 2 file media cho một bình luận",
          };
        }

        for (const file of files) {
          try {
            // Giới hạn kích thước file (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
              return {
                success: false,
                status: 400,
                message: `File ${file.name} vượt quá kích thước cho phép (10MB)`,
              };
            }

            // Kiểm tra loại file
            const allowedTypes = [
              "image/jpeg", "image/png", "image/gif", "image/webp",
              "video/mp4", "video/webm",
              "audio/mp3", "audio/wav",
            ];

            if (!allowedTypes.includes(file.mimetype)) {
              return {
                success: false,
                status: 400,
                message: `Định dạng file ${file.mimetype} không được hỗ trợ`,
              };
            }

            // Upload file lên IPFS
            const cid = await IPFSService.uploadFile(file.data, file.name);
            mediaCIDs.push(cid);

            // Xác định loại media
            let mediaType = "other";
            if (file.mimetype.startsWith("image/")) {
              mediaType = "image";
            } else if (file.mimetype.startsWith("video/")) {
              mediaType = "video";
            } else if (file.mimetype.startsWith("audio/")) {
              mediaType = "audio";
            }

            // Thêm vào danh sách media
            mediaObjects.push({
              type: mediaType,
              uri: `ipfs://${cid}`,
              mimeType: file.mimetype,
              name: file.name || null,
              size: file.size || null,
            });
          } catch (error) {
            console.error("Error uploading media file:", error);
            return {
              success: false,
              status: 500,
              message: `Lỗi khi tải lên file ${file.name}`,
              error: error.message,
            };
          }
        }
      }

      // Tạo metadata và upload lên IPFS
      try {
        // Tạo metadata với format chuẩn
        const metadata = {
          content: content,
          timestamp: new Date().toISOString(),
          media: mediaCIDs.map((cid) => ({ cid })),
          version: "1.0",
        };

        const metadataCID = await IPFSService.uploadJSON(metadata);

        return {
          success: true,
          data: [mediaObjects, `ipfs://${metadataCID}`],
        };
      } catch (error) {
        console.error("Error creating metadata:", error);
        return {
          success: false,
          status: 500,
          message: "Lỗi khi tạo và lưu trữ metadata",
          error: error.message,
        };
      }
    } catch (error) {
      console.error("Error in _processMediaAndMetadata:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xử lý media và metadata",
        error: error.message,
      };
    }
  }

  /**
   * Format danh sách comments với thông tin người dùng
   */
  async _formatCommentsWithUserInfo(comments, currentUser) {
    try {
      if (!comments.length) return [];
      
      // Lấy thông tin người dùng
      const userAddresses = [...new Set(comments.map((comment) => comment.author))];
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
        this._formatCommentObject(comment, usersMap, userLikes)
      );
    } catch (error) {
      console.error("Error in _formatCommentsWithUserInfo:", error);
      throw error;
    }
  }

  /**
   * Format một comment với thông tin người dùng
   */
  _formatCommentObject(comment, usersMap, userLikes = {}) {
    try {
      const authorAddress = (comment.author || '').toLowerCase();
      const author = usersMap[authorAddress];
  
      return {
        _id: comment._id,
        postId: comment.postId,
        parentId: comment.parentId,
        depth: comment.depth || 0,
        author: authorAddress,
        authorDetails: author
          ? {
              username: author.username || null,
              avatarURI: author.avatarURI
                ? IPFSService.ipfsUriToGatewayUrl(author.avatarURI)
                : null,
              isVerified: author.isVerified || false,
            }
          : null,
        content: comment.content || '',
        contentURI: comment.contentURI || null,
        media: Array.isArray(comment.media)
          ? comment.media.map((media) => ({
              ...media,
              uri: media.uri ? IPFSService.ipfsUriToGatewayUrl(media.uri) : null,
            }))
          : [],
        stats: {
          likeCount: comment.likeCount || 0,
          replyCount: comment.replyCount || 0
        },
        isLiked: Boolean(userLikes[comment._id.toString()]),
        hasReplies: (comment.replyCount || 0) > 0,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || comment.createdAt,
      };
    } catch (error) {
      console.error("Error in _formatCommentObject:", error);
      // Trả về đối tượng đơn giản nếu có lỗi
      return {
        _id: comment._id,
        content: comment.content || '',
        author: comment.author || '',
        createdAt: comment.createdAt
      };
    }
  }

  /**
   * Gửi thông báo về comment
   */
  async _sendCommentNotification(recipient, sender, content, targetType, targetId) {
    try {
      // Tạo nội dung thông báo
      const notificationContent =
        content.length > 50 ? `${content.substring(0, 50)}...` : content;

      // Tạo thông báo mới
      return await notificationService.createNotification({
        recipient,
        type: "comment",
        sender,
        content: notificationContent,
        targetType,
        targetId,
      });
    } catch (error) {
      console.error("Error sending comment notification:", error);
      return null;
    }
  }

  /**
   * Format một comment với thông tin người dùng chi tiết
   */
  async _formatSingleCommentWithUserInfo(comment, currentUser) {
    try {
      // Lấy thông tin người dùng từ database
      const user = await User.findOne({
        walletAddress: comment.author.toLowerCase(),
      });

      if (!user) {
        throw new Error(
          `Không tìm thấy thông tin người dùng cho địa chỉ: ${comment.author}`
        );
      }

      // Tạo đối tượng bình luận với thông tin người dùng
      return {
        ...comment.toObject(),
        author: {
          walletAddress: user.walletAddress,
          username: user.username || null,
          displayName: user.displayName || null,
          avatar: user.avatar || null,
          bio: user.bio || null,
        },
        isOwn: currentUser.toLowerCase() === comment.author.toLowerCase(),
      };
    } catch (error) {
      console.error("Error formatting comment with user info:", error);
      return comment;
    }
  }
}

module.exports = new CommentService();