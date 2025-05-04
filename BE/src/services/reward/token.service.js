// services/reward/token.service.js
const { RewardPoints } = require("../../models/index");
const { getSubscriptionInfo } = require("../blockchain.services");
const BaseRewardService = require("./base.service");

/**
 * Service xử lý tokens
 */
class TokenService extends BaseRewardService {
  /**
   * Claim tokens từ pending sang claimed
   * @param {String} walletAddress - Địa chỉ ví
   * @returns {Object} Kết quả claim
   */
  async claimTokens(walletAddress) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      // Lấy thông tin rewards của user
      const userRewards = await RewardPoints.findOne({
        user: normalizedAddress,
      });

      if (!userRewards) {
        return {
          success: false,
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
            message: "Bạn chỉ có thể claim 8h một lần",
            error: { nextClaimTime },
          };
        }
      }

      // Lấy thông tin subscription để tính toán số token
      const subscriptionInfo = await getSubscriptionInfo(normalizedAddress);

      // Số token cơ bản cho mỗi lần claim (8 giờ)
      const baseTokenAmount = 8;

      // Nhân hệ số dựa vào level subscription
      let multiplier = 1; // Mặc định là 1 cho người không có subscription

      if (subscriptionInfo.isActive) {
        switch (subscriptionInfo.level) {
          case 1: // Standard
            multiplier = 1.5;
            break;
          case 2: // Plus
            multiplier = 2;
            break;
          case 5: // Pro
            multiplier = 3;
            break;
          case 10: // Elite
            multiplier = 5;
            break;
          default:
            multiplier = 1;
        }
      }

      // Tính số token người dùng nhận được
      const tokenAmount = Math.floor(baseTokenAmount * multiplier);

      // Lấy private key từ môi trường (nếu muốn mint trên blockchain)
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("Không thể lấy private key từ cấu hình");
      }

      // Trong tương lai, khi muốn mint token on-chain, bỏ comment đoạn code này
      // const result = await blockchainService.mintReward(
      //   privateKey,
      //   walletAddress,
      //   tokenAmount.toString()
      // );

      // Cập nhật database
      userRewards.pendingTokens += tokenAmount; // Cộng dồn vào pending tokens
      userRewards.lastClaimTime = new Date();
      userRewards.claimHistory.push({
        amount: tokenAmount,
        timestamp: new Date(),
        // Khi mint trên blockchain, bỏ comment dòng này
        // transactionHash: result.transactionHash,
      });

      await userRewards.save();

      // Tính thời gian có thể claim tiếp theo (8 giờ kể từ lúc claim hiện tại)
      const nextClaimTime = new Date(userRewards.lastClaimTime);
      nextClaimTime.setHours(nextClaimTime.getHours() + 8);

      return {
        success: true,
        message: "Claim token thành công",
        data: {
          amount: tokenAmount,
          totalPending: userRewards.pendingTokens,
          subscriptionLevel: subscriptionInfo.isActive
            ? subscriptionInfo.level
            : 0,
          nextClaimTime: nextClaimTime, // Thời gian có thể claim tiếp theo
          // Khi mint trên blockchain, bỏ comment dòng này
          // transactionHash: result.transactionHash,
        },
      };
    } catch (error) {
      return {
        success: false,
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
          message: `Chào mừng bạn! Bạn đã nhận ${welcomeBonus} token`,
          isFirstLogin: true,
          data: {
            pendingTokens: welcomeBonus,
          },
        };
      }

      return {
        success: true,
        isFirstLogin: false,
        data: {
          pendingTokens: userRewards.pendingTokens,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi xử lý đăng nhập",
        error: error.message,
      };
    }
  }
}

module.exports = new TokenService();