// services/comment/base.service.js
const { Comment, User, Like } = require("../../models/index");
const IPFSService = require("../ipfs.services");

/**
 * Base class cho các services xử lý comments
 */
class BaseCommentService {
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
   * Format danh sách comments với thông tin người dùng
   */
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
      const authorAddress = (comment.author || "").toLowerCase();
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
        content: comment.content || "",
        contentURI: comment.contentURI || null,
        media: Array.isArray(comment.media)
          ? comment.media.map((media) => ({
              ...media,
              uri: media.uri
                ? IPFSService.ipfsUriToGatewayUrl(media.uri)
                : null,
            }))
          : [],
        stats: {
          likeCount: comment.likeCount || 0,
          replyCount: comment.replyCount || 0,
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
        content: comment.content || "",
        author: comment.author || "",
        createdAt: comment.createdAt,
      };
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

module.exports = BaseCommentService;