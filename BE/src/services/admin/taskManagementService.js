/**
 * Task Management Service - Quản lý nhiệm vụ
 */

const { Task, CompletedTask } = require("../../models/index");

class TaskManagementService {
  /**
   * Quản lý nhiệm vụ - Lấy tất cả nhiệm vụ
   * @returns {Object} Kết quả lấy danh sách
   */
  async getAllTasks() {
    try {
      const tasks = await Task.find().sort({ type: 1, createdAt: -1 });

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách nhiệm vụ thành công",
        data: tasks,
      };
    } catch (error) {
      console.error("Error getting tasks:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Tạo nhiệm vụ mới
   * @param {Object} taskData - Dữ liệu nhiệm vụ
   * @returns {Object} Kết quả tạo nhiệm vụ
   */
  async createTask(taskData) {
    try {
      // Tạo nhiệm vụ mới
      const newTask = new Task({
        name: taskData.name,
        description: taskData.description,
        type: taskData.type || "daily",
        rewardPoints: parseInt(taskData.rewardPoints) || 0,
        rewardTokens: parseFloat(taskData.rewardTokens) || 0,
        requirements: taskData.requirements,
        isActive: true,
        createdAt: new Date(),
      });

      await newTask.save();

      return {
        success: true,
        status: 201,
        message: "Tạo nhiệm vụ thành công",
        data: newTask,
      };
    } catch (error) {
      console.error("Error creating task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật nhiệm vụ
   * @param {String} taskId - ID nhiệm vụ
   * @param {Object} taskData - Dữ liệu cập nhật
   * @returns {Object} Kết quả cập nhật
   */
  async updateTask(taskId, taskData) {
    try {
      // Cập nhật nhiệm vụ
      const task = await Task.findByIdAndUpdate(
        taskId,
        {
          $set: {
            name: taskData.name,
            description: taskData.description,
            type: taskData.type,
            rewardPoints: parseInt(taskData.rewardPoints),
            rewardTokens: parseFloat(taskData.rewardTokens),
            requirements: taskData.requirements,
            isActive: Boolean(taskData.isActive),
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!task) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy nhiệm vụ",
        };
      }

      return {
        success: true,
        status: 200,
        message: "Cập nhật nhiệm vụ thành công",
        data: task,
      };
    } catch (error) {
      console.error("Error updating task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Xóa nhiệm vụ
   * @param {String} taskId - ID nhiệm vụ
   * @returns {Object} Kết quả xóa
   */
  async deleteTask(taskId) {
    try {
      // Xóa nhiệm vụ
      const task = await Task.findByIdAndDelete(taskId);

      if (!task) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy nhiệm vụ",
        };
      }

      // Xóa tất cả completed tasks liên quan
      await CompletedTask.deleteMany({ taskId });

      return {
        success: true,
        status: 200,
        message: "Xóa nhiệm vụ thành công",
      };
    } catch (error) {
      console.error("Error deleting task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xóa nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Reset nhiệm vụ hàng ngày
   * @returns {Object} Kết quả reset
   */
  async resetDailyTasks() {
    try {
      // Xóa tất cả completed tasks của ngày hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await CompletedTask.deleteMany({
        completedForDate: {
          $gte: today,
        },
      });

      return {
        success: true,
        status: 200,
        message: "Reset nhiệm vụ hàng ngày thành công",
        data: result.deletedCount,
      };
    } catch (error) {
      console.error("Error resetting daily tasks:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi reset nhiệm vụ hàng ngày",
        error: error.message,
      };
    }
  }
}

module.exports = new TaskManagementService();
