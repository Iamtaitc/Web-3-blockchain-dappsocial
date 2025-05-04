// services/reward/checkin.service.js
const {
  RewardPoints,
  User,
  Task,
  CompletedTask,
} = require("../../models/index");
const BaseRewardService = require("./base.service");

/**
 * Service xử lý check-in hàng ngày
 */
class CheckInService extends BaseRewardService {
  /**
   * Check-in hàng ngày
   * @param {String} address - Địa chỉ ví
   * @returns {Object} Kết quả check-in
   */
  async checkIn(address) {
    try {
      this._validateWalletAddress(address);
      const normalizedAddress = address.toLowerCase();
      const today = this._getTodayStart();

      // Tìm hoặc tạo mới record RewardPoints
      let userRewards = await RewardPoints.findOne({
        user: normalizedAddress,
      });

      if (!userRewards) {
        userRewards = new RewardPoints({
          user: normalizedAddress,
          totalPoints: 0,
          pendingTokens: 0,
          claimedTokens: 0,
          checkIn: {
            currentStreak: 0,
            history: [],
          },
        });
      }

      // Kiểm tra đã check-in hôm nay chưa
      const todayCheckInExists = userRewards.checkIn.history.some(
        (check) => new Date(check.date).setHours(0, 0, 0, 0) === today.getTime()
      );

      if (todayCheckInExists) {
        return {
          success: false,
          message: "Bạn đã check-in hôm nay rồi",
        };
      }

      // Tính toán streak
      let streak = 1;
      const lastCheckIn = userRewards.checkIn.lastCheckIn;

      if (lastCheckIn) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (new Date(lastCheckIn).setHours(0, 0, 0, 0) >= yesterday.getTime()) {
          streak = userRewards.checkIn.currentStreak + 1;
        }
      }

      // Base rewards
      let pointsEarned = 5;
      let tokensEarned = 0;

      if (streak >= 7) pointsEarned += 2;
      if (streak >= 30) pointsEarned += 3;

      if (streak >= 7) tokensEarned = 1;
      if (streak >= 30) tokensEarned = 3;

      const multiplier = await this._getMultiplier(normalizedAddress);

      pointsEarned *= multiplier;
      tokensEarned *= multiplier;

      // Cập nhật thông tin check-in
      userRewards.checkIn.lastCheckIn = today;
      userRewards.checkIn.currentStreak = streak;
      userRewards.checkIn.lastStreakUpdate = new Date();

      // Thêm vào lịch sử check-in
      userRewards.checkIn.history.push({
        date: today,
        streak,
        pointsEarned,
        tokensEarned,
      });

      // Cập nhật điểm và token
      userRewards.totalPoints += pointsEarned;
      userRewards.pendingTokens += tokensEarned;

      // Lưu vào database
      await userRewards.save();

      // Cập nhật thông tin user
      await User.updateOne(
        { walletAddress: normalizedAddress },
        {
          $inc: { points: pointsEarned },
          $set: { checkInStreak: streak, lastCheckIn: today },
        }
      );

      // Xử lý nhiệm vụ check-in hàng ngày nếu có
      const checkInTask = await Task.findOne({
        name: "Daily Check-in",
        isActive: true,
      });

      if (checkInTask) {
        await CompletedTask.create({
          user: normalizedAddress,
          taskId: checkInTask._id,
          completedForDate: today,
          pointsEarned: checkInTask.rewardPoints * multiplier,
          tokensEarned: checkInTask.rewardTokens * multiplier,
          createdAt: new Date(),
        });
      }

      return {
        success: true,
        message: "Check-in thành công",
        data: {
          streak,
          pointsEarned,
          tokensEarned,
          checkInInfo: userRewards.checkIn,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi check-in",
        error: error.message,
      };
    }
  }
}

module.exports = new CheckInService();
