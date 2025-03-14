const Task = require("../models/Task.mongoose");
const CompletedTask = require("../models/CompletedTask.mongoose");
const CheckIn = require("../models/CheckIn.mongoose");
const User = require("../models/User.mongoose");
const blockchainService = require("../services/blockchain.services");

// Lấy tất cả nhiệm vụ
exports.getAllTasks = async (req, res) => {
  try {
    // Lấy danh sách nhiệm vụ active
    const tasks = await Task.find({ isActive: true }).sort({
      type: 1,
      rewardPoints: -1,
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy nhiệm vụ đã hoàn thành của user
exports.getUserTasks = async (req, res) => {
  try {
    const address = req.user.address;

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

    res.status(200).json({
      tasks: groupedTasks,
      completedCount: completedToday.length,
      totalTasks: allTasks.length,
    });
  } catch (error) {
    console.error("Error getting user tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Hoàn thành nhiệm vụ
exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const address = req.user.address;

    // Kiểm tra nhiệm vụ có tồn tại không
    const task = await Task.findById(taskId);

    if (!task || !task.isActive) {
      return res.status(404).json({ error: "Task not found or inactive" });
    }

    // Get current date (at start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Kiểm tra đã hoàn thành chưa
    const alreadyCompleted = await CompletedTask.findOne({
      user: address.toLowerCase(),
      taskId,
      completedForDate: {
        $gte: today,
      },
    });

    if (alreadyCompleted) {
      return res.status(400).json({ error: "Task already completed today" });
    }

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

    // Calculate rewards with multiplier
    const pointsEarned = task.rewardPoints * multiplier;
    const tokensEarned = task.rewardTokens * multiplier;

    // Tạo completed task
    await CompletedTask.create({
      user: address.toLowerCase(),
      taskId,
      completedForDate: today,
      pointsEarned,
      tokensEarned,
      createdAt: new Date(),
    });

    // Cập nhật points cho user
    await User.updateOne(
      { walletAddress: address.toLowerCase() },
      { $inc: { points: pointsEarned } }
    );

    // Send tokens if reward has tokens
    if (tokensEarned > 0) {
      // In a real implementation, you would award tokens on-chain
      console.log(`Awarding ${tokensEarned} tokens to ${address}`);
    }

    res.status(200).json({
      message: "Task completed successfully",
      pointsEarned,
      tokensEarned,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Check-in hàng ngày
exports.checkIn = async (req, res) => {
  try {
    const address = req.user.address;

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
      return res.status(400).json({ error: "Already checked in today" });
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

    res.status(200).json({
      message: "Check-in successful",
      streak,
      pointsEarned,
      tokensEarned,
      checkIn,
    });
  } catch (error) {
    console.error("Error checking in:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy thông tin subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const address = req.user.address;

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

    res.status(200).json({
      subscription: {
        level: subscriptionInfo.level,
        multiplier: subscriptionInfo.level,
        expiration: subscriptionInfo.expiration,
        isActive: subscriptionInfo.isActive,
      },
    });
  } catch (error) {
    console.error("Error getting subscription info:", error);
    res.status(500).json({ error: "Failed to get subscription information" });
  }
};

// Lấy thông tin points của user
exports.getUserPoints = async (req, res) => {
  try {
    const address = req.user.address;

    // Lấy user
    const user = await User.findOne({
      walletAddress: address.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

    res.status(200).json({
      points: user.points,
      todayPoints,
      checkInStreak: user.checkInStreak || 0,
      lastCheckIn: user.lastCheckIn,
    });
  } catch (error) {
    console.error("Error getting user points:", error);
    res.status(500).json({ error: "Server error" });
  }
};
