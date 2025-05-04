/**
 * Content Moderation Service - Quản lý nội dung
 */

const { Post, User, Notification } = require("../../models/index");
const IPFSService = require("../ipfs.services");

class ContentModerationService {
  /**
   * Quản lý nội dung - Lấy bài đăng cần kiểm duyệt
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} status - Trạng thái bài đăng
   * @returns {Object} Kết quả lấy danh sách
   */
  async getModerationPosts(page, limit, status) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query
      const query = {};

      if (status) {
        query.status = status;
      }

      // Lấy danh sách bài đăng
      const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy thông tin author
      const authorAddresses = [...new Set(posts.map((post) => post.author))];
      const authors = await User.find({
        walletAddress: { $in: authorAddresses },
      }).select("walletAddress username avatarURI isVerified");

      const authorsMap = {};
      authors.forEach((author) => {
        authorsMap[author.walletAddress] = author;
      });

      // Đếm tổng số bài đăng
      const total = await Post.countDocuments(query);

      const formattedPosts = posts.map((post) => ({
        _id: post._id,
        content: post.content,
        author: post.author,
        authorDetails: authorsMap[post.author]
          ? {
              username: authorsMap[post.author].username,
              avatarURI: authorsMap[post.author].avatarURI
                ? IPFSService.formatIPFSUrl(authorsMap[post.author].avatarURI)
                : null,
              isVerified: authorsMap[post.author].isVerified,
            }
          : null,
        media: post.media.map((m) => ({
          ...m,
          uri: IPFSService.formatIPFSUrl(m.uri),
        })),
        status: post.status,
        stats: post.stats,
        createdAt: post.createdAt,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách bài đăng thành công",
        data: {
          posts: formattedPosts,
          pagination: {
            total,
            page: page,
            limit: limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting moderation posts:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách bài đăng",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái bài đăng
   * @param {String} postId - ID bài đăng
   * @param {String} status - Trạng thái mới
   * @returns {Object} Kết quả cập nhật
   */
  async updatePostStatus(postId, status) {
    try {
      // Cập nhật bài đăng
      const post = await Post.findByIdAndUpdate(
        postId,
        { $set: { status } },
        { new: true }
      );

      if (!post) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy bài đăng",
        };
      }

      // Gửi thông báo cho người dùng nếu bài đăng bị ẩn/xóa
      if (status !== "active") {
        // Tạo thông báo
        await Notification.create({
          recipient: post.author,
          type: "system",
          content: `Bài đăng của bạn đã bị ${
            status === "hidden" ? "ẩn" : "xóa"
          } vì vi phạm tiêu chuẩn cộng đồng.`,
          targetType: "post",
          targetId: postId,
          read: false,
          createdAt: new Date(),
        });
      }

      return {
        success: true,
        status: 200,
        message: "Cập nhật trạng thái bài đăng thành công",
        data: {
          _id: post._id,
          status: post.status,
        },
      };
    } catch (error) {
      console.error("Error updating post status:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật trạng thái bài đăng",
        error: error.message,
      };
    }
  }
}

module.exports = new ContentModerationService();
