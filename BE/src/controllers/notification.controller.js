const { 
    getUserNotifications, 
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = require('../services/notification.services');
  
  /**
   * Lấy danh sách thông báo của user
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  exports.getNotifications = async (req, res) => {
    try {
      const { page, limit, unread } = req.query;
      const walletAddress = req.user.address;
      
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        unreadOnly: unread === 'true'
      };
      
      const result = await getUserNotifications(walletAddress, options);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  };
  
  /**
   * Đánh dấu thông báo đã đọc
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  exports.markAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const walletAddress = req.user.address;
      
      const success = await markNotificationAsRead(notificationId, walletAddress);
      
      if (success) {
        res.status(200).json({ message: 'Notification marked as read' });
      } else {
        res.status(404).json({ error: 'Notification not found or not owned by user' });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  };
  
  /**
   * Đánh dấu tất cả thông báo đã đọc
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  exports.markAllAsRead = async (req, res) => {
    try {
      const walletAddress = req.user.address;
      
      const count = await markAllNotificationsAsRead(walletAddress);
      
      res.status(200).json({ 
        message: 'All notifications marked as read',
        count
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  };