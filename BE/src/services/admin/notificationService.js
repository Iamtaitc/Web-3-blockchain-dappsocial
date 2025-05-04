/**
 * Notification Service - Quản lý thông báo hệ thống
 */

const { User, Notification } = require("../../models/index");

class NotificationService {
  /**
   * Tạo thông báo hệ thống cho tất cả người dùng
   * @param {String} title - Tiêu đề thông báo
   * @param {String} content - Nội dung thông báo
   * @returns {Object} Kết quả tạo thông báo
   */
  async createSystemAnnouncement(title, content) {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!title || !content) {
        return {
          success: false,
          status: 400,
          message: "Tiêu đề và nội dung thông báo không được để trống",
        };
      }

      // Lấy tất cả người dùng active
      const users = await User.find({ status: "active" }).select(
        "walletAddress"
      );

      if (users.length === 0) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng hoạt động nào",
        };
      }

      // Tạo thông báo cho từng người dùng
      const notifications = users.map((user) => ({
        recipient: user.walletAddress,
        type: "system",
        content: `${title}: ${content}`,
        read: false,
        createdAt: new Date(),
      }));

      // Lưu thông báo
      const result = await Notification.insertMany(notifications);

      return {
        success: true,
        status: 200,
        message: "Tạo thông báo hệ thống thành công",
        data: {
          sentCount: result.length,
          totalUsers: users.length,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error("Error creating system announcement:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo thông báo hệ thống",
        error: error.message,
      };
    }
  }

  /**
   * Tạo thông báo hệ thống cho người dùng cụ thể
   * @param {String} walletAddress - Địa chỉ ví của người nhận
   * @param {String} title - Tiêu đề thông báo
   * @param {String} content - Nội dung thông báo
   * @returns {Object} Kết quả tạo thông báo
   */
  async createUserNotification(walletAddress, title, content) {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!walletAddress || !title || !content) {
        return {
          success: false,
          status: 400,
          message:
            "Địa chỉ ví, tiêu đề và nội dung thông báo không được để trống",
        };
      }

      // Kiểm tra người dùng tồn tại
      const user = await User.findOne({
        walletAddress: walletAddress.toLowerCase(),
        status: "active",
      });

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng hoạt động với địa chỉ ví này",
        };
      }

      // Tạo thông báo
      const notification = new Notification({
        recipient: walletAddress.toLowerCase(),
        type: "system",
        content: `${title}: ${content}`,
        read: false,
        createdAt: new Date(),
      });

      await notification.save();

      return {
        success: true,
        status: 200,
        message: "Tạo thông báo cho người dùng thành công",
        data: {
          notificationId: notification._id,
          recipient: notification.recipient,
          content: notification.content,
          createdAt: notification.createdAt,
        },
      };
    } catch (error) {
      console.error("Error creating user notification:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo thông báo cho người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Xóa thông báo hệ thống
   * @param {String} notificationId - ID thông báo cần xóa
   * @returns {Object} Kết quả xóa thông báo
   */
  async deleteNotification(notificationId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          status: 400,
          message: "ID thông báo không được để trống",
        };
      }

      const result = await Notification.findByIdAndDelete(notificationId);

      if (!result) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy thông báo với ID này",
        };
      }

      return {
        success: true,
        status: 200,
        message: "Xóa thông báo thành công",
        data: {
          notificationId,
          deletedAt: new Date(),
        },
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xóa thông báo",
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách thông báo đã gửi
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Số lượng thông báo mỗi trang
   * @param {String} type - Loại thông báo cần lọc (optional)
   * @returns {Object} Danh sách thông báo
   */
  async getNotifications(page = 1, limit = 10, type = null) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query
      const query = {};
      if (type) {
        query.type = type;
      }

      // Lấy danh sách thông báo phân trang
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Đếm tổng số thông báo
      const total = await Notification.countDocuments(query);

      // Nhóm thông báo theo người nhận
      const uniqueRecipients = new Set();
      notifications.forEach((notification) => {
        uniqueRecipients.add(notification.recipient);
      });

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách thông báo thành công",
        data: {
          notifications,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
          stats: {
            uniqueRecipients: uniqueRecipients.size,
          },
        },
      };
    } catch (error) {
      console.error("Error getting notifications:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách thông báo",
        error: error.message,
      };
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc cho một người dùng
   * @param {String} walletAddress - Địa chỉ ví người dùng
   * @returns {Object} Kết quả cập nhật
   */
  async markAllAsRead(walletAddress) {
    try {
      if (!walletAddress) {
        return {
          success: false,
          status: 400,
          message: "Địa chỉ ví không được để trống",
        };
      }

      const result = await Notification.updateMany(
        {
          recipient: walletAddress.toLowerCase(),
          read: false,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        }
      );

      return {
        success: true,
        status: 200,
        message: "Đánh dấu tất cả thông báo đã đọc thành công",
        data: {
          markedCount: result.modifiedCount,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi đánh dấu thông báo đã đọc",
        error: error.message,
      };
    }
  }
}

module.exports = new NotificationService();
