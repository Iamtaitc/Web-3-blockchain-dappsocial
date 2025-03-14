const Notification = require('../models/Notification.mongoose');
const User = require('../models/User.mongoose');

/**
 * Tạo thông báo mới
 * @param {object} notificationData - Dữ liệu thông báo
 * @returns {object} Thông báo đã tạo
 */
const createNotification = async (notificationData) => {
  try {
    const { recipient, type, sender, content, targetType, targetId } = notificationData;
    
    // Kiểm tra recipient có tồn tại không
    const user = await User.findOne({ walletAddress: recipient.toLowerCase() });
    if (!user) {
      console.error('Recipient not found:', recipient);
      return null;
    }
    
    // Tạo thông báo mới
    const notification = new Notification({
      recipient: recipient.toLowerCase(),
      type,
      sender: sender ? sender.toLowerCase() : null,
      content,
      targetType,
      targetId,
      read: false,
      createdAt: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Lấy danh sách thông báo của user
 * @param {string} walletAddress - Địa chỉ ví người dùng
 * @param {object} options - Tùy chọn phân trang và lọc
 * @returns {object} Danh sách thông báo và thông tin phân trang
 */
const getUserNotifications = async (walletAddress, options = {}) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;
    
    // Xây dựng query
    const query = { 
      recipient: walletAddress.toLowerCase() 
    };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    // Lấy thông báo
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Đếm tổng số thông báo
    const total = await Notification.countDocuments(query);
    
    // Đếm số thông báo chưa đọc
    const unreadCount = await Notification.countDocuments({
      recipient: walletAddress.toLowerCase(),
      read: false
    });
    
    return {
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Đánh dấu thông báo đã đọc
 * @param {string} notificationId - ID của thông báo
 * @param {string} walletAddress - Địa chỉ ví người dùng
 * @returns {boolean} Kết quả cập nhật
 */
const markNotificationAsRead = async (notificationId, walletAddress) => {
  try {
    const result = await Notification.updateOne(
      { 
        _id: notificationId,
        recipient: walletAddress.toLowerCase()
      },
      { $set: { read: true } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @param {string} walletAddress - Địa chỉ ví người dùng
 * @returns {number} Số thông báo đã cập nhật
 */
const markAllNotificationsAsRead = async (walletAddress) => {
  try {
    const result = await Notification.updateMany(
      { 
        recipient: walletAddress.toLowerCase(),
        read: false
      },
      { $set: { read: true } }
    );
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};