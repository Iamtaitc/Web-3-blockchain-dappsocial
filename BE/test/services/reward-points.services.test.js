const RewardPointsService = require("../../src/services/reward/index");
const {
  RewardPoints,
  User,
  Task,
  CompletedTask,
} = require("../../src/models/index");
const {
  getSubscriptionInfo,
} = require("../../src/services/blockchain.services");

jest.mock("../../src/models/index");
jest.mock("../../src/services/blockchain.services");

describe("RewardPointsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserPoints", () => {
    it("should return user points and rewards successfully", async () => {
      const address = "0x1";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mockUser = { walletAddress: "0x1", points: 100 };
      const mockCompletedTasks = [{ pointsEarned: 10 }, { pointsEarned: 20 }];
      const mockUserRewards = {
        user: "0x1",
        totalPoints: 50,
        pendingTokens: 5,
        claimedTokens: 10,
        lastClaimTime: new Date(today.getTime() - 9 * 60 * 60 * 1000), // 9 hours ago
        checkIn: {
          currentStreak: 3,
          lastCheckIn: today,
          history: [{ date: today, pointsEarned: 5 }],
        },
      };
      User.findOne.mockResolvedValue(mockUser);
      CompletedTask.find.mockResolvedValue(mockCompletedTasks);
      RewardPoints.findOne.mockResolvedValue(mockUserRewards);

      const result = await RewardPointsService.getUserPoints(address);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        points: 100,
        todayPoints: 35, // 10 + 20 + 5
        checkInStreak: 3,
        pendingTokens: 5,
        claimedTokens: 10,
        totalPoints: 50,
        canClaimNow: true, // Last claim was 9 hours ago
      });
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: "0x1" });
      expect(CompletedTask.find).toHaveBeenCalledWith({
        user: "0x1",
        completedForDate: { $gte: expect.any(Date) },
      });
    });

    it("should return error for invalid wallet address", async () => {
      const result = await RewardPointsService.getUserPoints("invalid");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lỗi khi lấy thông tin points");
      expect(result.error).toMatch(/Địa chỉ ví không đúng định dạng Ethereum/);
    });

    it("should return error if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await RewardPointsService.getUserPoints("0x1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Không tìm thấy người dùng");
    });

    it("should handle no rewards record", async () => {
      User.findOne.mockResolvedValue({ walletAddress: "0x1", points: 0 });
      CompletedTask.find.mockResolvedValue([]);
      RewardPoints.findOne.mockResolvedValue(null);

      const result = await RewardPointsService.getUserPoints("0x1");

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        points: 0,
        todayPoints: 0,
        checkInStreak: 0,
        pendingTokens: 0,
        claimedTokens: 0,
        totalPoints: 0,
      });
    });
  });

  describe("getUserRewards", () => {
    it("should return user rewards successfully", async () => {
      const mockUserRewards = {
        user: "0x1",
        totalPoints: 50,
        pendingTokens: 5,
        claimedTokens: 10,
        checkIn: { currentStreak: 3, history: [] },
        toObject: jest.fn().mockReturnValue({
          user: "0x1",
          totalPoints: 50,
          pendingTokens: 5,
          claimedTokens: 10,
          checkIn: { currentStreak: 3, history: [] },
        }),
      };
      RewardPoints.findOne.mockResolvedValue(mockUserRewards);

      const result = await RewardPointsService.getUserRewards("0x1");

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        totalPoints: 50,
        pendingTokens: 5,
        claimedTokens: 10,
      });
      expect(RewardPoints.findOne).toHaveBeenCalledWith({ user: "0x1" });
    });

    it("should return default rewards if no record exists", async () => {
      RewardPoints.findOne.mockResolvedValue(null);

      const result = await RewardPointsService.getUserRewards("0x1");

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        pendingTokens: 0,
        claimedTokens: 0,
        totalPoints: 0,
        checkIn: { currentStreak: 0, lastCheckIn: null, history: [] },
      });
    });

    it("should return error for invalid wallet address", async () => {
      const result = await RewardPointsService.getUserRewards("invalid");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lỗi khi lấy thông tin rewards");
    });
  });

  describe("checkIn", () => {
    it("should check in successfully and update streak", async () => {
      const address = "0x1";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mockUserRewards = {
        user: "0x1",
        checkIn: {
          currentStreak: 1,
          lastCheckIn: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          history: [],
        },
        totalPoints: 0,
        pendingTokens: 0,
        save: jest.fn().mockResolvedValue({}),
      };
      const mockUser = { walletAddress: "0x1" };
      const mockTask = {
        _id: "task1",
        name: "Daily Check-in",
        isActive: true,
        rewardPoints: 5,
        rewardTokens: 1,
      };
      User.findOne.mockResolvedValue(mockUser);
      RewardPoints.findOne.mockResolvedValue(mockUserRewards);
      Task.findOne.mockResolvedValue(mockTask);
      User.updateOne.mockResolvedValue({});
      CompletedTask.create.mockResolvedValue({});
      getSubscriptionInfo.mockResolvedValue({ level: 2, isActive: true });

      const result = await RewardPointsService.checkIn(address);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        streak: 2,
        pointsEarned: 10, // 5 * 2 (multiplier)
        tokensEarned: 2, // 1 * 2
      });
      expect(mockUserRewards.save).toHaveBeenCalled();
      expect(User.updateOne).toHaveBeenCalledWith(
        { walletAddress: "0x1" },
        {
          $inc: { points: 10 },
          $set: { checkInStreak: 2, lastCheckIn: expect.any(Date) },
        }
      );
      expect(CompletedTask.create).toHaveBeenCalled();
    });

    it("should return error for duplicate check-in", async () => {
      const address = "0x1";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mockUserRewards = {
        checkIn: {
          history: [
            { date: today, streak: 1, pointsEarned: 5, tokensEarned: 0 },
          ],
        },
      };
      RewardPoints.findOne.mockResolvedValue(mockUserRewards);

      const result = await RewardPointsService.checkIn(address);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Bạn đã check-in hôm nay rồi");
    });

    it("should create new rewards record for first check-in", async () => {
      const address = "0x1";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      User.findOne.mockResolvedValue({ walletAddress: "0x1" });
      RewardPoints.findOne.mockResolvedValue(null);
      RewardPoints.prototype.save = jest.fn().mockResolvedValue({});
      User.updateOne.mockResolvedValue({});
      getSubscriptionInfo.mockResolvedValue({ level: 1, isActive: true });

      const result = await RewardPointsService.checkIn(address);

      expect(result.success).toBe(true);
      expect(result.data.streak).toBe(1);
      expect(result.data.pointsEarned).toBe(7.5); // 5 * 1.5 (multiplier)
    });

    it("should return error for invalid wallet address", async () => {
      const result = await RewardPointsService.checkIn("invalid");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lỗi khi check-in");
    });
  });

  describe("claimTokens", () => {
    it("should claim tokens successfully", async () => {
      const address = "0x1";
      const mockUserRewards = {
        user: "0x1",
        pendingTokens: 0,
        claimedTokens: 0,
        lastClaimTime: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
        claimHistory: [],
        save: jest.fn().mockResolvedValue({}),
      };
      RewardPoints.findOne.mockResolvedValue(mockUserRewards);
      getSubscriptionInfo.mockResolvedValue({ level: 2, isActive: true });
      process.env.PRIVATE_KEY = "mockKey";

      const result = await RewardPointsService.claimTokens(address);

      expect(result.success).toBe(true);
      expect(result.data.amount).toBe(16); // 8 * 2 (multiplier)
      expect(mockUserRewards.save).toHaveBeenCalled();
      expect(mockUserRewards.claimHistory).toContainEqual({
        amount: 16,
        timestamp: expect.any(Date),
      });
    });

    it("should return error if claim too soon", async () => {
      const mockUserRewards = {
        lastClaimTime: new Date(),
      };
      RewardPoints.findOne.mockResolvedValue(mockUserRewards);

      const result = await RewardPointsService.claimTokens("0x1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Bạn chỉ có thể claim 8h một lần");
    });

    it("should return error if no rewards record", async () => {
      RewardPoints.findOne.mockResolvedValue(null);

      const result = await RewardPointsService.claimTokens("0x1");

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Không tìm thấy thông tin rewards của người dùng"
      );
    });

    it("should return error for invalid wallet address", async () => {
      const result = await RewardPointsService.claimTokens("invalid");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lỗi khi claim token");
    });
  });

  describe("handleFirstLogin", () => {
    it("should handle first login with welcome bonus", async () => {
      RewardPoints.findOne.mockResolvedValue(null);
      RewardPoints.create.mockResolvedValue({
        user: "0x1",
        pendingTokens: 10,
        totalPoints: 10,
      });

      const result = await RewardPointsService.handleFirstLogin("0x1");

      expect(result.success).toBe(true);
      expect(result.isFirstLogin).toBe(true);
      expect(result.data.pendingTokens).toBe(10);
      expect(RewardPoints.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "0x1",
          pendingTokens: 10,
          totalPoints: 10,
        })
      );
    });

    it("should handle subsequent login", async () => {
      RewardPoints.findOne.mockResolvedValue({
        user: "0x1",
        pendingTokens: 5,
      });

      const result = await RewardPointsService.handleFirstLogin("0x1");

      expect(result.success).toBe(true);
      expect(result.isFirstLogin).toBe(false);
      expect(result.data.pendingTokens).toBe(5);
    });

    it("should return error for invalid wallet address", async () => {
      const result = await RewardPointsService.handleFirstLogin("invalid");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lỗi khi xử lý đăng nhập");
    });
  });

  describe("completeTask", () => {
    it("should complete task successfully", async () => {
      const address = "0x1";
      const taskId = "task1";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mockTask = {
        _id: taskId,
        name: "Task 1",
        rewardPoints: 10,
        rewardTokens: 2,
      };
      Task.findById.mockResolvedValue(mockTask);
      CompletedTask.findOne.mockResolvedValue(null);
      RewardPoints.findOneAndUpdate.mockResolvedValue({});
      User.findOneAndUpdate.mockResolvedValue({});
      CompletedTask.create.mockResolvedValue({});
      getSubscriptionInfo.mockResolvedValue({ level: 2, isActive: true });

      const result = await RewardPointsService.completeTask(address, taskId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        pointsEarned: 20, // 10 * 2
        tokensEarned: 4, // 2 * 2
        taskName: "Task 1",
      });
      expect(RewardPoints.findOneAndUpdate).toHaveBeenCalledWith(
        { user: "0x1" },
        { $inc: { totalPoints: 20, pendingTokens: 4 } },
        { upsert: true, new: true }
      );
    });

    it("should return error if task not found", async () => {
      Task.findById.mockResolvedValue(null);

      const result = await RewardPointsService.completeTask("0x1", "task1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Không tìm thấy nhiệm vụ");
    });

    it("should return error if task already completed today", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      Task.findById.mockResolvedValue({ _id: "task1" });
      CompletedTask.findOne.mockResolvedValue({});

      const result = await RewardPointsService.completeTask("0x1", "task1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Nhiệm vụ này đã được hoàn thành hôm nay");
    });

    it("should return error for invalid wallet address", async () => {
      const result = await RewardPointsService.completeTask("invalid", "task1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lỗi khi hoàn thành nhiệm vụ");
    });
  });
});
