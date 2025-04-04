"use strict";
const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/report.controller");

router.post("/report", reportController.createReport);

// Lấy danh sách báo cáo của người dùng hiện tại (yêu cầu đăng nhập)
router.get("/reports", reportController.getUserReports);

// Lấy danh sách tất cả các báo cáo (admin only)
router.get("/admin/reports", reportController.getAllReports);

// Cập nhật trạng thái báo cáo (admin only)
router.patch("/admin/report/:reportId", reportController.updateReportStatus);

module.exports = router;
