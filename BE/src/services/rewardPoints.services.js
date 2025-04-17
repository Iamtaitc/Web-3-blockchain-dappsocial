const { RewardPoints, User, Task, CompletedTask } = require("../models/index");
const { getSubscriptionInfo } = require("./blockchain.services");

/**
 * Service xử lý các chức năng liên quan đến điểm thưởng và tokens
 */
class RewardPointsService {
  /**
   * Kiểm tra tính hợp lệ của địa chỉ ví
   * @param {String} address - Địa chỉ ví cần kiểm tra
   * @returns {Boolean} - Kết quả kiểm tra
   * @private
   */
  _validateWalletAddress(address) {
    if (!address || typeof address !== "string") {
      throw new Error("Địa chỉ ví không hợp lệ");
    }

    // Kiểm tra định dạng địa chỉ Ethereum (0x theo sau bởi 40 ký tự hex)
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethereumAddressRegex.test(address)) {
      throw new Error("Địa chỉ ví không đúng định dạng Ethereum");
    }

    return true;
  }

  /**
   * Lấy ngày hiện tại (đầu ngày)
   * @returns {Date} - Ngày hiện tại lúc 00:00:00
   * @private
   */
  _getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Lấy thông tin subscription và multiplier của người dùng
   * @param {String} address - Địa chỉ ví
   * @returns {Object} - Thông tin multiplier
   * @private
   */
  async _getMultiplier(address) {
    try {
      const subscriptionInfo = await getSubscriptionInfo(address);
      return subscriptionInfo.level || 1;
    } catch (error) {
      return 1; // Default multiplier if error
    }
  }

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

      return {
        success: true,
        message: "Claim token thành công",
        data: {
          amount: tokenAmount,
          totalPending: userRewards.pendingTokens,
          subscriptionLevel: subscriptionInfo.isActive
            ? subscriptionInfo.level
            : 0,
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

  /**
   * Xử lý hoàn thành nhiệm vụ
   * @param {String} walletAddress - Địa chỉ ví
   * @param {Object} task - Thông tin nhiệm vụ
   * @returns {Object} Kết quả xử lý
   */
  async completeTask(walletAddress, taskId) {
    try {
      this._validateWalletAddress(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      // Sử dụng session để đảm bảo tính nguyên vẹn của transaction
      const session = await RewardPoints.startSession();

      try {
        session.startTransaction();

        // Tìm task trong database
        const task = await Task.findById(taskId).session(session);

        if (!task) {
          await session.abortTransaction();
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
        }).session(session);

        if (alreadyCompleted) {
          await session.abortTransaction();
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
          { upsert: true, new: true, session }
        );

        // Cập nhật points cho User
        await User.findOneAndUpdate(
          { walletAddress: normalizedAddress },
          { $inc: { points: pointsEarned } },
          { session }
        );

        // Ghi nhận nhiệm vụ đã hoàn thành
        await CompletedTask.create(
          [
            {
              user: normalizedAddress,
              taskId,
              pointsEarned,
              tokensEarned,
              completedForDate: today,
              createdAt: new Date(),
            },
          ],
          { session }
        );

        await session.commitTransaction();

        return {
          success: true,
          message: "Hoàn thành nhiệm vụ thành công",
          data: { pointsEarned, tokensEarned, taskName: task.name },
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
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

module.exports = new RewardPointsService();
