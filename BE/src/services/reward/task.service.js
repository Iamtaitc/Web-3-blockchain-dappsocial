const {
  RewardPoints,
  User,
  Task,
  CompletedTask,
} = require("../../models/index");
const BaseRewardService = require("./base.service");

/**
 * Service xử lý các nhiệm vụ và phần thưởng
 */
class TaskService extends BaseRewardService {
  /**
   * Xử lý hoàn thành nhiệm vụ
   * @param {String} walletAddress - Địa chỉ ví
   * @param {String} taskId - Id của nhiệm vụ
   * @returns {Object} Kết quả xử lý
   */
  async completeTask(walletAddress, taskId) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();
      const today = this._getTodayStart();

      // Tìm task với trạng thái active
      const task = await Task.findOne({ _id: taskId, isActive: true });
      if (!task) {
        return {
          success: false,
          status: 404,
          message: "Nhiệm vụ không tồn tại hoặc không active",
        };
      }

      // Kiểm tra rewardPoints và rewardTokens
      if (task.rewardPoints < 0 || task.rewardTokens < 0) {
        return {
          success: false,
          status: 400,
          message: "Phần thưởng không hợp lệ",
        };
      }

      // Kiểm tra xem nhiệm vụ đã hoàn thành hôm nay chưa
      const alreadyCompleted = await CompletedTask.findOne({
        user: normalizedAddress,
        taskId,
        completedForDate: { $gte: today },
      });

      if (alreadyCompleted) {
        return {
          success: false,
          status: 400,
          message: "Nhiệm vụ này đã được hoàn thành hôm nay",
        };
      }

      // Lấy multiplier từ subscription
      const user = await User.findOne({ walletAddress: normalizedAddress });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }
      const multiplier = user.rewardMultiplier || 1;

      // Tính toán điểm và token
      const pointsEarned = task.rewardPoints * multiplier;
      const tokensEarned = task.rewardTokens * multiplier;

      // Cập nhật UserRewards
      await RewardPoints.findOneAndUpdate(
        { user: normalizedAddress },
        {
          $inc: {
            totalPoints: pointsEarned,
            pendingTokens: tokensEarned,
          },
        },
        { upsert: true, new: true }
      );

      // Cập nhật points cho User
      await User.findOneAndUpdate(
        { walletAddress: normalizedAddress },
        { $inc: { points: pointsEarned } }
      );

      // Ghi nhận nhiệm vụ đã hoàn thành
      await CompletedTask.create({
        user: normalizedAddress,
        taskId,
        pointsEarned,
        tokensEarned,
        completedForDate: today,
        createdAt: new Date(),
      });

      // Xóa các bản ghi CompletedTask cũ hơn 30 ngày
      await CompletedTask.deleteMany({
        user: normalizedAddress,
        completedForDate: {
          $lt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        status: 200,
        message: "Hoàn thành nhiệm vụ thành công",
        data: { pointsEarned, tokensEarned, taskName: task.name },
      };
    } catch (error) {
      console.error("Error completing task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi hoàn thành nhiệm vụ",
        error: error.message,
      };
    }
  }
}

module.exports = new TaskService();
