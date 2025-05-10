const { RewardPoints, User } = require("../../models/index");
const BaseRewardService = require("./base.service");

/**
 * Service xử lý tokens
 */
class TokenService extends BaseRewardService {
  /**
   * Claim tokens từ pending
   * @param {String} walletAddress - Địa chỉ ví
   * @returns {Object} Kết quả claim
   */
  async claimTokens(walletAddress) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      // Lấy thông tin user và rewards
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

      if (!userRewards) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy thông tin rewards của người dùng",
        };
      }

      // Kiểm tra thời gian claim (giới hạn 8h claim 1 lần)
      if (userRewards.lastClaimTime) {
        const hoursSinceLastClaim =
          (new Date() - userRewards.lastClaimTime) / (1000 * 60 * 60);
        if (hoursSinceLastClaim < 8) {
          const nextClaimTime = new Date(userRewards.lastClaimTime);
          nextClaimTime.setHours(nextClaimTime.getHours() + 8);
          return {
            success: false,
            status: 400,
            message: "Bạn chỉ có thể claim 8h một lần",
            error: { nextClaimTime },
          };
        }
      }

      // Số token cơ bản cho mỗi lần claim (8 giờ)
      const baseTokenAmount = 8;
      const multiplier = user.rewardMultiplier || 1;
      const tokenAmount = Math.floor(baseTokenAmount * multiplier);

      // Kiểm tra giới hạn pendingTokens
      const maxPendingTokens = 1000;
      if (userRewards.pendingTokens + tokenAmount > maxPendingTokens) {
        return {
          success: false,
          status: 400,
          message: "Đã đạt giới hạn pending tokens",
        };
      }

      // Kiểm tra private key trong môi trường production
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey && process.env.NODE_ENV === "production") {
        throw new Error("Không thể lấy private key từ cấu hình");
      }

      // Cập nhật database
      userRewards.pendingTokens += tokenAmount;
      userRewards.lastClaimTime = new Date();
      userRewards.claimHistory.push({
        amount: tokenAmount,
        timestamp: new Date(),
      });

      await userRewards.save();

      // Tính thời gian claim tiếp theo
      const nextClaimTime = new Date(userRewards.lastClaimTime);
      nextClaimTime.setHours(nextClaimTime.getHours() + 8);

      return {
        success: true,
        status: 200,
        message: "Claim token thành công",
        data: {
          amount: tokenAmount,
          totalPending: userRewards.pendingTokens,
          subscriptionLevel: user.subscription?.level || 0,
          nextClaimTime,
        },
      };
    } catch (error) {
      console.error("Error claiming tokens:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi claim token",
        error: error.message,
      };
    }
  }

  /**
   * Xử lý đăng nhập lần đầu
   * @param {String} walletAddress - Địa chỉ ví
   * @returns {Object} Kết quả xử lý
   */
  async handleFirstLogin(walletAddress) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      // Kiểm tra xem user đã tồn tại chưa
      const userRewards = await RewardPoints.findOne({
        user: normalizedAddress,
      });

      // Nếu đây là lần đầu tiên, tạo mới và thưởng token
      if (!userRewards) {
        const welcomeBonus = 10; // Số token thưởng đăng nhập lần đầu
        const newUserRewards = await RewardPoints.create({
          user: normalizedAddress,
          pendingTokens: welcomeBonus,
          totalPoints: welcomeBonus,
          checkIn: {
            currentStreak: 0,
            history: [],
          },
          createdAt: new Date(),
        });

        return {
          success: true,
          status: 200,
          message: `Chào mừng bạn! Bạn đã nhận ${welcomeBonus} token`,
          isFirstLogin: true,
          data: {
            pendingTokens: welcomeBonus,
          },
        };
      }

      return {
        success: true,
        status: 200,
        isFirstLogin: false,
        data: {
          pendingTokens: userRewards.pendingTokens,
        },
      };
    } catch (error) {
      console.error("Error handling first login:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xử lý đăng nhập",
        error: error.message,
      };
    }
  }
}

module.exports = new TokenService();