// services/comment/write.service.js
const { Comment, Post } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const notificationService = require("../notification.services");
const BaseCommentService = require("./base.service");

/**
 * Service xử lý các chức năng tạo và chỉnh sửa comment
 */
class CommentWriteService extends BaseCommentService {
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
      const mediaResult = await this._processMediaAndMetadata(
        content,
        mediaFiles
      );
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
        $inc: { commentCount: 1 },
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
      const mediaResult = await this._processMediaAndMetadata(
        content,
        mediaFiles
      );
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
          $inc: { commentCount: 1 },
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
          $inc: { commentCount: -1 },
        }),
      ];

      if (comment.parentId) {
        updatePromises.push(
          Comment.findByIdAndUpdate(comment.parentId, {
            $inc: { replyCount: -1 },
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
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
              "video/mp4",
              "video/webm",
              "audio/mp3",
              "audio/wav",
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
   * Gửi thông báo về comment
   */
  async _sendCommentNotification(
    recipient,
    sender,
    content,
    targetType,
    targetId
  ) {
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
}

module.exports = new CommentWriteService();
