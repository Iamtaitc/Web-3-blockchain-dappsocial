const { RewardPoints, User, Task, CompletedTask } = require("../../src/models/index");
const { getSubscriptionInfo } = require("../../src/services/blockchain.services");
const RewardPointsService = require("../../src/services/reward-points.service");

// Mock các modules
jest.mock("../../src/models/index", () => ({
  RewardPoints: {
    findOne: jest.fn(),
    create: jest.fn(),
    startSession: jest.fn().mockImplementation(() => ({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    })),
    findOneAndUpdate: jest.fn()
  },
  User: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  },
  Task: {
    findOne: jest.fn(),
    findById: jest.fn()
  },
  CompletedTask: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn()
  }
}));

jest.mock("../../src/services/blockchain.services", () => ({
  getSubscriptionInfo: jest.fn()
}));

describe("RewardPointsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe("_validateWalletAddress", () => {
    test("should validate a correct Ethereum address", () => {
      // Act & Assert
      expect(() => 
        RewardPointsService._validateWalletAddress("0x1234567890abcdef1234567890abcdef12345678")
      ).not.toThrow();
    });
    
    test("should throw error for invalid Ethereum address", () => {
      // Act & Assert
      expect(() => 
        RewardPointsService._validateWalletAddress("0x12345")
      ).toThrow("Địa chỉ ví không đúng định dạng Ethereum");
      
      expect(() => 
        RewardPointsService._validateWalletAddress(null)
      ).toThrow("Địa chỉ ví không hợp lệ");
    });
  });
  
  describe("checkIn", () => {
    test("should handle first-time check-in", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Mock RewardPoints.findOne to return null (no previous check-ins)
      RewardPoints.findOne.mockResolvedValue(null);
      
      // Mock _getMultiplier to return 1 (default multiplier)
      getSubscriptionInfo.mockResolvedValue({ level: 1 });
      
      // Mock new RewardPoints creation
      const mockSaveMethod = jest.fn();
      RewardPoints.mockImplementation(function(data) {
        this.user = data.user;
        this.totalPoints = data.totalPoints;
        this.pendingTokens = data.pendingTokens;
        this.claimedTokens = data.claimedTokens;
        this.checkIn = data.checkIn;
        this.save = mockSaveMethod;
        return this;
      });
      
      // Mock Task.findOne to return a task
      const mockTask = {
        _id: "task1",
        name: "Daily Check-in",
        isActive: true,
        rewardPoints: 5,
        rewardTokens: 1
      };
      Task.findOne.mockResolvedValue(mockTask);
      
      // Act
      const result = await RewardPointsService.checkIn(address);
      
      // Assert
      expect(RewardPoints.findOne).toHaveBeenCalledWith({ user: address.toLowerCase() });
      expect(mockSaveMethod).toHaveBeenCalled();
      expect(User.updateOne).toHaveBeenCalledWith(
        { walletAddress: address.toLowerCase() },
        {
          $inc: { points: 5 },
          $set: { checkInStreak: 1, lastCheckIn: expect.any(Date) }
        }
      );
      expect(CompletedTask.create).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        message: "Check-in thành công",
        data: {
          streak: 1,
          pointsEarned: 5,
          tokensEarned: 0,
          checkInInfo: expect.objectContaining({
            currentStreak: 1,
            lastCheckIn: expect.any(Date),
            history: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(Date),
                streak: 1,
                pointsEarned: 5,
                tokensEarned: 0
              })
            ])
          })
        }
      });
    });

    test("should handle repeated check-in on same day", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Mock user already checked in today
      RewardPoints.findOne.mockResolvedValue({
        checkIn: {
          history: [
            { date: today }
          ]
        }
      });
      
      // Act
      const result = await RewardPointsService.checkIn(address);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Bạn đã check-in hôm nay rồi"
      });
    });

    test("should calculate streak correctly for consecutive days", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Mock existing reward points with streak
      const mockSaveMethod = jest.fn();
      RewardPoints.findOne.mockResolvedValue({
        user: address.toLowerCase(),
        totalPoints: 10,
        pendingTokens: 0,
        checkIn: {
          currentStreak: 2,
          lastCheckIn: yesterday,
          history: [
            { 
              date: yesterday,
              streak: 2,
              pointsEarned: 5,
              tokensEarned: 0
            }
          ]
        },
        save: mockSaveMethod
      });
      
      // Mock multiplier from subscription
      getSubscriptionInfo.mockResolvedValue({ level: 2 });
      
      // Act
      const result = await RewardPointsService.checkIn(address);
      
      // Assert
      expect(mockSaveMethod).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.streak).toBe(3); // Streak increased by 1
      expect(result.data.pointsEarned).toBe(10); // Base points (5) * multiplier (2)
    });
  });
  
  describe("getUserPoints", () => {
    test("should return user points information", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      // Mock User.findOne
      User.findOne.mockResolvedValue({
        walletAddress: address.toLowerCase(),
        points: 50
      });
      
      // Mock CompletedTask.find
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      CompletedTask.find.mockResolvedValue([
        { pointsEarned: 5 },
        { pointsEarned: 10 }
      ]);
      
      // Mock RewardPoints.findOne
      RewardPoints.findOne.mockResolvedValue({
        user: address.toLowerCase(),
        totalPoints: 100,
        pendingTokens: 5,
        claimedTokens: 2,
        checkIn: {
          currentStreak: 7,
          lastCheckIn: today,
          history: [
            {
              date: today,
              pointsEarned: 10
            }
          ]
        }
      });
      
      // Act
      const result = await RewardPointsService.getUserPoints(address);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: address.toLowerCase() });
      expect(CompletedTask.find).toHaveBeenCalled();
      expect(RewardPoints.findOne).toHaveBeenCalledWith({ user: address.toLowerCase() });
      
      expect(result).toEqual({
        success: true,
        message: "Lấy thông tin points thành công",
        data: {
          points: 50,
          todayPoints: 25, // 5 + 10 + 10 (from tasks and check-in)
          checkInStreak: 7,
          lastCheckIn: today,
          pendingTokens: 5,
          claimedTokens: 2,
          totalPoints: 100
        }
      });
    });
    
    test("should handle non-existent user", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      User.findOne.mockResolvedValue(null);
      
      // Act
      const result = await RewardPointsService.getUserPoints(address);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Không tìm thấy người dùng"
      });
    });
  });
  
  describe("claimTokens", () => {
    test("should claim tokens successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      // Mock rewards data
      const mockSaveMethod = jest.fn();
      RewardPoints.findOne.mockResolvedValue({
        user: address.toLowerCase(),
        pendingTokens: 10,
        claimHistory: [],
        lastClaimTime: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
        save: mockSaveMethod
      });
      
      // Mock subscription info
      getSubscriptionInfo.mockResolvedValue({
        isActive: true,
        level: 2 // Plus level
      });
      
      // Set environment
      process.env.PRIVATE_KEY = "mockPrivateKey";
      
      // Act
      const result = await RewardPointsService.claimTokens(address);
      
      // Assert
      expect(RewardPoints.findOne).toHaveBeenCalledWith({ user: address.toLowerCase() });
      expect(getSubscriptionInfo).toHaveBeenCalledWith(address.toLowerCase());
      expect(mockSaveMethod).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        message: "Claim token thành công",
        data: {
          amount: 16, // 8 base * 2 multiplier
          totalPending: expect.any(Number),
          subscriptionLevel: 2
        }
      });
    });
    
    test("should prevent claiming before cooldown period", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      // Only claimed 3 hours ago (less than 8 hour cooldown)
      const lastClaimTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
      
      RewardPoints.findOne.mockResolvedValue({
        user: address.toLowerCase(),
        pendingTokens: 10,
        lastClaimTime
      });
      
      // Act
      const result = await RewardPointsService.claimTokens(address);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe("Bạn chỉ có thể claim 8h một lần");
      expect(result.error.nextClaimTime).toBeDefined();
    });
  });
  
  describe("completeTask", () => {
    test("should complete task successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const taskId = "task123";
      
      // Mock task
      Task.findById.mockImplementation(() => ({
        session: jest.fn().mockReturnValue({
          _id: taskId,
          name: "Test Task",
          rewardPoints: 10,
          rewardTokens: 2
        })
      }));
      
      // Mock completed task check
      CompletedTask.findOne.mockImplementation(() => ({
        session: jest.fn().mockReturnValue(null)
      }));
      
      // Mock subscription multiplier
      getSubscriptionInfo.mockResolvedValue({ level: 2 });
      
      // Mock RewardPoints update
      RewardPoints.findOneAndUpdate.mockImplementation(() => ({
        session: jest.fn().mockResolvedValue({
          _id: "rewards1",
          user: address.toLowerCase()
        })
      }));
      
      // Mock User update
      User.findOneAndUpdate.mockImplementation(() => ({
        session: jest.fn().mockResolvedValue({
          _id: "user1",
          walletAddress: address.toLowerCase()
        })
      }));
      
      // Mock CompletedTask create
      CompletedTask.create.mockResolvedValue([
        {
          _id: "completedTask1",
          user: address.toLowerCase(),
          taskId
        }
      ]);
      
      // Act
      const result = await RewardPointsService.completeTask(address, taskId);
      
      // Assert
      expect(Task.findById).toHaveBeenCalledWith(taskId, expect.anything());
      expect(CompletedTask.findOne).toHaveBeenCalled();
      expect(RewardPoints.findOneAndUpdate).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalled();
      expect(CompletedTask.create).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        message: "Hoàn thành nhiệm vụ thành công",
        data: {
          pointsEarned: 20, // 10 * 2 multiplier
          tokensEarned: 4,  // 2 * 2 multiplier
          taskName: "Test Task"
        }
      });
    });
    
    test("should prevent completing the same task twice in a day", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const taskId = "task123";
      
      // Mock task
      Task.findById.mockImplementation(() => ({
        session: jest.fn().mockReturnValue({
          _id: taskId,
          name: "Test Task"
        })
      }));
      
      // Mock completed task already exists
      CompletedTask.findOne.mockImplementation(() => ({
        session: jest.fn().mockReturnValue({
          _id: "completedTask1",
          user: address.toLowerCase(),
          taskId
        })
      }));
      
      // Act
      const result = await RewardPointsService.completeTask(address, taskId);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Nhiệm vụ này đã được hoàn thành hôm nay"
      });
    });
  });
});