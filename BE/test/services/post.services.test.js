const { User, Post, SavePost, Like } = require("../../src/models/index");
const IPFSService = require("../../src/services/ipfs.services");
const NFTService = require("../../src/services/nft.services");
const { getPostsWithDetails } = require("../../src/utils/getPostDetails.utils");
const PostServices = require("../../src/services/post.services");
const axios = require("axios");

// Mock các modules
jest.mock("../../src/models/index", () => ({
  User: {
    findOne: jest.fn(),
    updateOne: jest.fn()
  },
  Post: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    findByIdAndUpdate: jest.fn()
  },
  SavePost: {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn()
  },
  Like: {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn()
  }
}));

jest.mock("../../src/services/ipfs.services", () => ({
  formatIPFSUrl: jest.fn(uri => uri ? `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}` : null),
  uploadFile: jest.fn().mockResolvedValue("mockCID"),
  uploadJSON: jest.fn().mockResolvedValue("mockMetadataCID"),
  createPostMetadata: jest.fn().mockReturnValue({ content: "Test content" }),
  parseIPFSUri: jest.fn().mockReturnValue("mockCID")
}));

jest.mock("../../src/services/nft.services", () => ({
  mintNFT: jest.fn(),
  listNFTForSale: jest.fn()
}));

jest.mock("../../src/utils/getPostDetails.utils", () => ({
  getPostsWithDetails: jest.fn()
}));

jest.mock("axios");

