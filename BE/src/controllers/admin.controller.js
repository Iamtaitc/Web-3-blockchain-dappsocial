// src/controllers/AdminController.js
const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/apiResponse.utils");
const AdminService = require("../services/admin.services");
const config = require("../configs/config.env");

/**
 * Controller xử lý các chức năng quản trị
 */
class AdminController {
  /**
   * Kiểm tra quyền admin
   * @param {String} address - Địa chỉ ví cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isAdmin(address) {
    return config.ADMIN_ADDRESSES.includes(address.toLowerCase());
  }

  /**
   * Middleware kiểm tra quyền admin
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  checkAdminAccess(req, res, next) {
    if (!req.user || !isAdmin(req.user.address)) {
      return ApiResponse.forbidden(res, "Không có quyền truy cập admin");
    }

    next();
  }

  /**
   * Lấy thống kê tổng quan hệ thống
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDashboardStats(req, res) {
    const result = await AdminService.getDashboardStats();

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, result.data);
  }

  /**
   * Quản lý người dùng - Lấy danh sách
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUsers(req, res) {
    const { page = 1, limit = 20, search, status } = req.query;

    const result = await AdminService.getUsers(
      parseInt(page),
      parseInt(limit),
      search,
      status
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, result.data);
  }

  /**
   * Cập nhật trạng thái người dùng
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateUserStatus(req, res) {
    const { walletAddress } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["active", "suspended", "inactive"].includes(status)) {
      return ApiResponse.badRequest(res, "Trạng thái không hợp lệ");
    }

    const result = await AdminService.updateUserStatus(walletAddress, status);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      result.data,
      "Cập nhật trạng thái người dùng thành công"
    );
  }

  /**
   * Xác minh người dùng (verified)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async verifyUser(req, res) {
    const { walletAddress } = req.params;
    const { verified } = req.body;

    const result = await AdminService.verifyUser(
      walletAddress,
      Boolean(verified)
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    const message = verified
      ? "Xác minh người dùng thành công"
      : "Hủy xác minh người dùng thành công";
    return ApiResponse.success(res, result.data, message);
  }

  /**
   * Quản lý nội dung - Lấy bài đăng cần kiểm duyệt
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getModerationPosts(req, res) {
    const { page = 1, limit = 20, status } = req.query;

    const result = await AdminService.getModerationPosts(
      parseInt(page),
      parseInt(limit),
      status
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, result.data);
  }

  /**
   * Cập nhật trạng thái bài đăng
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updatePostStatus(req, res) {
    const { postId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["active", "hidden", "deleted"].includes(status)) {
      return ApiResponse.badRequest(res, "Trạng thái không hợp lệ");
    }

    const result = await AdminService.updatePostStatus(postId, status);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      result.data,
      "Cập nhật trạng thái bài đăng thành công"
    );
  }

  /**
   * Quản lý nhiệm vụ - Lấy tất cả nhiệm vụ
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllTasks(req, res) {
    const result = await AdminService.getAllTasks();

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, { tasks: result.data });
  }

  /**
   * Tạo nhiệm vụ mới
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createTask(req, res) {
    const {
      name,
      description,
      type,
      rewardPoints,
      rewardTokens,
      requirements,
    } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(
        res,
        "Dữ liệu không hợp lệ",
        errors.array()
      );
    }

    const taskData = {
      name,
      description,
      type: type || "daily",
      rewardPoints: parseInt(rewardPoints) || 0,
      rewardTokens: parseFloat(rewardTokens) || 0,
      requirements,
    };

    const result = await AdminService.createTask(taskData);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.created(
      res,
      { task: result.data },
      "Tạo nhiệm vụ thành công"
    );
  }

  /**
   * Cập nhật nhiệm vụ
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateTask(req, res) {
    const { taskId } = req.params;
    const {
      name,
      description,
      type,
      rewardPoints,
      rewardTokens,
      requirements,
      isActive,
    } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(
        res,
        "Dữ liệu không hợp lệ",
        errors.array()
      );
    }

    const taskData = {
      name,
      description,
      type,
      rewardPoints: parseInt(rewardPoints),
      rewardTokens: parseFloat(rewardTokens),
      requirements,
      isActive: Boolean(isActive),
    };

    const result = await AdminService.updateTask(taskId, taskData);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { task: result.data },
      "Cập nhật nhiệm vụ thành công"
    );
  }

  /**
   * Xóa nhiệm vụ
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteTask(req, res) {
    const { taskId } = req.params;

    const result = await AdminService.deleteTask(taskId);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, null, "Xóa nhiệm vụ thành công");
  }

  /**
   * Reset nhiệm vụ hàng ngày
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async resetDailyTasks(req, res) {
    const result = await AdminService.resetDailyTasks();

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { deletedCount: result.data },
      "Reset nhiệm vụ hàng ngày thành công"
    );
  }

  /**
   * Tạo token DX cho người dùng (mint)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async mintDXTokens(req, res) {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount || parseFloat(amount) <= 0) {
      return ApiResponse.badRequest(
        res,
        "Địa chỉ ví và số lượng token là bắt buộc"
      );
    }

    const result = await AdminService.mintDXTokens(walletAddress, amount);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      null,
      `Mint ${amount} DX tokens thành công cho ${walletAddress}`
    );
  }

  /**
   * Tạo thông báo hệ thống cho tất cả người dùng
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createSystemAnnouncement(req, res) {
    const { title, content } = req.body;

    if (!title || !content) {
      return ApiResponse.badRequest(res, "Tiêu đề và nội dung là bắt buộc");
    }

    const result = await AdminService.createSystemAnnouncement(title, content);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { recipientCount: result.data },
      "Tạo thông báo hệ thống thành công"
    );
  }

  /**
   * Lấy thống kê người dùng theo thời gian
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUsersOverTime(req, res) {
    const { period = "month" } = req.query;

    const result = await AdminService.getUsersOverTime(period);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      period,
      data: result.data,
    });
  }

  /**
   * Cập nhật các cấu hình hệ thống
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateSystemConfig(req, res) {
    const result = await AdminService.updateSystemConfig(req.body);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { config: result.data },
      "Cập nhật cấu hình hệ thống thành công"
    );
  }

  /**
   * Lấy log hệ thống
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSystemLogs(req, res) {
    const { type = "all", limit = 100 } = req.query;

    const result = await AdminService.getSystemLogs(type, parseInt(limit));

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, { logs: result.data });
  }

  /**
   * Force sync dữ liệu từ blockchain
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async forceBlockchainSync(req, res) {
    const result = await AdminService.forceBlockchainSync();

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      null,
      "Đồng bộ dữ liệu blockchain thành công"
    );
  }
}

module.exports = AdminController;
