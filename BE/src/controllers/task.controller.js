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
        result.error
      );
    }

    return ApiResponse.success(res, {
      tasks: result.data.tasks,
      completedCount: result.data.completedCount,
      totalTasks: result.data.totalTasks,
    });
  }

  /**
   * Check-in hàng ngày
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async checkIn(req, res) {
    const address = req.user.address;

    const result = await TaskService.checkIn(address);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      message: "Check-in successful",
      streak: result.data.streak,
      pointsEarned: result.data.pointsEarned,
      tokensEarned: result.data.tokensEarned,
      checkIn: result.data.checkIn,
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

  /**
   * Lấy thông tin points của user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserPoints(req, res) {
    const address = req.user.address;

    const result = await TaskService.getUserPoints(address);

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
   * Claim tokens
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async claimTokens(req, res) {
    const walletAddress = req.user.address;

    const result = await TaskService.claimTokens(walletAddress);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      message: "Claim token thành công",
      amount: result.data.amount,
      transactionHash: result.data.transactionHash,
    });
  }

  /**
 * Hoàn thành nhiệm vụ
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async completeTask(req, res) {
  const taskId = req.params.taskId;
  const address = req.user.address;
  
  const result = await TaskService.completeTask(address, taskId);
  
  if (!result.success) {
    return ApiResponse.error(
      res,
      result.message,
      result.status,
      result.error
    );
  }
  
  return ApiResponse.success(res, {
    message: "Hoàn thành nhiệm vụ thành công",
    pointsEarned: result.data.pointsEarned,
    tokensEarned: result.data.tokensEarned,
  });
}
}



module.exports = new TaskController();

