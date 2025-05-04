/**
 * Index file - export tất cả các service quản trị
 */

const dashboardService = require("./dashboardService");
const userManagementService = require("./userManagementService");
const contentModerationService = require("./contentModerationService");
const taskManagementService = require("./taskManagementService");
const tokenService = require("./tokenService");
const notificationService = require("./notificationService");
const statisticsService = require("./statisticsService");
const systemService = require("./systemService");

module.exports = {
  // Dashboard
  getDashboardStats: dashboardService.getDashboardStats,

  // Quản lý người dùng
  getUsers: userManagementService.getUsers,
  updateUserStatus: userManagementService.updateUserStatus,
  verifyUser: userManagementService.verifyUser,

  // Quản lý nội dung
  getModerationPosts: contentModerationService.getModerationPosts,
  updatePostStatus: contentModerationService.updatePostStatus,

  // Quản lý nhiệm vụ
  getAllTasks: taskManagementService.getAllTasks,
  createTask: taskManagementService.createTask,
  updateTask: taskManagementService.updateTask,
  deleteTask: taskManagementService.deleteTask,
  resetDailyTasks: taskManagementService.resetDailyTasks,

  // Quản lý token
  mintDXTokens: tokenService.mintDXTokens,

  // Quản lý thông báo
  createSystemAnnouncement: notificationService.createSystemAnnouncement,

  // Thống kê
  getUsersOverTime: statisticsService.getUsersOverTime,

  // Quản lý hệ thống
  updateSystemConfig: systemService.updateSystemConfig,
  getSystemLogs: systemService.getSystemLogs,
  forceBlockchainSync: systemService.forceBlockchainSync,
};
