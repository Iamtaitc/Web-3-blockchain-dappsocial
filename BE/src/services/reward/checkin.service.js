const { RewardPoints, User, Task, CompletedTask } = require("../../models/index");
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

      // Tìm user và rewards song song
      const [user, userRewards] = await Promise.all([
        User.findOne({ walletAddress: normalizedAddress }),
        RewardPoints.findOne({ user: normalizedAddress }),
      ]);

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      // Tạo mới record RewardPoints nếu chưa có
      const rewards = userRewards || new RewardPoints({
        user: normalizedAddress,
        totalPoints: 0,
        pendingTokens: 0,
        claimedTokens: 0,
        checkIn: {
          currentStreak: 0,
          history: [],
        },
      });

      // Kiểm tra đã check-in hôm nay chưa
      const todayCheckInExists = rewards.checkIn.history?.some(
        (check) => new Date(check.date).setHours(0, 0, 0, 0) === today.getTime()
      );

      if (todayCheckInExists) {
        return {
          success: false,
          status: 400,
          message: "Bạn đã check-in hôm nay rồi",
        };
      }

      // Tính toán streak
      let streak = 1;
      const lastCheckIn = rewards.checkIn.lastCheckIn;
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn);
        lastCheckInDate.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastCheckInDate.getTime() === yesterday.getTime()) {
          streak = rewards.checkIn.currentStreak + 1;
        }
      }

      // Base rewards
      let pointsEarned = 5;
      let tokensEarned = 0;

      if (streak >= 7) pointsEarned += 2;
      if (streak >= 30) pointsEarned += 3;
      if (streak >= 7) tokensEarned = 1;
      if (streak >= 30) tokensEarned = 3;

      const multiplier = user.rewardMultiplier || 1;
      pointsEarned *= multiplier;
      tokensEarned *= multiplier;

      // Cập nhật thông tin check-in
      rewards.checkIn.lastCheckIn = today;
      rewards.checkIn.currentStreak = streak;
      rewards.checkIn.lastStreakUpdate = new Date();
      rewards.checkIn.history.push({
        date: today,
        streak,
        pointsEarned,
        tokensEarned,
      });

      // Giới hạn history tối đa 30 bản ghi
      rewards.checkIn.history = rewards.checkIn.history.slice(-30);

      // Cập nhật điểm và token
      rewards.totalPoints += pointsEarned;
      rewards.pendingTokens += tokensEarned;

      // Lưu vào database
      await rewards.save();

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
        status: 200,
        message: "Check-in thành công",
        data: {
          streak,
          pointsEarned,
          tokensEarned,
          checkInInfo: rewards.checkIn,
        },
      };
    } catch (error) {
      console.error("Error during check-in:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi check-in",
        error: error.message,
      };
    }
  }
}

module.exports = new CheckInService();