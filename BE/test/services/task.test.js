const {
    Task,
    CompletedTask,
    CheckIn,
    User,
    UserRewards,
  } = require("../models/index");
  const blockchainService = require("../services/blockchain.services");
  const taskService = require("../services/task.services");
  
  // Mock the dependencies
  jest.mock("../models/index", () => ({
    Task: {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    },
    CompletedTask: {
      find: jest.fn(),
      create: jest.fn(),
    },
    CheckIn: {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    User: {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    },
    UserRewards: {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    },
  }));
  
  jest.mock("../services/blockchain.services", () => ({
    getSubscriptionInfo: jest.fn(),
    mintReward: jest.fn(),
  }));
  
  describe("TaskService Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getAllTasks method", () => {
      it("should return all active tasks", async () => {
        // Mock data
        const mockTasks = [
          {
            _id: "task1",
            name: "Task 1",
            type: "daily",
            rewardPoints: 10,
            isActive: true,
          },
          {
            _id: "task2",
            name: "Task 2",
            type: "weekly",
            rewardPoints: 20,
            isActive: true,
          },
        ];
  
        // Setup mock
        Task.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockTasks),
        });
  
        // Call the method
        const result = await taskService.getAllTasks();
  
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual(mockTasks);
        expect(Task.find).toHaveBeenCalledWith({ isActive: true });
      });
  
      it("should handle errors when getting tasks", async () => {
        // Setup mock to throw an error
        Task.find.mockImplementation(() => {
          throw new Error("Database error");
        });
  
        // Call the method
        const result = await taskService.getAllTasks();
  
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi lấy danh sách nhiệm vụ");
        expect(result.error).toBe("Database error");
      });
    });
  
    describe("getUserTasks method", () => {
      it("should return user tasks with completion status", async () => {
        const mockAddress = "0x1234567890abcdef";
        const mockToday = new Date();
        mockToday.setHours(0, 0, 0, 0);
  
        // Mock data
        const mockCompletedTasks = [
          {
            _id: "completed1",
            taskId: "task1",
            user: mockAddress.toLowerCase(),
            createdAt: new Date(),
          },
        ];
  
        const mockAllTasks = [
          {
            _id: "task1",
            name: "Task 1",
            description: "Description 1",
            type: "daily",
            rewardPoints: 10,
            rewardTokens: 1,
            requirements: {},
          },
          {
            _id: "task2",
            name: "Task 2",
            description: "Description 2",
            type: "daily",
            rewardPoints: 20,
            rewardTokens: 2,
            requirements: {},
          },
          {
            _id: "task3",
            name: "Task 3",
            description: "Description 3",
            type: "weekly",
            rewardPoints: 30,
            rewardTokens: 3,
            requirements: {},
          },
        ];
  
        // Setup mocks
        CompletedTask.find.mockResolvedValue(mockCompletedTasks);
        Task.find.mockResolvedValue(mockAllTasks);
  
        // Call the method
        const result = await taskService.getUserTasks(mockAddress);
  
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.tasks.daily).toHaveLength(2);
        expect(result.data.tasks.weekly).toHaveLength(1);
        expect(result.data.tasks.daily[0].isCompleted).toBe(true); // task1 is completed
        expect(result.data.tasks.daily[1].isCompleted).toBe(false); // task2 is not completed
        expect(result.data.completedCount).toBe(1);
        expect(result.data.totalTasks).toBe(3);
        
        // Verify method calls
        expect(CompletedTask.find).toHaveBeenCalledWith({
          user: mockAddress.toLowerCase(),
          completedForDate: { $gte: expect.any(Date) },
        });
        expect(Task.find).toHaveBeenCalledWith({ isActive: true });
      });
  
      it("should handle errors when getting user tasks", async () => {
        const mockAddress = "0x1234567890abcdef";
  
        // Setup mock to throw an error
        CompletedTask.find.mockImplementation(() => {
          throw new Error("Database error");
        });
  
        // Call the method
        const result = await taskService.getUserTasks(mockAddress);
  
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi lấy danh sách nhiệm vụ của người dùng");
        expect(result.error).toBe("Database error");
      });
    });
  
    describe("completeTask method", () => {
      it("should complete a task and award points and tokens", async () => {
        const mockUser = "0x1234567890abcdef";
        const mockTaskId = "task1";
  
        // Mock data
        const mockTask = {
          _id: mockTaskId,
          name: "Task 1",
          rewardPoints: 10,
          rewardTokens: 2,
        };
  
        const mockSubscription = {
          level: 2, // Multiplier
          isActive: true,
          expiration: new Date(),
        };
  
        // Setup mocks
        Task.findById.mockResolvedValue(mockTask);
        blockchainService.getSubscriptionInfo.mockResolvedValue(mockSubscription);
        UserRewards.findOneAndUpdate.mockResolvedValue({});
        CompletedTask.create.mockResolvedValue({
          user: mockUser.toLowerCase(),
          taskId: mockTaskId,
          pointsEarned: 10,
          tokensEarned: 4, // 2 tokens * level 2 multiplier
        });
  
        // Call the method
        const result = await taskService.completeTask(mockUser, mockTaskId);
  
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.pointsEarned).toBe(10);
        expect(result.data.tokensEarned).toBe(4); // 2 * 2
        
        // Verify method calls
        expect(Task.findById).toHaveBeenCalledWith(mockTaskId);
        expect(blockchainService.getSubscriptionInfo).toHaveBeenCalledWith(mockUser);
        expect(UserRewards.findOneAndUpdate).toHaveBeenCalledWith(
          { user: mockUser.toLowerCase() },
          { $inc: { totalPoints: 10, pendingTokens: 4 } },
          { upsert: true }
        );
        expect(CompletedTask.create).toHaveBeenCalledWith(expect.objectContaining({
          user: mockUser.toLowerCase(),
          taskId: mockTaskId,
          pointsEarned: 10,
          tokensEarned: 4,
        }));
      });
  
      it("should return error if task not found", async () => {
        const mockUser = "0x1234567890abcdef";
        const mockTaskId = "nonexistent";
  
        // Setup mock
        Task.findById.mockResolvedValue(null);
  
        // Call the method
        const result = await taskService.completeTask(mockUser, mockTaskId);
  
        // Verify results
        expect(result.success).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toBe("Không tìm thấy nhiệm vụ");
      });
  
      it("should handle errors when completing a task", async () => {
        const mockUser = "0x1234567890abcdef";
        const mockTaskId = "task1";
  
        // Setup mock to throw an error
        Task.findById.mockImplementation(() => {
          throw new Error("Database error");
        });
  
        // Call the method
        const result = await taskService.completeTask(mockUser, mockTaskId);
  
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi hoàn thành nhiệm vụ");
        expect(result.error).toBe("Database error");
      });
    });
  
    describe("checkIn method", () => {
      it("should successfully create a new check-in with streak 1 for first-time user", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mocks
        CheckIn.findOne.mockResolvedValueOnce(null); // No check-in today
        CheckIn.findOne.mockResolvedValueOnce(null); // No previous check-ins
        blockchainService.getSubscriptionInfo.mockResolvedValue({ level: 1 });
        CheckIn.create.mockResolvedValue({
          user: mockAddress.toLowerCase(),
          date: expect.any(Date),
          streak: 1,
          pointsEarned: 5,
          tokensEarned: 0,
        });
        Task.findOne.mockResolvedValue({
          _id: "checkinTask",
          name: "Daily Check-in",
          rewardPoints: 5,
          rewardTokens: 0,
        });
        CompletedTask.create.mockResolvedValue({});
  
        // Call the method
        const result = await taskService.checkIn(mockAddress);
  
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.streak).toBe(1);
        expect(result.data.pointsEarned).toBe(5);
        expect(result.data.tokensEarned).toBe(0);
        
        // Verify method calls
        expect(User.updateOne).toHaveBeenCalledWith(
          { walletAddress: mockAddress.toLowerCase() },
          expect.objectContaining({
            $inc: { points: 5 },
            $set: { checkInStreak: 1 }
          })
        );
      });
  
      it("should continue streak and apply bonuses for consecutive check-ins", async () => {
        const mockAddress = "0x1234567890abcdef";
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Setup mocks
        CheckIn.findOne.mockResolvedValueOnce(null); // No check-in today
        CheckIn.findOne.mockResolvedValueOnce({
          user: mockAddress.toLowerCase(),
          date: yesterday,
          streak: 6, // Will become 7 today
        });
        blockchainService.getSubscriptionInfo.mockResolvedValue({ level: 2 });
        CheckIn.create.mockResolvedValue({
          user: mockAddress.toLowerCase(),
          date: expect.any(Date),
          streak: 7,
          pointsEarned: 14, // (5+2) * 2 multiplier
          tokensEarned: 2,  // 1 * 2 multiplier
        });
        Task.findOne.mockResolvedValue({
          _id: "checkinTask",
          name: "Daily Check-in",
          rewardPoints: 5,
          rewardTokens: 1,
        });
        CompletedTask.create.mockResolvedValue({});
  
        // Call the method
        const result = await taskService.checkIn(mockAddress);
  
        // Verify results
        expect(result.success).toBe(true);
        expect(result.data.streak).toBe(7);
        expect(result.data.pointsEarned).toBe(14); // (5+2) * 2 multiplier
        expect(result.data.tokensEarned).toBe(2);  // 1 * 2 multiplier
      });
  
      it("should prevent multiple check-ins on the same day", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mocks - user already checked in today
        CheckIn.findOne.mockResolvedValueOnce({
          user: mockAddress.toLowerCase(),
          date: new Date(),
        });
  
        // Call the method
        const result = await taskService.checkIn(mockAddress);
  
        // Verify results
        expect(result.success).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe("Bạn đã check-in hôm nay rồi");
      });
  
      it("should handle errors during check-in", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mock to throw an error
        CheckIn.findOne.mockImplementation(() => {
          throw new Error("Database error");
        });
  
        // Call the method
        const result = await taskService.checkIn(mockAddress);
  
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi check-in");
        expect(result.error).toBe("Database error");
      });
    });
  
    describe("getUserSubscription method", () => {
      it("should return user subscription info", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Mock data
        const mockSubscription = {
          level: 3,
          isActive: true,
          expiration: new Date(),
        };
        
        // Setup mocks
        blockchainService.getSubscriptionInfo.mockResolvedValue(mockSubscription);
        
        // Call the method
        const result = await taskService.getUserSubscription(mockAddress);
        
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.level).toBe(3);
        expect(result.data.multiplier).toBe(3);
        expect(result.data.isActive).toBe(true);
        
        // Verify method calls
        expect(blockchainService.getSubscriptionInfo).toHaveBeenCalledWith(mockAddress);
        expect(User.updateOne).toHaveBeenCalledWith(
          { walletAddress: mockAddress.toLowerCase() },
          {
            "subscription.level": 3,
            "subscription.expiration": mockSubscription.expiration,
          }
        );
      });
      
      it("should handle errors when getting subscription info", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mock to throw an error
        blockchainService.getSubscriptionInfo.mockImplementation(() => {
          throw new Error("Blockchain error");
        });
        
        // Call the method
        const result = await taskService.getUserSubscription(mockAddress);
        
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi lấy thông tin subscription");
        expect(result.error).toBe("Blockchain error");
      });
    });
  
    describe("getUserPoints method", () => {
      it("should return user points info with today's points", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Mock data
        const mockUser = {
          walletAddress: mockAddress.toLowerCase(),
          points: 100,
          checkInStreak: 5,
          lastCheckIn: new Date(),
        };
        
        const mockCompletedTasks = [
          { pointsEarned: 10 },
          { pointsEarned: 20 },
        ];
        
        const mockCheckIn = {
          pointsEarned: 5,
        };
        
        // Setup mocks
        User.findOne.mockResolvedValue(mockUser);
        CompletedTask.find.mockResolvedValue(mockCompletedTasks);
        CheckIn.findOne.mockResolvedValue(mockCheckIn);
        
        // Call the method
        const result = await taskService.getUserPoints(mockAddress);
        
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.points).toBe(100);
        expect(result.data.todayPoints).toBe(35); // 10 + 20 + 5
        expect(result.data.checkInStreak).toBe(5);
        
        // Verify method calls
        expect(User.findOne).toHaveBeenCalledWith({
          walletAddress: mockAddress.toLowerCase(),
        });
      });
      
      it("should return error if user not found", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mock
        User.findOne.mockResolvedValue(null);
        
        // Call the method
        const result = await taskService.getUserPoints(mockAddress);
        
        // Verify results
        expect(result.success).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toBe("Không tìm thấy người dùng");
      });
      
      it("should handle errors when getting user points", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mock to throw an error
        User.findOne.mockImplementation(() => {
          throw new Error("Database error");
        });
        
        // Call the method
        const result = await taskService.getUserPoints(mockAddress);
        
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi lấy thông tin points");
        expect(result.error).toBe("Database error");
      });
    });
  
    describe("claimTokens method", () => {
      it("should successfully claim tokens", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Mock data
        const oldDate = new Date();
        oldDate.setHours(oldDate.getHours() - 10); // More than 8 hours ago
        
        const mockUserRewards = {
          user: mockAddress.toLowerCase(),
          pendingTokens: 50,
          claimedTokens: 100,
          lastClaimTime: oldDate,
          claimHistory: [],
          save: jest.fn().mockResolvedValue(true),
        };
        
        const mockMintResult = {
          transactionHash: "0xabcdef1234567890",
        };
        
        // Setup mocks
        UserRewards.findOne.mockResolvedValue(mockUserRewards);
        blockchainService.mintReward.mockResolvedValue(mockMintResult);
        
        // Call the method
        const result = await taskService.claimTokens(mockAddress);
        
        // Verify results
        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.amount).toBe(50);
        expect(result.data.transactionHash).toBe("0xabcdef1234567890");
        
        // Verify user rewards updates
        expect(mockUserRewards.pendingTokens).toBe(0);
        expect(mockUserRewards.claimedTokens).toBe(150); // 100 + 50
        expect(mockUserRewards.save).toHaveBeenCalled();
        expect(mockUserRewards.claimHistory).toHaveLength(1);
        expect(mockUserRewards.claimHistory[0].amount).toBe(50);
        expect(mockUserRewards.claimHistory[0].transactionHash).toBe("0xabcdef1234567890");
        
        // Verify blockchain service call
        expect(blockchainService.mintReward).toHaveBeenCalledWith(
          expect.any(String), // PRIVATE_KEY
          mockAddress,
          "50"
        );
      });
      
      it("should return error if no tokens to claim", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mock
        UserRewards.findOne.mockResolvedValue({
          user: mockAddress.toLowerCase(),
          pendingTokens: 0,
        });
        
        // Call the method
        const result = await taskService.claimTokens(mockAddress);
        
        // Verify results
        expect(result.success).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe("Không có token nào để claim");
      });
      
      it("should prevent claiming tokens before 8 hours have passed", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Mock data - last claim was less than 8 hours ago
        const recentDate = new Date();
        recentDate.setHours(recentDate.getHours() - 4); 
        
        const mockUserRewards = {
          user: mockAddress.toLowerCase(),
          pendingTokens: 50,
          lastClaimTime: recentDate,
        };
        
        // Setup mock
        UserRewards.findOne.mockResolvedValue(mockUserRewards);
        
        // Call the method
        const result = await taskService.claimTokens(mockAddress);
        
        // Verify results
        expect(result.success).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe("Bạn chỉ có thể claim 8h một lần");
        expect(result.error.nextClaimTime).toBeDefined();
      });
      
      it("should handle errors when claiming tokens", async () => {
        const mockAddress = "0x1234567890abcdef";
        
        // Setup mock to throw an error
        UserRewards.findOne.mockImplementation(() => {
          throw new Error("Database error");
        });
        
        // Call the method
        const result = await taskService.claimTokens(mockAddress);
        
        // Verify error handling
        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe("Lỗi khi claim token");
        expect(result.error).toBe("Database error");
      });
    });
  });