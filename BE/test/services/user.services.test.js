const { User, Follow } = require("../../src/models/index");
const IPFSService = require("../../src/services/ipfs.services");
const blockchainService = require("../../src/services/blockchain.services");
const notificationService = require("../../src/services/notification.services");
const UserServices = require("../../src/services/user.services");

// Mock các modules
jest.mock("../../src/models/index", () => ({
  User: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn()
  },
  Follow: {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn()
  }
}));

jest.mock("../../src/services/ipfs.services", () => ({
  formatIPFSUrl: jest.fn(uri => uri ? `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}` : null),
  uploadFile: jest.fn().mockResolvedValue("mockCID"),
  uploadJSON: jest.fn().mockResolvedValue("mockMetadataCID"),
  createProfileMetadata: jest.fn().mockReturnValue({ name: "mockName", bio: "mockBio" })
}));

jest.mock("../../src/services/blockchain.services", () => ({
  getSubscriptionInfo: jest.fn()
}));

jest.mock("../../src/services/notification.services", () => ({
  createNotification: jest.fn().mockResolvedValue({})
}));

describe("UserServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    test("should return user profile successfully", async () => {
      // Arrange
      const address = { address: "0x1234567890abcdef1234567890abcdef12345678" };
      const currentUserAddress = "0x2234567890abcdef1234567890abcdef12345678";
      
      // Mock user
      const mockUser = {
        walletAddress: address.address,
        username: "testuser",
        ensName: "testuser.eth",
        bio: "Test bio",
        avatarURI: "ipfs://avatarCID",
        coverURI: "ipfs://coverCID",
        followerCount: 10,
        followingCount: 5,
        postCount: 15,
        points: 100,
        isVerified: true,
        createdAt: new Date()
      };
      
      // Mock subscription info
      const mockSubscription = {
        level: 2,
        isActive: true,
        expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      // Mock follow relationship
      const mockFollow = {
        follower: currentUserAddress,
        following: address.address
      };
      
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      blockchainService.getSubscriptionInfo.mockResolvedValue(mockSubscription);
      Follow.findOne.mockResolvedValue(mockFollow);
      
      // Act
      const result = await UserServices.getUserProfile(address, currentUserAddress);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: address.address });
      expect(blockchainService.getSubscriptionInfo).toHaveBeenCalledWith(address.address);
      expect(Follow.findOne).toHaveBeenCalledWith({
        follower: currentUserAddress,
        following: address.address
      });
      
      expect(result).toEqual({
        success: true,
        data: {
          walletAddress: mockUser.walletAddress,
          username: mockUser.username,
          ensName: mockUser.ensName,
          bio: mockUser.bio,
          avatarURI: IPFSService.formatIPFSUrl(mockUser.avatarURI),
          coverURI: IPFSService.formatIPFSUrl(mockUser.coverURI),
          followerCount: mockUser.followerCount,
          followingCount: mockUser.followingCount,
          postCount: mockUser.postCount,
          points: mockUser.points,
          subscription: {
            level: mockSubscription.level,
            isActive: mockSubscription.isActive,
            expiration: mockSubscription.expiration
          },
          isVerified: mockUser.isVerified,
          isFollowing: true,
          createdAt: mockUser.createdAt
        }
      });
    });

    test("should return error when user not found", async () => {
      // Arrange
      const address = { address: "0x1234567890abcdef1234567890abcdef12345678" };
      
      User.findOne.mockResolvedValue(null);
      
      // Act
      const result = await UserServices.getUserProfile(address);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "User not found"
      });
    });
  });

  describe("updateProfile", () => {
    test("should update profile successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const userData = {
        username: "newusername",
        bio: "New bio"
      };
      
      const files = {
        avatar: {
          data: Buffer.from("mock avatar data"),
          name: "avatar.jpg"
        },
        cover: {
          data: Buffer.from("mock cover data"),
          name: "cover.jpg"
        }
      };
      
      // Mock current user
      const mockCurrentUser = {
        walletAddress: address,
        username: "oldusername",
        bio: "Old bio",
        avatarURI: "ipfs://oldAvatarCID",
        coverURI: "ipfs://oldCoverCID"
      };
      
      // Mock updated user
      const mockUpdatedUser = {
        walletAddress: address,
        username: userData.username,
        bio: userData.bio,
        metadataURI: `ipfs://mockMetadataCID`,
        avatarURI: `ipfs://mockCID`,
        coverURI: `ipfs://mockCID`,
        updatedAt: new Date()
      };
      
      // Setup mocks
      User.findOne.mockResolvedValue(mockCurrentUser);
      User.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);
      
      // Act
      const result = await UserServices.updateProfile(address, userData, files);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: address });
      expect(IPFSService.uploadFile).toHaveBeenCalledTimes(2);
      expect(IPFSService.createProfileMetadata).toHaveBeenCalled();
      expect(IPFSService.uploadJSON).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        data: {
          walletAddress: mockUpdatedUser.walletAddress,
          username: mockUpdatedUser.username,
          bio: mockUpdatedUser.bio,
          avatarURI: IPFSService.formatIPFSUrl(mockUpdatedUser.avatarURI),
          coverURI: IPFSService.formatIPFSUrl(mockUpdatedUser.coverURI),
          metadataURI: mockUpdatedUser.metadataURI,
          updatedAt: mockUpdatedUser.updatedAt
        }
      });
    });

    test("should prevent username duplication", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const userData = {
        username: "existingusername",
        bio: "New bio"
      };
      
      // Mock existing user with the same username
      User.findOne.mockResolvedValueOnce({
        username: userData.username,
        walletAddress: "0xdifferentaddress"
      });
      
      // Act
      const result = await UserServices.updateProfile(address, userData, {});
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Username already exists"
      });
    });
  });

  describe("followUser", () => {
    test("should follow user successfully", async () => {
      // Arrange
      const targetAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const followerAddress = "0x2234567890abcdef1234567890abcdef12345678";
      
      // Mock target user
      User.findOne.mockResolvedValue({
        walletAddress: targetAddress,
        username: "targetuser"
      });
      
      // Mock follow relationship doesn't exist
      Follow.findOne.mockResolvedValue(null);
      
      // Act
      const result = await UserServices.followUser(targetAddress, followerAddress);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: targetAddress });
      expect(Follow.findOne).toHaveBeenCalledWith({
        follower: followerAddress,
        following: targetAddress
      });
      
      expect(Follow.create).toHaveBeenCalledWith({
        follower: followerAddress,
        following: targetAddress,
        createdAt: expect.any(Date)
      });
      
      expect(User.updateOne).toHaveBeenCalledTimes(2);
      expect(notificationService.createNotification).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        data: {
          follower: followerAddress,
          following: targetAddress
        }
      });
    });

    test("should prevent following yourself", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      // Act
      const result = await UserServices.followUser(address, address);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Cannot follow yourself"
      });
    });

    test("should prevent duplicate follows", async () => {
      // Arrange
      const targetAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const followerAddress = "0x2234567890abcdef1234567890abcdef12345678";
      
      // Mock target user
      User.findOne.mockResolvedValue({
        walletAddress: targetAddress,
        username: "targetuser"
      });
      
      // Mock follow relationship already exists
      Follow.findOne.mockResolvedValue({
        follower: followerAddress,
        following: targetAddress
      });
      
      // Act
      const result = await UserServices.followUser(targetAddress, followerAddress);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Already following this user"
      });
    });
  });

  describe("unfollowUser", () => {
    test("should unfollow user successfully", async () => {
      // Arrange
      const targetAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const followerAddress = "0x2234567890abcdef1234567890abcdef12345678";
      
      // Mock follow relationship exists
      Follow.findOne.mockResolvedValue({
        follower: followerAddress,
        following: targetAddress
      });
      
      // Act
      const result = await UserServices.unfollowUser(targetAddress, followerAddress);
      
      // Assert
      expect(Follow.findOne).toHaveBeenCalledWith({
        follower: followerAddress,
        following: targetAddress
      });
      
      expect(Follow.deleteOne).toHaveBeenCalledWith({
        follower: followerAddress,
        following: targetAddress
      });
      
      expect(User.updateOne).toHaveBeenCalledTimes(2);
      
      expect(result).toEqual({
        success: true,
        data: {
          follower: followerAddress,
          following: targetAddress
        }
      });
    });

    test("should handle non-existent follow relationship", async () => {
      // Arrange
      const targetAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const followerAddress = "0x2234567890abcdef1234567890abcdef12345678";
      
      // Mock follow relationship doesn't exist
      Follow.findOne.mockResolvedValue(null);
      
      // Act
      const result = await UserServices.unfollowUser(targetAddress, followerAddress);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: "Follow not found"
      });
    });
  });

  describe("getUserFollowers", () => {
    test("should return user followers successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const page = 1;
      const limit = 20;
      
      // Mock followers
      const mockFollowers = [
        {
          follower: "0x2234567890abcdef1234567890abcdef12345678",
          following: address,
          createdAt: new Date()
        },
        {
          follower: "0x3234567890abcdef1234567890abcdef12345678",
          following: address,
          createdAt: new Date()
        }
      ];
      
      // Mock follower users
      const mockUsers = [
        {
          walletAddress: "0x2234567890abcdef1234567890abcdef12345678",
          username: "follower1",
          avatarURI: "ipfs://avatar1CID"
        },
        {
          walletAddress: "0x3234567890abcdef1234567890abcdef12345678",
          username: "follower2",
          avatarURI: "ipfs://avatar2CID"
        }
      ];
      
      // Setup mocks
      Follow.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockFollowers)
          })
        })
      });
      
      Follow.countDocuments.mockResolvedValue(2);
      
      User.findOne
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1]);
      
      // Act
      const result = await UserServices.getUserFollowers(address, page, limit);
      
      // Assert
      expect(Follow.find).toHaveBeenCalledWith({ following: address });
      expect(Follow.countDocuments).toHaveBeenCalledWith({ following: address });
      expect(User.findOne).toHaveBeenCalledTimes(2);
      
      expect(result).toEqual({
        success: true,
        data: {
          followers: [
            {
              walletAddress: mockUsers[0].walletAddress,
              username: mockUsers[0].username,
              avatarURI: IPFSService.formatIPFSUrl(mockUsers[0].avatarURI),
              followedAt: mockFollowers[0].createdAt
            },
            {
              walletAddress: mockUsers[1].walletAddress,
              username: mockUsers[1].username,
              avatarURI: IPFSService.formatIPFSUrl(mockUsers[1].avatarURI),
              followedAt: mockFollowers[1].createdAt
            }
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 20,
            totalPages: 1
          }
        }
      });
    });
  });

  describe("getLeaderboard", () => {
    test("should return user leaderboard successfully", async () => {
      // Arrange
      const page = 1;
      const limit = 20;
      
      // Mock top users
      const mockUsers = [
        {
          walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
          username: "topuser1",
          avatarURI: "ipfs://avatar1CID",
          points: 1000,
          followerCount: 100,
          postCount: 50,
          subscription: { level: 5 }
        },
        {
          walletAddress: "0x2234567890abcdef1234567890abcdef12345678",
          username: "topuser2",
          avatarURI: "ipfs://avatar2CID",
          points: 800,
          followerCount: 80,
          postCount: 40,
          subscription: { level: 2 }
        }
      ];
      
      // Setup mocks
      User.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue(mockUsers)
            })
          })
        })
      });
      
      User.countDocuments.mockResolvedValue(2);
      
      // Act
      const result = await UserServices.getLeaderboard(page, limit);
      
      // Assert
      expect(User.find).toHaveBeenCalledWith({ status: "active" });
      expect(User.countDocuments).toHaveBeenCalledWith({ status: "active" });
      
      expect(result).toEqual({
        success: true,
        data: {
          leaderboard: [
            {
              walletAddress: mockUsers[0].walletAddress,
              username: mockUsers[0].username,
              avatarURI: IPFSService.formatIPFSUrl(mockUsers[0].avatarURI),
              points: mockUsers[0].points,
              followerCount: mockUsers[0].followerCount,
              postCount: mockUsers[0].postCount,
              subscriptionLevel: 5
            },
            {
              walletAddress: mockUsers[1].walletAddress,
              username: mockUsers[1].username,
              avatarURI: IPFSService.formatIPFSUrl(mockUsers[1].avatarURI),
              points: mockUsers[1].points,
              followerCount: mockUsers[1].followerCount,
              postCount: mockUsers[1].postCount,
              subscriptionLevel: 2
            }
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 20,
            totalPages: 1
          }
        }
      });
    });
  });
});