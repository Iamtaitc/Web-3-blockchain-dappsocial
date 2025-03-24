const {
  Task,
  CompletedTask,
  CheckIn,
  User,
  UserRewards,
} = require("../models/index");
const blockchainService = require("./blockchain.services");

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

      // Lấy nhiệm vụ đã hoàn thành hôm nay
      const completedToday = await CompletedTask.find({
        user: address.toLowerCase(),
        completedForDate: {
          $gte: today,
        },
      });

      const completedTaskIds = completedToday.map((ct) => ct.taskId.toString());

      // Lấy tất cả nhiệm vụ
      const allTasks = await Task.find({ isActive: true });

      // Map task status (completed or not)
      const tasksWithStatus = allTasks.map((task) => ({
        _id: task._id,
        name: task.name,
        description: task.description,
        type: task.type,
        rewardPoints: task.rewardPoints,
        rewardTokens: task.rewardTokens,
        requirements: task.requirements,
        isCompleted: completedTaskIds.includes(task._id.toString()),
        completedAt: completedToday.find(
          (ct) => ct.taskId.toString() === task._id.toString()
        )?.createdAt,
      }));

      // Group by type
      const groupedTasks = {
        daily: tasksWithStatus.filter((t) => t.type === "daily"),
        weekly: tasksWithStatus.filter((t) => t.type === "weekly"),
        special: tasksWithStatus.filter((t) => t.type === "special"),
      };

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
   * Hoàn thành nhiệm vụ
   * @param {String} user - Địa chỉ ví
   * @param {String} taskId - ID nhiệm vụ
   * @returns {Object} Kết quả hoàn thành
   */
  async completeTask(user, taskId) {
    try {
      // Tìm task trong database
      const task = await Task.findById(taskId);

      if (!task) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy nhiệm vụ",
        };
      }

      // Lấy multiplier từ subscription
      const subscriptionInfo =
        await blockchainService.getSubscriptionInfo(user);
      const multiplier = subscriptionInfo.level;

      // Tính toán điểm và token
      const pointsEarned = task.rewardPoints;
      const tokensEarned = task.rewardTokens * multiplier;

      // Cập nhật UserRewards
      await UserRewards.findOneAndUpdate(
        { user: user.toLowerCase() },
        {
          $inc: {
            totalPoints: pointsEarned,
            pendingTokens: tokensEarned,
          },
        },
        { upsert: true }
      );

      // Ghi nhận nhiệm vụ đã hoàn thành
      await CompletedTask.create({
        user: user.toLowerCase(),
        taskId,
        pointsEarned,
        tokensEarned,
        completedForDate: new Date(),
      });

      return {
        success: true,
        status: 200,
        message: "Hoàn thành nhiệm vụ thành công",
        data: { pointsEarned, tokensEarned },
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

  /**
   * Check-in hàng ngày
   * @param {String} address - Địa chỉ ví
   * @returns {Object} Kết quả check-in
   */
  async checkIn(address) {
    try {
      // Get current date (at start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Kiểm tra đã check-in chưa
      const alreadyCheckedIn = await CheckIn.findOne({
        user: address.toLowerCase(),
        date: {
          $gte: today,
        },
      });

      if (alreadyCheckedIn) {
        return {
          success: false,
          status: 400,
          message: "Bạn đã check-in hôm nay rồi",
        };
      }

      // Lấy check-in gần nhất để tính streak
      const lastCheckIn = await CheckIn.findOne({
        user: address.toLowerCase(),
      }).sort({ date: -1 });

      // Tính streak
      let streak = 1;
      if (lastCheckIn) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastCheckIn.date >= yesterday) {
          streak = lastCheckIn.streak + 1;
        }
      }

      // Base rewards
      let pointsEarned = 5; // Base 5 points
      let tokensEarned = 0;

      // Bonus for streak
      if (streak >= 7) pointsEarned += 2; // +2 for 7 days
      if (streak >= 30) pointsEarned += 3; // +3 more for 30 days

      // Add token rewards for streaks
      if (streak >= 7) tokensEarned = 1;
      if (streak >= 30) tokensEarned = 3;

      // Lấy subscription multiplier
      let multiplier = 1;
      try {
        const subscriptionInfo =
          await blockchainService.getSubscriptionInfo(address);
        multiplier = subscriptionInfo.level;
      } catch (error) {
        console.error("Error getting subscription info:", error);
        // Continue with default multiplier (1)
      }

      // Apply multiplier
      pointsEarned *= multiplier;
      tokensEarned *= multiplier;

      // Tạo check-in
      const checkIn = await CheckIn.create({
        user: address.toLowerCase(),
        date: today,
        streak,
        pointsEarned,
        tokensEarned,
        createdAt: new Date(),
      });

      // Cập nhật points và streak cho user
      await User.updateOne(
        { walletAddress: address.toLowerCase() },
        {
          $inc: { points: pointsEarned },
          $set: { checkInStreak: streak, lastCheckIn: today },
        }
      );

      // Send tokens if earned
      if (tokensEarned > 0) {
        // In a real implementation, you would award tokens on-chain
        console.log(`Awarding ${tokensEarned} tokens to ${address}`);
      }

      // Auto-complete the check-in task
      const checkInTask = await Task.findOne({
        name: "Daily Check-in",
        isActive: true,
      });

      if (checkInTask) {
        await CompletedTask.create({
          user: address.toLowerCase(),
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
          checkIn,
        },
      };
    } catch (error) {
      console.error("Error checking in:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi check-in",
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
  async getUserPoints(address) {
    try {
      // Lấy user
      const user = await User.findOne({
        walletAddress: address.toLowerCase(),
      });

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      // Tính tổng points kiếm được hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = await CompletedTask.find({
        user: address.toLowerCase(),
        completedForDate: {
          $gte: today,
        },
      });

      const checkInToday = await CheckIn.findOne({
        user: address.toLowerCase(),
        date: {
          $gte: today,
        },
      });

      const todayPoints =
        completedToday.reduce((sum, task) => sum + task.pointsEarned, 0) +
        (checkInToday ? checkInToday.pointsEarned : 0);

      return {
        success: true,
        status: 200,
        message: "Lấy thông tin points thành công",
        data: {
          points: user.points,
          todayPoints,
          checkInStreak: user.checkInStreak || 0,
          lastCheckIn: user.lastCheckIn,
        },
      };
    } catch (error) {
      console.error("Error getting user points:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy thông tin points",
        error: error.message,
      };
    }
  }

  /**
   * Claim tokens
   * @param {String} walletAddress - Địa chỉ ví
   * @returns {Object} Kết quả claim
   */
  async claimTokens(walletAddress) {
    try {
      // Lấy thông tin rewards của user
      const userRewards = await UserRewards.findOne({
        user: walletAddress.toLowerCase(),
      });

      if (!userRewards || userRewards.pendingTokens <= 0) {
        return {
          success: false,
          status: 400,
          message: "Không có token nào để claim",
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

      // Mint token on-chain
      const tokenAmount = userRewards.pendingTokens;
      const privateKey = process.env.PRIVATE_KEY; // Chỉ dùng cho server

      const result = await blockchainService.mintReward(
        privateKey,
        walletAddress,
        tokenAmount.toString()
      );

      // Cập nhật database
      userRewards.pendingTokens = 0;
      userRewards.claimedTokens += tokenAmount;
      userRewards.lastClaimTime = new Date();
      userRewards.claimHistory.push({
        amount: tokenAmount,
        timestamp: new Date(),
        transactionHash: result.transactionHash,
      });

      await userRewards.save();

      return {
        success: true,
        status: 200,
        message: "Claim token thành công",
        data: {
          amount: tokenAmount,
          transactionHash: result.transactionHash,
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
}

module.exports = new TaskService();
