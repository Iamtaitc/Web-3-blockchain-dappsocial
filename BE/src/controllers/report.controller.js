const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/apiResponse.utils");
const ReportService = require("../services/report.services");

/**
 * Controller xử lý các chức năng báo cáo
 */
class ReportController {
  /**
   * Tạo báo cáo mới
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createReport(req, res) {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(
        res,
        "Dữ liệu không hợp lệ",
        errors.array()
      );
    }

    const { targetType, targetId, reason, details } = req.body;
    const reporterAddress = req.user.address;

    // Kiểm tra loại target
    if (!["post", "comment", "user", "nft"].includes(targetType)) {
      return ApiResponse.badRequest(res, "Loại target không hợp lệ");
    }

    const result = await ReportService.createReport(
      targetType,
      targetId,
      reason,
      details,
      reporterAddress
    );

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
      { reportId: result.data.reportId },
      "Báo cáo đã được gửi thành công"
    );
  }

  /**
   * Lấy danh sách các báo cáo của người dùng hiện tại
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserReports(req, res) {
    const walletAddress = req.user.address;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ReportService.getUserReports(
      walletAddress,
      page,
      limit
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      reports: result.data.reports,
      pagination: result.data.pagination,
    });
  }

  /**
   * Lấy danh sách tất cả các báo cáo (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllReports(req, res) {
    // Kiểm tra người dùng có phải là admin không
    if (!req.user.isAdmin) {
      return ApiResponse.forbidden(res, "Không có quyền truy cập");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "pending";
    const targetType = req.query.targetType;

    const result = await ReportService.getAllReports(
      page,
      limit,
      status,
      targetType
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      reports: result.data.reports,
      counts: result.data.counts,
      pagination: result.data.pagination,
    });
  }

  /**
   * Cập nhật trạng thái báo cáo (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateReportStatus(req, res) {
    // Kiểm tra người dùng có phải là admin không
    if (!req.user.isAdmin) {
      return ApiResponse.forbidden(res, "Không có quyền truy cập");
    }

    const { reportId } = req.params;
    const { status, adminComment, action } = req.body;

    // Validate input
    if (!["pending", "resolved", "rejected"].includes(status)) {
      return ApiResponse.badRequest(res, "Trạng thái không hợp lệ");
    }

    const result = await ReportService.updateReportStatus(
      reportId,
      status,
      adminComment,
      action,
      req.user.address
    );

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
      {
        report: result.data,
      },
      "Cập nhật trạng thái báo cáo thành công"
    );
  }
}

module.exports = new ReportController();
