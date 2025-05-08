const {
  User,
  Post,
  NFTCache,
  Comment,
  Follow,
} = require("../../src/models/index");
const SearchService = require("../../src/services/search.services");

// Mock các modules
jest.mock("../../src/models/index", () => ({
  User: {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  },
  Post: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
  NFTCache: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Comment: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Follow: {
    find: jest.fn(),
  },
}));

jest.mock("../../src/utils/address.utils", () => ({
  isValidEthereumAddress: jest.fn(),
  normalizeAddress: jest.fn(),
}));

jest.mock("../../src/utils/format.utils", () => ({
  formatUserData: jest.fn((user) => user),
  formatPostsWithAuthor: jest.fn((posts) => posts),
  formatPostsWithAuthorAndInteractions: jest.fn((posts) => posts),
  formatUserListWithFollow: jest.fn((users) => users),
  formatNFTData: jest.fn((nft) => nft),
  formatNFTsWithUserDetails: jest.fn((nfts) => nfts),
  formatUserBasicData: jest.fn((user) => user),
  createPagination: jest.fn(() => ({
    currentPage: 1,
    totalPages: 1,
    totalItems: 10,
  })),
}));

describe("SearchService", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchUserForMention", () => {
    it("should return users with usernames starting with the keyword", async () => {
      // Mock data
      const keyword = "te";
      const limit = 5;
      const currentUser = {
        walletAddress: "0x123456789abcdef",
      };

      const mockUsers = [
        {
          _id: "user1",
          walletAddress: "0xabc123",
          username: "test123",
          avatarURI: "avatar1.jpg",
          isVerified: true,
        },
        {
          _id: "user2",
          walletAddress: "0xdef456",
          username: "testing",
          avatarURI: "avatar2.jpg",
          isVerified: false,
        },
      ];

      const mockFollowingList = [
        { follower: "0x123456789abcdef", following: "0xabc123" },
      ];

      // Setup mocks
      User.find.mockResolvedValue({
        select: jest.fn().mockResolvedValue({
          limit: jest.fn().mockResolvedValue(mockUsers),
        }),
      });

      Follow.find.mockResolvedValue({
        select: jest.fn().mockResolvedValue(mockFollowingList),
      });

      // Execute
      const result = await SearchService.searchUserForMention(
        keyword,
        limit,
        currentUser
      );

      // Assertions
      expect(User.find).toHaveBeenCalledWith({
        username: { $regex: "^te", $options: "i" },
        status: "active",
      });

      expect(Follow.find).toHaveBeenCalledWith({
        follower: "0x123456789abcdef",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.length).toBe(2);
      // First user should be the one that is followed
      expect(result.data[0]._id).toBe("user1");
    });

    it("should handle case when no current user is provided", async () => {
      // Mock data
      const keyword = "te";
      const limit = 5;
      const currentUser = null;

      const mockUsers = [
        {
          _id: "user1",
          walletAddress: "0xabc123",
          username: "test123",
          avatarURI: "avatar1.jpg",
          isVerified: true,
        },
      ];

      // Setup mocks
      User.find.mockResolvedValue({
        select: jest.fn().mockResolvedValue({
          limit: jest.fn().mockResolvedValue(mockUsers),
        }),
      });

      // Execute
      const result = await SearchService.searchUserForMention(
        keyword,
        limit,
        currentUser
      );

      // Assertions
      expect(User.find).toHaveBeenCalledWith({
        username: { $regex: "^te", $options: "i" },
        status: "active",
      });

      expect(Follow.find).not.toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
    });

    it("should handle errors", async () => {
      // Mock error
      const error = new Error("Database error");
      User.find.mockRejectedValue(error);

      // Execute
      const result = await SearchService.searchUserForMention("test", 5, null);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.error).toBe("Database error");
    });
  });

  describe("search", () => {
    it("should search for all types when no type is specified", async () => {
      // Mock data
      const query = "test";
      const type = null;
      const limit = 10;
      const page = 1;
      const currentUser = { _id: "user1" };

      // Mock users
      const mockUsers = [{ username: "test1" }, { username: "test2" }];
      User.find.mockResolvedValue({
        select: jest.fn().mockResolvedValue({
          sort: jest.fn().mockResolvedValue({
            skip: jest.fn().mockResolvedValue({
              limit: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      });
      User.countDocuments.mockResolvedValue(2);

      // Mock posts
      const mockPosts = [{ content: "test post" }];
      Post.find.mockResolvedValue({
        sort: jest.fn().mockResolvedValue({
          skip: jest.fn().mockResolvedValue({
            limit: jest.fn().mockResolvedValue(mockPosts),
          }),
        }),
      });
      Post.countDocuments.mockResolvedValue(1);

      // Mock NFTs
      const mockNFTs = [{ metadata: { name: "test NFT" } }];
      NFTCache.find.mockResolvedValue({
        sort: jest.fn().mockResolvedValue({
          skip: jest.fn().mockResolvedValue({
            limit: jest.fn().mockResolvedValue(mockNFTs),
          }),
        }),
      });
      NFTCache.countDocuments.mockResolvedValue(1);

      // Mock tags
      Post.aggregate.mockResolvedValue([{ _id: "testtag", count: 5 }]);

      // Execute
      const result = await SearchService.search(
        query,
        type,
        limit,
        page,
        currentUser
      );

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("users");
      expect(result.data).toHaveProperty("posts");
      expect(result.data).toHaveProperty("nfts");
      expect(result.data).toHaveProperty("tags");
    });

    it("should search only for the specified type", async () => {
      // Mock data
      const query = "test";
      const type = "users";
      const limit = 10;
      const page = 1;

      // Mock users
      const mockUsers = [{ username: "test1" }, { username: "test2" }];
      User.find.mockResolvedValue({
        select: jest.fn().mockResolvedValue({
          sort: jest.fn().mockResolvedValue({
            skip: jest.fn().mockResolvedValue({
              limit: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      });
      User.countDocuments.mockResolvedValue(2);

      // Execute
      const result = await SearchService.search(query, type, limit, page, null);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("users");
      expect(result.data).not.toHaveProperty("posts");
      expect(result.data).not.toHaveProperty("nfts");
      expect(result.data).not.toHaveProperty("tags");
    });

    it("should handle errors", async () => {
      // Mock error
      const error = new Error("Database error");
      User.find.mockRejectedValue(error);

      // Execute
      const result = await SearchService.search("test", "users", 10, 1, null);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("processMentions", () => {
    it("should extract mentions from content and find corresponding users", async () => {
      // Mock data
      const content = "Hello @test123 and @user456";

      // Mock findOne responses for mentioned users
      User.findOne
        .mockResolvedValueOnce({
          _id: "user1",
          walletAddress: "0xabc123",
          username: "test123",
          select: jest.fn().mockReturnThis(),
        })
        .mockResolvedValueOnce({
          _id: "user2",
          walletAddress: "0xdef456",
          username: "user456",
          select: jest.fn().mockReturnThis(),
        });

      // Execute
      const result = await SearchService.processMentions(content);

      // Assertions
      expect(User.findOne).toHaveBeenCalledTimes(2);
      expect(User.findOne).toHaveBeenCalledWith({
        username: "test123",
        status: "active",
      });
      expect(User.findOne).toHaveBeenCalledWith({
        username: "user456",
        status: "active",
      });

      expect(result.success).toBe(true);
      expect(result.data.mentions.length).toBe(2);
      expect(result.data.mentions[0].username).toBe("test123");
      expect(result.data.mentions[1].username).toBe("user456");
    });

    it("should handle non-existent mentions", async () => {
      // Mock data
      const content = "Hello @nonexistent";

      // User not found
      User.findOne.mockResolvedValue(null);

      // Execute
      const result = await SearchService.processMentions(content);

      // Assertions
      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data.mentions.length).toBe(0);
    });

    it("should handle content with no mentions", async () => {
      // Mock data
      const content = "Hello world, no mentions here";

      // Execute
      const result = await SearchService.processMentions(content);

      // Assertions
      expect(User.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.mentions.length).toBe(0);
    });

    it("should handle errors", async () => {
      // Mock error
      const error = new Error("Database error");
      User.findOne.mockRejectedValue(error);

      // Execute
      const result = await SearchService.processMentions("Hello @test");

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("searchUsers", () => {
    it("should search users with appropriate sorting", async () => {
      // Mock data
      const query = "test";
      const limit = 10;
      const page = 1;
      const sortBy = "newest";
      const currentUser = { _id: "user1" };

      // Mock users
      const mockUsers = [{ username: "test1" }, { username: "test2" }];
      User.find.mockResolvedValue({
        select: jest.fn().mockResolvedValue({
          sort: jest.fn().mockResolvedValue({
            skip: jest.fn().mockResolvedValue({
              limit: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      });
      User.countDocuments.mockResolvedValue(2);

      // Execute
      const result = await SearchService.searchUsers(
        query,
        limit,
        page,
        sortBy,
        currentUser
      );

      // Assertions
      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          status: "active",
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.users).toEqual(mockUsers);
    });
  });

  describe("searchPosts", () => {
    it("should search posts with filters", async () => {
      // Mock data
      const query = "test";
      const limit = 10;
      const page = 1;
      const sortBy = "trending";
      const withMedia = "true";
      const hasNFT = "true";
      const currentUser = { _id: "user1" };

      // Mock posts
      const mockPosts = [{ content: "test post" }];
      Post.find.mockResolvedValue({
        sort: jest.fn().mockResolvedValue({
          skip: jest.fn().mockResolvedValue({
            limit: jest.fn().mockResolvedValue(mockPosts),
          }),
        }),
      });
      Post.countDocuments.mockResolvedValue(1);

      // Execute
      const result = await SearchService.searchPosts(
        query,
        limit,
        page,
        sortBy,
        withMedia,
        hasNFT,
        currentUser
      );

      // Assertions
      expect(Post.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          "media.0": { $exists: true },
          linkedNFT: { $exists: true },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.posts).toEqual(mockPosts);
    });
  });

  describe("getTrendingTags", () => {
    it("should return trending tags from the last 7 days", async () => {
      // Mock data
      const limit = 5;

      // Mock aggregation result
      const mockTags = [
        { _id: "tag1", count: 10 },
        { _id: "tag2", count: 5 },
      ];
      Post.aggregate.mockResolvedValue(mockTags);

      // Execute
      const result = await SearchService.getTrendingTags(limit);

      // Assertions
      expect(Post.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: "active",
              createdAt: expect.any(Object),
            }),
          }),
        ])
      );
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toBe("tag1");
      expect(result.data[0].postCount).toBe(10);
    });
  });
});
