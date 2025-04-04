const notificationService = require("../services/notification.services");
  /**
   * Lấy danh sách thông báo của user
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  class NotificationController {
  
    async getNotifications(req, res) {
      try {
        const { page, limit, unread } = req.query;
        const walletAddress = req.user.address;
        
        const options = {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          unreadOnly: unread === 'true'
        };
  
        const result = await notificationService.getUserNotifications(walletAddress, options);
        
        res.status(200).json(result);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
      }
    }
  
    async markAsRead(req, res) {
      try {
        const { notificationId } = req.params;
        const walletAddress = req.user.address;
        
        const success = await notificationService.markNotificationAsRead(notificationId, walletAddress);
  
        if (success) {
          res.status(200).json({ message: 'Notification marked as read' });
        } else {
          res.status(404).json({ error: 'Notification not found or not owned by user' });
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
      }
    }
  
    async markAllAsRead(req, res) {
      try {
        const walletAddress = req.user.address;
        
        const count = await notificationService.markAllNotificationsAsRead(walletAddress);
        
        res.status(200).json({ 
          message: 'All notifications marked as read',
          count
        });
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
      }
    }
  }
  
  module.exports = new NotificationController();