describe("PostServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPostsByUser", () => {
    test("should return posts by user successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const skip = 0;
      const limit = 10;
      
      // Mock user
      const mockUser = {
        walletAddress: address,
        username: "testuser"
      };
      
      // Mock posts
      const mockPosts = [
        { _id: "post1", author: address, content: "Test post 1" },
        { _id: "post2", author: address, content: "Test post 2" }
      ];
      
      // Mock posts with details
      const mockPostsWithDetails = [
        {
          _id: "post1",
          author: address,
          content: "Test post 1",
          authorDetails: {
            username: "testuser",
            avatarURI: null
          }
        },
        {
          _id: "post2",
          author: address,
          content: "Test post 2",
          authorDetails: {
            username: "testuser",
            avatarURI: null
          }
        }
      ];
      
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockPosts)
          })
        })
      });
      getPostsWithDetails.mockResolvedValue(mockPostsWithDetails);
      
      // Act
      const result = await PostServices.getPostsByUser(address, skip, limit);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: address });
      expect(Post.find).toHaveBeenCalledWith({ author: address, status: "active" });
      expect(getPostsWithDetails).toHaveBeenCalledWith(mockPosts, mockUser);
      
      expect(result).toEqual({
        success: true,
        status: 200,
        message: "Posts retrieved successfully",
        data: mockPostsWithDetails
      });
    });

    test("should handle non-existent user", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      User.findOne.mockResolvedValue(null);
      
      // Act
      const result = await PostServices.getPostsByUser(address);
      
      // Assert
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "User not found"
      });
    });

    test("should handle user with no posts", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      // Mock user
      const mockUser = {
        walletAddress: address,
        username: "testuser"
      };
      
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });
      
      // Act
      const result = await PostServices.getPostsByUser(address);
      
      // Assert
      expect(result).toEqual({
        success: true,
        status: 200,
        message: "No posts found",
        data: []
      });
    });
  });

  describe("findUserFromMention", () => {
    test("should find user from mention with @ symbol", async () => {
      // Arrange
      const mention = "@testuser";
      
      // Mock user
      const mockUser = {
        username: "testuser",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678"
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      const result = await PostServices.findUserFromMention(mention);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(result).toEqual({
        username: mockUser.username,
        walletAddress: mockUser.walletAddress
      });
    });

    test("should find user from mention without @ symbol", async () => {
      // Arrange
      const mention = "testuser";
      
      // Mock user
      const mockUser = {
        username: "testuser",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678"
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      const result = await PostServices.findUserFromMention(mention);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(result).toEqual({
        username: mockUser.username,
        walletAddress: mockUser.walletAddress
      });
    });

    test("should return null for non-existent username", async () => {
      // Arrange
      const mention = "@nonexistent";
      
      User.findOne.mockResolvedValue(null);
      
      // Act
      const result = await PostServices.findUserFromMention(mention);
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe("processMentions", () => {
    test("should process an array of mentions", async () => {
      // Arrange
      const mentions = ["@user1", "user2", "@nonexistent"];
      
      // Mock users
      const mockUser1 = {
        username: "user1",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678"
      };
      
      const mockUser2 = {
        username: "user2",
        walletAddress: "0x2234567890abcdef1234567890abcdef12345678"
      };
      
      // Setup mock implementation for findUserFromMention
      jest.spyOn(PostServices, "findUserFromMention")
        .mockResolvedValueOnce({
          username: mockUser1.username,
          walletAddress: mockUser1.walletAddress
        })
        .mockResolvedValueOnce({
          username: mockUser2.username,
          walletAddress: mockUser2.walletAddress
        })
        .mockResolvedValueOnce(null);
      
      // Act
      const result = await PostServices.processMentions(mentions);
      
      // Assert
      expect(PostServices.findUserFromMention).toHaveBeenCalledTimes(3);
      expect(result).toEqual([
        {
          username: mockUser1.username,
          walletAddress: mockUser1.walletAddress
        },
        {
          username: mockUser2.username,
          walletAddress: mockUser2.walletAddress
        }
      ]);
    });

    test("should handle empty or null mentions array", async () => {
      // Act
      const result1 = await PostServices.processMentions([]);
      const result2 = await PostServices.processMentions(null);
      
      // Assert
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });
  });

  describe("createPost", () => {
    test("should create a post successfully", async () => {
      // Arrange
      const content = "Test post content";
      const tags = ["tag1", "tag2"];
      const mentions = ["@user1", "@user2"];
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const mediaObjects = [
        { uri: "ipfs://mediaCID1", type: "image" },
        { uri: "ipfs://mediaCID2", type: "video" }
      ];
      
      // Mock user
      const mockUser = {
        walletAddress: address,
        username: "testuser"
      };
      
      // Mock processed mentions
      const mockProcessedMentions = [
        { username: "user1", walletAddress: "0x1111" },
        { username: "user2", walletAddress: "0x2222" }
      ];
      
      // Mock post
      const mockPost = {
        _id: "post1",
        author: address.toLowerCase(),
        content,
        contentURI: `ipfs://mockMetadataCID`,
        media: mediaObjects,
        tags,
        mentions: mockProcessedMentions,
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        viewCount: 0,
        status: "active",
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(PostServices, "processMentions").mockResolvedValue(mockProcessedMentions);
      
      // Mock Post constructor
      const originalPost = Post;
      Post = jest.fn().mockImplementation(() => mockPost);
      
      // Act
      const result = await PostServices.createPost(content, tags, mentions, address, mediaObjects);
      
      // Restore original Post constructor
      Post = originalPost;
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ walletAddress: address });
      expect(PostServices.processMentions).toHaveBeenCalledWith(mentions);
      expect(IPFSService.createPostMetadata).toHaveBeenCalledWith(
        content,
        ["mediaCID1", "mediaCID2"],
        tags,
        mockProcessedMentions.map(user => user.username)
      );
      expect(IPFSService.uploadJSON).toHaveBeenCalled();
      expect(Post).toHaveBeenCalledWith(expect.objectContaining({
        author: address.toLowerCase(),
        content,
        mentions: mockProcessedMentions,
        tags
      }));
      expect(mockPost.save).toHaveBeenCalled();
      expect(User.updateOne).toHaveBeenCalledWith(
        { walletAddress: address.toLowerCase() },
        { $inc: { "socialStats.postCount": 1 } }
      );
      
      expect(result).toEqual({
        success: true,
        status: 201,
        message: "Post created successfully",
        data: {
          id: mockPost._id,
          username: mockUser.username,
          author: mockPost.author,
          content: mockPost.content,
          contentURI: mockPost.contentURI,
          media: mockPost.media,
          tags: mockPost.tags,
          mentions: mockProcessedMentions,
          likeCount: mockPost.likeCount,
          commentCount: mockPost.commentCount,
          saveCount: mockPost.saveCount,
          createdAt: mockPost.createdAt
        }
      });
    });

    test("should handle validation error (no content and no media)", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      
      // Act
      const result = await PostServices.createPost("", [], [], address, []);
      
      // Assert
      expect(result).toEqual({
        success: false,
        status: 400,
        message: "Post must contain either content or media"
      });
    });
  });

  describe("likePost", () => {
    test("should like a post successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const postId = "post1";
      
      // Mock post
      const mockPost = {
        _id: postId,
        author: "0x2234567890abcdef1234567890abcdef12345678",
        content: "Test post content",
        status: "active"
      };
      
      // Setup mocks
      Post.findById.mockResolvedValue(mockPost);
      Like.findOne.mockResolvedValue(null);
      
      // Act
      const result = await PostServices.likePost(address, postId);
      
      // Assert
      expect(Post.findById).toHaveBeenCalledWith(postId);
      expect(Like.findOne).toHaveBeenCalledWith({
        user: address.toLowerCase(),
        postId
      });
      expect(Like.create).toHaveBeenCalledWith({
        user: address.toLowerCase(),
        postId,
        createdAt: expect.any(Date)
      });
      expect(Post.updateOne).toHaveBeenCalledWith(
        { _id: postId },
        { $inc: { likeCount: 1 } }
      );
      
      expect(result).toEqual({
        success: true,
        status: 200,
        message: "Post liked successfully",
        data: {
          postId,
          postAuthor: mockPost.author
        }
      });
    });

    test("should prevent liking an already liked post", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const postId = "post1";
      
      // Mock post
      const mockPost = {
        _id: postId,
        status: "active"
      };
      
      // Mock existing like
      const mockLike = {
        user: address.toLowerCase(),
        postId
      };
      
      // Setup mocks
      Post.findById.mockResolvedValue(mockPost);
      Like.findOne.mockResolvedValue(mockLike);
      
      // Act
      const result = await PostServices.likePost(address, postId);
      
      // Assert
      expect(result).toEqual({
        success: false,
        status: 400,
        message: "Post already liked"
      });
    });
  });

  describe("unlikePostService", () => {
    test("should unlike a post successfully", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const postId = "post1";
      
      // Mock existing like
      const mockLike = {
        user: address.toLowerCase(),
        postId
      };
      
      // Setup mocks
      Like.findOne.mockResolvedValue(mockLike);
      
      // Act
      const result = await PostServices.unlikePostService(address, postId);
      
      // Assert
      expect(Like.findOne).toHaveBeenCalledWith({
        user: address.toLowerCase(),
        postId
      });
      expect(Like.deleteOne).toHaveBeenCalledWith({
        user: address.toLowerCase(),
        postId
      });
      expect(Post.updateOne).toHaveBeenCalledWith(
        { _id: postId },
        { $inc: { likeCount: -1 } }
      );
      
      expect(result).toEqual({
        success: true,
        status: 200,
        message: "Post unliked successfully",
        data: { postId }
      });
    });

    test("should handle unliking a post that wasn't liked", async () => {
      // Arrange
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      const postId = "post1";
      
      // Setup mocks
      Like.findOne.mockResolvedValue(null);
      
      // Act
      const result = await PostServices.unlikePostService(address, postId);
      
      // Assert
      expect(result).toEqual({
        success: false,
        status: 400,
        message: "Post not liked"
      });
    });
  });

  describe("createNFTFromPostMedia", () => {
    test("should create NFT from post media successfully", async () => {
      // Arrange
      const postId = "post1";
      const mediaIndex = 0;
      const userAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const nftMetadata = {
        name: "Test NFT",
        description: "Test NFT Description",
        royaltyPercent: 10
      };
      
      // Mock post
      const mockPost = {
        _id: postId,
        author: userAddress,
        status: "active",
        media: [
          {
            uri: "ipfs://mediaCID",
            mimeType: "image/jpeg",
            filename: "test.jpg"
          }
        ]
      };
      
      // Mock NFT result
      const mockNFTResult = {
        tokenId: "token1",
        name: nftMetadata.name,
        description: nftMetadata.description,
        mediaType: "image",
        royaltyPercent: nftMetadata.royaltyPercent,
        txHash: "0xMockTxHash"
      };
      
      // Setup mocks
      Post.findById.mockResolvedValue(mockPost);
      axios.get.mockResolvedValue({ data: Buffer.from("mock file data") });
      NFTService.mintNFT.mockResolvedValue(mockNFTResult);
      
      // Act
      const result = await PostServices.createNFTFromPostMedia(
        postId, mediaIndex, userAddress, nftMetadata
      );
      
      // Assert
      expect(Post.findById).toHaveBeenCalledWith(postId);
      expect(IPFSService.parseIPFSUri).toHaveBeenCalledWith("ipfs://mediaCID");
      expect(IPFSService.formatIPFSUrl).toHaveBeenCalledWith("ipfs://mediaCID");
      expect(axios.get).toHaveBeenCalledWith(
        IPFSService.formatIPFSUrl("ipfs://mediaCID"),
        { responseType: "arraybuffer" }
      );
      expect(NFTService.mintNFT).toHaveBeenCalledWith(
        nftMetadata,
        userAddress,
        expect.any(Buffer),
        mockPost.media[0].mimeType,
        mockPost.media[0].filename
      );
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        {
          $push: {
            nfts: {
              tokenId: mockNFTResult.tokenId,
              mediaIndex,
              mintedAt: expect.any(Date)
            }
          }
        }
      );
      
      expect(result).toEqual({
        success: true,
        status: 201,
        message: "NFT created successfully from post media",
        data: {
          tokenId: mockNFTResult.tokenId,
          name: mockNFTResult.name,
          description: mockNFTResult.description,
          imageUrl: IPFSService.formatIPFSUrl("ipfs://mediaCID"),
          mediaType: mockNFTResult.mediaType,
          royaltyPercent: mockNFTResult.royaltyPercent,
          txHash: mockNFTResult.txHash,
          postId
        }
      });
    });

    test("should handle non-existent post", async () => {
      // Arrange
      const postId = "nonexistent";
      const mediaIndex = 0;
      const userAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const nftMetadata = { name: "Test NFT" };
      
      // Setup mocks
      Post.findById.mockResolvedValue(null);
      
      // Act
      const result = await PostServices.createNFTFromPostMedia(
        postId, mediaIndex, userAddress, nftMetadata
      );
      
      // Assert
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "Post not found"
      });
    });

    test("should handle unauthorized access (not post author)", async () => {
      // Arrange
      const postId = "post1";
      const mediaIndex = 0;
      const userAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const differentAddress = "0x2234567890abcdef1234567890abcdef12345678";
      const nftMetadata = { name: "Test NFT" };
      
      // Mock post with different author
      const mockPost = {
        _id: postId,
        author: differentAddress,
        status: "active",
        media: [
          { uri: "ipfs://mediaCID" }
        ]
      };
      
      // Setup mocks
      Post.findById.mockResolvedValue(mockPost);
      
      // Act
      const result = await PostServices.createNFTFromPostMedia(
        postId, mediaIndex, userAddress, nftMetadata
      );
      
      // Assert
      expect(result).toEqual({
        success: false,
        status: 403,
        message: "Only the post author can create NFT from this media"
      });
    });
  });
});