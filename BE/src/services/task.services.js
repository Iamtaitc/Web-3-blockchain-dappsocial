const { Task, CompletedTask, User } = require("../models/index");

/**
 * Service xử lý các chức năng nhiệm vụ
 */
class TaskService {
  /**
   * Lấy tất cả nhiệm vụ
   * @returns {Object} Danh sách nhiệm vụ
   */
  async getAllTasks() {
    try {
      // Lấy danh sách nhiệm vụ active
      const tasks = await Task.find({ isActive: true }).sort({
        type: 1,
        rewardPoints: -1,
      });

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
   * Lấy nhiệm vụ đã hoàn thành của user
   * @param {String} address - Địa chỉ ví
   * @returns {Object} Danh sách nhiệm vụ với trạng thái hoàn thành
   */
  async getUserTasks(address) {
    try {
      // Get current date (at start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // Debug log
      console.log("Searching for tasks completed after:", today);
      console.log("User address:", address.toLowerCase());
  
      // Lấy nhiệm vụ đã hoàn thành hôm nay
      const completedToday = await CompletedTask.find({
        user: address.toLowerCase(),
        completedForDate: {
          $gte: today,
        },
      });
  
      // Debug logs
      console.log("CompletedToday count:", completedToday.length);
      console.log("CompletedToday sample:", completedToday.length > 0 ? completedToday[0] : "No completed tasks");
      
      // Manually create test data for a completed task if none exists
      // This is for testing only - remove in production
      let testCompletedTasks = [...completedToday];
      if (completedToday.length === 0) {
        // Find one task to mark as completed for testing
        const allTasks = await Task.find({ isActive: true });
        if (allTasks.length > 0) {
          console.log("Adding test completed task for debugging");
          testCompletedTasks.push({
            taskId: allTasks[0]._id,
            user: address.toLowerCase(),
            completedForDate: today,
            createdAt: new Date()
          });
        }
      }
  
      // Extract taskId strings from completedToday
      // Important: Make sure we're consistently comparing strings
      const completedTaskIds = testCompletedTasks.map((ct) => {
        const idStr = ct.taskId.toString ? ct.taskId.toString() : String(ct.taskId);
        console.log("Completed task ID:", idStr);
        return idStr;
      });
  
      // Lấy tất cả nhiệm vụ
      const allTasks = await Task.find({ isActive: true });
      console.log("All tasks count:", allTasks.length);
      
      // Sample task ID for debugging
      if (allTasks.length > 0) {
        console.log("Sample task ID format:", allTasks[0]._id);
        console.log("Sample task ID as string:", allTasks[0]._id.toString());
      }
  
      // Map task status (completed or not)
      const tasksWithStatus = allTasks.map((task) => {
        const taskIdStr = task._id.toString();
        const isCompleted = completedTaskIds.includes(taskIdStr);
        
        // Log each task comparison for debugging
        console.log(`Task "${task.name}" (${taskIdStr}) completed:`, isCompleted);
        
        // Find the completed task entry if it exists
        const completedEntry = testCompletedTasks.find(
          (ct) => {
            const ctIdStr = ct.taskId.toString ? ct.taskId.toString() : String(ct.taskId);
            const matched = ctIdStr === taskIdStr;
            if (matched) {
              console.log("Found match for task:", task.name);
            }
            return matched;
          }
        );
        
        return {
          _id: task._id,
          name: task.name,
          description: task.description,
          type: task.type,
          rewardPoints: task.rewardPoints,
          rewardTokens: task.rewardTokens,
          requirements: task.requirements,
          isCompleted: isCompleted,
          completedAt: completedEntry ? completedEntry.createdAt : undefined,
        };
      });
  
      // Group by type
      const groupedTasks = {
        daily: tasksWithStatus.filter((t) => t.type === "daily"),
        weekly: tasksWithStatus.filter((t) => t.type === "weekly"),
        special: tasksWithStatus.filter((t) => t.type === "special"),
      };
  
      console.log("Final tasks status:", 
        tasksWithStatus.map(t => ({ name: t.name, isCompleted: t.isCompleted }))
      );
  
      return {
        success: true,
        status: 200,
        message: "Lấy danh sách nhiệm vụ của người dùng thành công",
        data: {
          tasks: groupedTasks,
          completedCount: completedToday.length,
          totalTasks: allTasks.length,
        },
      };
    } catch (error) {
      console.error("Error getting user tasks:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách nhiệm vụ của người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Lấy thông tin subscription
   * @param {String} address - Địa chỉ ví
   * @returns {Object} Thông tin subscription
   */
  async getUserSubscription(address) {
    try {
      // Lấy thông tin subscription từ blockchain
      const subscriptionInfo =
        await blockchainService.getSubscriptionInfo(address);

      // Cập nhật thông tin subscription trong database nếu cần
      if (subscriptionInfo.isActive) {
        await User.updateOne(
          { walletAddress: address.toLowerCase() },
          {
            "subscription.level": subscriptionInfo.level,
            "subscription.expiration": subscriptionInfo.expiration,
          }
        );
      }

      return {
        success: true,
        status: 200,
        message: "Lấy thông tin subscription thành công",
        data: {
          level: subscriptionInfo.level,
          multiplier: subscriptionInfo.level,
          expiration: subscriptionInfo.expiration,
          isActive: subscriptionInfo.isActive,
        },
      };
    } catch (error) {
      console.error("Error getting subscription info:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy thông tin subscription",
        error: error.message,
      };
    }
  }

  /**
   * Lấy thông tin points của user
   * @param {String} address - Địa chỉ ví
   * @returns {Object} Thông tin points
   */
}

module.exports = new TaskService();
