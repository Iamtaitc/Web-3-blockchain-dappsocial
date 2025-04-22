/**
 * System Service - Quản lý cấu hình và log hệ thống
 */

const config = require("../../configs/config.env");

class SystemService {
  /**
   * Cập nhật các cấu hình hệ thống
   * @param {Object} configData - Dữ liệu cấu hình mới
   * @returns {Object} Kết quả cập nhật
   */
  async updateSystemConfig(configData) {
    try {
      // Trong thực tế, đây sẽ là code lưu cấu hình vào database
      // Hiện tại chỉ trả về cấu hình và lọc các thông tin nhạy cảm

      return {
        success: true,
        status: 200,
        message: "Cập nhật cấu hình hệ thống thành công",
        data: {
          // Lọc các thông tin nhạy cảm
          ...config,
          JWT_SECRET: undefined,
          JWT_REFRESH_SECRET: undefined,
          PRIVATE_KEY: undefined,
          ENCRYPTION_KEY: undefined,
        },
      };
    } catch (error) {
      console.error("Error updating system config:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật cấu hình hệ thống",
        error: error.message,
      };
    }
  }

  /**
   * Lấy log hệ thống
   * @param {String} type - Loại log (all, info, error,...)
   * @param {Number} limit - Giới hạn số lượng log
   * @returns {Object} Kết quả lấy log
   */
  async getSystemLogs(type, limit) {
    try {
      // Trong thực tế, bạn sẽ đọc log từ file hoặc database
      // Đây chỉ là mô phỏng
      const logs = [
        { timestamp: new Date(), level: "info", message: "Server started" },
        {
          timestamp: new Date(),
          level: "error",
          message: "Database connection error",
        },
        // ...
      ];

      // Lọc theo type
      let filteredLogs = logs;
      if (type !== "all") {
        filteredLogs = logs.filter((log) => log.level === type);
      }

      // Giới hạn số lượng
      filteredLogs = filteredLogs.slice(0, limit);

      return {
        success: true,
        status: 200,
        message: "Lấy log hệ thống thành công",
        data: filteredLogs,
      };
    } catch (error) {
      console.error("Error getting system logs:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy log hệ thống",
        error: error.message,
      };
    }
  }

  /**
   * Force sync dữ liệu từ blockchain
   * @returns {Object} Kết quả đồng bộ
   */
  async forceBlockchainSync() {
    try {
      // Trigger sync service
      // Giả sử bạn có một service để đồng bộ dữ liệu từ blockchain
      const syncService = require("../syncService");

      // Bắt đầu đồng bộ
      await syncService.syncNFTEvents();
      await syncService.syncSubscriptionData();

      return {
        success: true,
        status: 200,
        message: "Đồng bộ dữ liệu blockchain thành công",
      };
    } catch (error) {
      console.error("Error syncing blockchain data:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi đồng bộ dữ liệu blockchain",
        error: error.message,
      };
    }
  }
}

module.exports = new SystemService();
