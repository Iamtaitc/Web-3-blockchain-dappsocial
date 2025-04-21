"use strict";
const express = require('express');
const router = express.Router();
const AdminControllerClass = require("../../controllers/admin.controller");

// Tạo instance cho AdminController
const adminController = new AdminControllerClass();

// Middleware bảo vệ tất cả các route Admin
router.use(adminController.checkAdminAccess.bind(adminController));
//todo: test xong
// Dashboard & Statistics
router.get("/admin/dashboard/stats", adminController.getDashboardStats.bind(adminController));
router.get("/admin/users/overtime", adminController.getUsersOverTime.bind(adminController));

//Todo: done
// User Management
router.get("/admin/users", adminController.getUsers.bind(adminController));
router.patch("/admin/user/status/:walletAddress", adminController.updateUserStatus.bind(adminController));
router.patch("/admin/user/verify/:walletAddress", adminController.verifyUser.bind(adminController));

// Content Moderation
router.get("/admin/posts/moderation", adminController.getModerationPosts.bind(adminController));
router.patch("/admin/post/status/:postId", adminController.updatePostStatus.bind(adminController));

//Todo: test xong
// Task Management
router.get("/admin/tasks", adminController.getAllTasks.bind(adminController));
router.post("/admin/task", adminController.createTask.bind(adminController));
router.patch("/admin/task/:taskId", adminController.updateTask.bind(adminController));
router.delete("/admin/task/:taskId", adminController.deleteTask.bind(adminController));
router.post("/admin/tasks/reset-daily", adminController.resetDailyTasks.bind(adminController));

// Todo: chưa test
// System Operations
router.post("/admin/mint/token", adminController.mintDXTokens.bind(adminController));
router.post("/admin/announcement", adminController.createSystemAnnouncement.bind(adminController));
router.get("/admin/logs", adminController.getSystemLogs.bind(adminController));
router.post("/admin/blockchain/sync", adminController.forceBlockchainSync.bind(adminController));
router.patch("/admin/system/config", adminController.updateSystemConfig.bind(adminController));

module.exports = router;