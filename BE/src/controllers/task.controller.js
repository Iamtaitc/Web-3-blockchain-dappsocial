// src/controllers/TaskController.js
const ApiResponse = require("../utils/apiResponse.utils");
const TaskService = require("../services/task.services");

/**
 * Controller xử lý các chức năng nhiệm vụ
 */
class TaskController {
  /**
   * Lấy tất cả nhiệm vụ
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllTasks(req, res) {
    const result = await TaskService.getAllTasks();

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
   * Lấy nhiệm vụ đã hoàn thành của user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserTasks(req, res) {
    const address = req.user.address;

    const result = await TaskService.getUserTasks(address);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
      );
    }

    return ApiResponse.success(res, {
      tasks: result.data.tasks,
      completedCount: result.data.completedCount,
      totalTasks: result.data.totalTasks,
    });
  }

  /**
   * Lấy thông tin subscription
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserSubscription(req, res) {
    const address = req.user.address;

    const result = await TaskService.getUserSubscription(address);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      subscription: result.data,
    });
  }
}

module.exports = new TaskController();
