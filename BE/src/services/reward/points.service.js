// services/reward/points.service.js
const { RewardPoints, User, CompletedTask } = require("../../models/index");
const BaseRewardService = require("./base.service");

/**
 * Service xử lý thông tin điểm thưởng
 */
class PointsService extends BaseRewardService {
  /**
   * Lấy thông tin điểm thưởng của người dùng
   * @param {String} address - Địa chỉ ví
   * @returns {Object} Thông tin điểm thưởng
   */
  async getUserPoints(address) {
    try {
      this._validateWalletAddress(address);
      const normalizedAddress = address.toLowerCase();
      const today = this._getTodayStart();

      // Thực hiện các truy vấn song song để tăng hiệu suất
      const [user, completedToday, userRewards] = await Promise.all([
        User.findOne({ walletAddress: normalizedAddress }),
        CompletedTask.find({
          user: normalizedAddress,
          completedForDate: { $gte: today },
        }),
        RewardPoints.findOne({ user: normalizedAddress }),
      ]);

      if (!user) {
        return {
          success: false,
          message: "Không tìm thấy người dùng",
        };
      }

      // Tìm check-in hôm nay từ history nếu có
      let todayCheckIn = null;
      if (userRewards && userRewards.checkIn && userRewards.checkIn.history) {
        todayCheckIn = userRewards.checkIn.history.find(
          (check) =>
            new Date(check.date).setHours(0, 0, 0, 0) === today.getTime()
        );
      }

      const todayPoints =
        completedToday.reduce((sum, task) => sum + task.pointsEarned, 0) +
        (todayCheckIn ? todayCheckIn.pointsEarned : 0);

      // Tính toán nextClaimTime
      let nextClaimTime = null;
      if (userRewards && userRewards.lastClaimTime) {
        // Thời gian claim tiếp theo là 8 giờ sau lần claim cuối cùng
        nextClaimTime = new Date(userRewards.lastClaimTime);
        nextClaimTime.setHours(nextClaimTime.getHours() + 8);

        // Nếu thời gian claim tiếp theo đã qua, thì người dùng có thể claim ngay
        const now = new Date();
        if (nextClaimTime <= now) {
          nextClaimTime = now;
        }
      }

      return {
        success: true,
        message: "Lấy thông tin points thành công",
        data: {
          points: user.points || 0,
          todayPoints,
          checkInStreak: userRewards
            ? userRewards.checkIn.currentStreak || 0
            : 0,
          lastCheckIn: userRewards ? userRewards.checkIn.lastCheckIn : null,
          pendingTokens: userRewards ? userRewards.pendingTokens : 0,
          claimedTokens: userRewards ? userRewards.claimedTokens : 0,
          totalPoints: userRewards ? userRewards.totalPoints : 0,
          lastClaimTime: userRewards ? userRewards.lastClaimTime : null,
          nextClaimTime: nextClaimTime, // Thêm nextClaimTime vào response
          canClaimNow: nextClaimTime ? new Date() >= nextClaimTime : false, // Flag cho biết có thể claim ngay hay không
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi lấy thông tin points",
        error: error.message,
      };
    }
  }

  /**
   * Lấy thông tin rewards của người dùng
   * @param {String} walletAddress - Địa chỉ ví
   * @returns {Object} Thông tin rewards
   */
  async getUserRewards(walletAddress) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      const userRewards = await RewardPoints.findOne({
        user: normalizedAddress,
      });

      if (!userRewards) {
        return {
          success: true,
          data: {
            pendingTokens: 0,
            claimedTokens: 0,
            totalPoints: 0,
            checkIn: {
              currentStreak: 0,
              lastCheckIn: null,
              history: [],
            },
          },
        };
      }

      return {
        success: true,
        data: userRewards.toObject(),
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi lấy thông tin rewards",
        error: error.message,
      };
    }
  }
}

module.exports = new PointsService();
