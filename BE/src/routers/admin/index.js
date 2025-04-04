"use strict";
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth.middleware');
const AdminControllerClass = require("../../controllers/admin.controller");

// Tạo instance cho AdminController
const adminController = new AdminControllerClass();

// Middleware bảo vệ tất cả các route Admin
router.use(verifyToken);
router.use(adminController.checkAdminAccess.bind(adminController));

// Dashboard & Statistics
router.get("/dashboard/stats", adminController.getDashboardStats.bind(adminController));
router.get("/users/overtime", adminController.getUsersOverTime.bind(adminController));

// User Management
router.get("/users", adminController.getUsers.bind(adminController));
router.patch("/user/status/:walletAddress", adminController.updateUserStatus.bind(adminController));
router.patch("/user/verify/:walletAddress", adminController.verifyUser.bind(adminController));

// Content Moderation
router.get("/posts/moderation", adminController.getModerationPosts.bind(adminController));
router.patch("/post/status/:postId", adminController.updatePostStatus.bind(adminController));

// Task Management
router.get("/tasks", adminController.getAllTasks.bind(adminController));
router.post("/task", adminController.createTask.bind(adminController));
router.patch("/task/:taskId", adminController.updateTask.bind(adminController));
router.delete("/task/:taskId", adminController.deleteTask.bind(adminController));
router.post("/tasks/reset-daily", adminController.resetDailyTasks.bind(adminController));

// System Operations
router.post("/mint/token", adminController.mintDXTokens.bind(adminController));
router.post("/announcement", adminController.createSystemAnnouncement.bind(adminController));
router.get("/logs", adminController.getSystemLogs.bind(adminController));
router.post("/blockchain/sync", adminController.forceBlockchainSync.bind(adminController));
router.patch("/system/config", adminController.updateSystemConfig.bind(adminController));

module.exports = router;