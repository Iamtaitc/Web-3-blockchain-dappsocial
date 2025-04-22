// services/reward/task.service.js
const { RewardPoints, User, Task, CompletedTask } = require("../../models/index");
const BaseRewardService = require("./base.service");

/**
 * Service xử lý các nhiệm vụ và phần thưởng
 */
class TaskService extends BaseRewardService {
  /**
   * Xử lý hoàn thành nhiệm vụ
   * @param {String} walletAddress - Địa chỉ ví
   * @param {Object} taskId - Id của nhiệm vụ
   * @returns {Object} Kết quả xử lý
   */
  async completeTask(walletAddress, taskId) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      try {
        // Tìm task trong database
        const task = await Task.findById(taskId);

        if (!task) {
          return {
            success: false,
            message: "Không tìm thấy nhiệm vụ",
          };
        }

        // Kiểm tra xem nhiệm vụ đã hoàn thành chưa
        const today = this._getTodayStart();
        const alreadyCompleted = await CompletedTask.findOne({
          user: normalizedAddress,
          taskId,
          completedForDate: { $gte: today },
        });

        if (alreadyCompleted) {
          return {
            success: false,
            message: "Nhiệm vụ này đã được hoàn thành hôm nay",
          };
        }

        // Lấy multiplier từ subscription
        const multiplier = await this._getMultiplier(normalizedAddress);

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

        return {
          success: true,
          message: "Hoàn thành nhiệm vụ thành công",
          data: { pointsEarned, tokensEarned, taskName: task.name },
        };
      } catch (error) {
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi hoàn thành nhiệm vụ",
        error: error.message,
      };
    }
  }
}

module.exports = new TaskService();