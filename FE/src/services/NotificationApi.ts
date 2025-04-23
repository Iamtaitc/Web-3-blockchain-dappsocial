import instance from "./instance";

// Types
type FetchNotificationsParams = {
  page?: number;
  limit?: number;
  unread?: boolean;
};

// Notification API service
const NotificationApi = {
  // Lấy danh sách thông báo
  getNotifications: async (params: FetchNotificationsParams = {}) => {
    try {
      const { page = 1, limit = 10, unread = false } = params;
      const queryParams = new URLSearchParams();

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      queryParams.append("unread", unread.toString());

      const response = await instance.get(`/notifications?${queryParams.toString()}`);
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Đánh dấu một thông báo là đã đọc
  markAsRead: async (notificationId: string) => {
    try {
      const response = await instance.patch(`/notifications/${notificationId}/read`, {});
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    try {
      const response = await instance.patch("/notifications/read/all", {});
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};

export default NotificationApi;