const PostService = require("../../src/services/post/index");
const { User, Post, Like, SavePost } = require("../../src/models/index");
const IPFSService = require("../../src/services/ipfs.services");
const NFTService = require("../../src/services/nft/index");
const axios = require("axios");
const { getPostsWithDetails } = require("../../src/utils/getPostDetails.utils");
const {
  formatPostResponse,
  getPostInteractionStatus,
  createPaginationObject,
} = require("../../src/services/post/utils");

jest.mock("../../src/models/index");
jest.mock("../../src/services/ipfs.services");
jest.mock("../../src/services/nft/index");
jest.mock("axios");
jest.mock("../../src/utils/getPostDetails.utils");
jest.mock("../../src/services/post/utils");

describe("PostService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPostsByUser", () => {
    it("should return posts by user successfully", async () => {
      const mockUser = { walletAddress: "0x1", username: "user1" };
      const mockPosts = [
        { _id: "post1", author: "0x1", content: "Hello", status: "active" },
      ];
      User.findOne.mockResolvedValue(mockUser);
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockPosts),
      });
      getPostsWithDetails.mockResolvedValue(mockPosts);

      const result = await PostService.getPostsByUser("0x1", 0, 10);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockPosts);
    });

    it("should return error if address is missing", async () => {
      const result = await PostService.getPostsByUser(null);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe("Address is required");
    });

    it("should return error if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await PostService.getPostsByUser("0x1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("User not found");
    });

    it("should return empty array if no posts found", async () => {
      User.findOne.mockResolvedValue({ walletAddress: "0x1" });
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      const result = await PostService.getPostsByUser("0x1");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });
  });

  describe("getIdPost", () => {
    it("should return post by ID successfully", async () => {
      const mockPost = { _id: "post1", content: "Hello" };
      Post.findOne.mockResolvedValue(mockPost);
      Post.updateOne.mockResolvedValue({});

      const result = await PostService.getIdPost("post1");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockPost);
      expect(Post.updateOne).toHaveBeenCalledWith(
        { _id: "post1" },
        { $inc: { viewCount: 1 } }
      );
    });

    it("should return error if post not found", async () => {
      Post.findOne.mockResolvedValue(null);

      const result = await PostService.getIdPost("post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Post not found");
    });
  });

  describe("getAllPosts", () => {
    it("should return all posts with pagination", async () => {
      const mockPosts = [{ _id: "post1", status: "active" }];
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockPosts),
      });
      Post.countDocuments.mockResolvedValue(1);
      getPostsWithDetails.mockResolvedValue(mockPosts);

      const result = await PostService.getAllPosts(1, 0, 10);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.posts).toEqual(mockPosts);
      expect(result.total).toBe(1);
    });

    it("should return empty array if no posts found", async () => {
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      Post.countDocuments.mockResolvedValue(0);

      const result = await PostService.getAllPosts(1, 0, 10);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getTrendingPosts", () => {
    it("should return trending posts with interaction status", async () => {
      const mockPosts = [{ _id: "post1", author: "0x1", trendingScore: 10 }];
      Post.aggregate.mockResolvedValue(mockPosts);
      Post.countDocuments.mockResolvedValue(1);
      User.findOne.mockResolvedValue({
        walletAddress: "0x1",
        username: "user1",
      });
      Like.findOne.mockResolvedValue(null);
      SavePost.findOne.mockResolvedValue(null);
      IPFSService.formatIPFSUrl.mockReturnValue("https://ipfs.io/ipfs/cid");

      const result = await PostService.getTrendingPosts(1, 10, "0x2");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.posts).toHaveLength(1);
      expect(result.data.posts[0].isLiked).toBe(false);
      expect(result.data.posts[0].isSaved).toBe(false);
    });

    it("should handle errors in trending posts", async () => {
      Post.aggregate.mockRejectedValue(new Error("Database error"));

      const result = await PostService.getTrendingPosts(1, 10);

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe("Error getting trending posts");
    });
  });

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const mockUser = { walletAddress: "0x1", username: "user1" };
      const mockPost = { _id: "post1", author: "0x1", content: "Hello" };
      User.findOne.mockResolvedValue(mockUser);
      IPFSService.uploadJSON.mockResolvedValue("cid");
      Post.prototype.save = jest.fn().mockResolvedValue(mockPost);
      User.updateOne.mockResolvedValue({});
      PostService.processMentions.mockResolvedValue([]);

      const result = await PostService.createPost(
        "Hello",
        ["tag1"],
        ["@user2"],
        "0x1",
        [{ uri: "ipfs://cid" }]
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
      expect(result.data.content).toBe("Hello");
    });

    it("should return error if no content or media", async () => {
      const result = await PostService.createPost("", [], [], "0x1", []);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe("Post must contain either content or media");
    });

    it("should return error if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await PostService.createPost("Hello", [], [], "0x1", []);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("User not found");
    });
  });

  describe("findUserFromMention", () => {
    it("should find user from mention", async () => {
      const mockUser = { username: "user1", walletAddress: "0x1" };
      User.findOne.mockResolvedValue(mockUser);

      const result = await PostService.findUserFromMention("@user1");

      expect(result).toEqual({ username: "user1", walletAddress: "0x1" });
    });

    it("should return null if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await PostService.findUserFromMention("@user1");

      expect(result).toBeNull();
    });
  });

  describe("processMentions", () => {
    it("should process mentions successfully", async () => {
      const mockUser = { username: "user1", walletAddress: "0x1" };
      User.findOne.mockResolvedValue(mockUser);

      const result = await PostService.processMentions(["@user1"]);

      expect(result).toEqual([{ username: "user1", walletAddress: "0x1" }]);
    });

    it("should return empty array if no mentions", async () => {
      const result = await PostService.processMentions([]);

      expect(result).toEqual([]);
    });
  });

  describe("likePost", () => {
    it("should like a post successfully", async () => {
      const mockPost = { _id: "post1", author: "0x1", status: "active" };
      Post.findById.mockResolvedValue(mockPost);
      Like.findOne.mockResolvedValue(null);
      Like.create.mockResolvedValue({});
      Post.updateOne.mockResolvedValue({});

      const result = await PostService.likePost("0x2", "post1");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe("Post liked successfully");
    });

    it("should return error if post not found", async () => {
      Post.findById.mockResolvedValue(null);

      const result = await PostService.likePost("0x2", "post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Post not found");
    });

    it("should return error if post already liked", async () => {
      Post.findById.mockResolvedValue({ _id: "post1", status: "active" });
      Like.findOne.mockResolvedValue({});

      const result = await PostService.likePost("0x2", "post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe("Post already liked");
    });
  });

  describe("unlikePostService", () => {
    it("should unlike a post successfully", async () => {
      Like.findOne.mockResolvedValue({});
      Like.deleteOne.mockResolvedValue({});
      Post.updateOne.mockResolvedValue({});

      const result = await PostService.unlikePostService("0x2", "post1");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe("Post unliked successfully");
    });

    it("should return error if post not liked", async () => {
      Like.findOne.mockResolvedValue(null);

      const result = await PostService.unlikePostService("0x2", "post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe("Post not liked");
    });
  });

  describe("savePostService", () => {
    it("should save a post successfully", async () => {
      Post.findById.mockResolvedValue({ _id: "post1", status: "active" });
      SavePost.findOne.mockResolvedValue(null);
      SavePost.create.mockResolvedValue({});
      Post.updateOne.mockResolvedValue({});

      const result = await PostService.savePostService("0x2", "post1");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe("Post saved successfully");
    });

    it("should return error if post not found", async () => {
      Post.findById.mockResolvedValue(null);

      const result = await PostService.savePostService("0x2", "post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Post not found");
    });

    it("should return error if post already saved", async () => {
      Post.findById.mockResolvedValue({ _id: "post1", status: "active" });
      SavePost.findOne.mockResolvedValue({});

      const result = await PostService.savePostService("0x2", "post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe("Post already saved");
    });
  });

  describe("unsavePostService", () => {
    it("should unsave a post successfully", async () => {
      SavePost.findOne.mockResolvedValue({});
      SavePost.deleteOne.mockResolvedValue({});
      Post.updateOne.mockResolvedValue({});

      const result = await PostService.unsavePostService("0x2", "post1");

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe("Post unsaved successfully");
    });

    it("should return error if post not saved", async () => {
      SavePost.findOne.mockResolvedValue(null);

      const result = await PostService.unsavePostService("0x2", "post1");

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Post not saved");
    });
  });

  describe("getSavePostsService", () => {
    it("should return saved posts successfully", async () => {
      const mockSaved = [{ postId: "post1", user: "0x2" }];
      const mockPosts = [{ _id: "post1", author: "0x1", status: "active" }];
      const mockAuthors = [{ walletAddress: "0x1", username: "user1" }];
      SavePost.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockSaved),
      });
      Post.find.mockResolvedValue(mockPosts);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAuthors),
      });
      Like.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });
      SavePost.countDocuments.mockResolvedValue(1);
      IPFSService.formatIPFSUrl.mockReturnValue("https://ipfs.io/ipfs/cid");

      const result = await PostService.getSavePostsService("0x2", 1, 10);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.posts).toHaveLength(1);
    });

    it("should return empty array if no saved posts", async () => {
      SavePost.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await PostService.getSavePostsService("0x2", 1, 10);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.posts).toEqual([]);
    });
  });

  describe("createNFTFromPostMedia", () => {
    it("should create NFT from post media successfully", async () => {
      const mockPost = {
        _id: "post1",
        author: "0x1",
        status: "active",
        media: [{ uri: "ipfs://cid", mimeType: "image/png" }],
      };
      Post.findById.mockResolvedValue(mockPost);
      IPFSService.parseIPFSUri.mockReturnValue("cid");
      IPFSService.formatIPFSUrl.mockReturnValue("https://ipfs.io/ipfs/cid");
      axios.get.mockResolvedValue({ data: Buffer.from("image") });
      NFTService.mintNFT.mockResolvedValue({
        tokenId: "nft1",
        name: "NFT",
        txHash: "tx1",
      });
      Post.findByIdAndUpdate.mockResolvedValue({});

      const result = await PostService.createNFTFromPostMedia(
        "post1",
        0,
        "0x1",
        { name: "NFT" }
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
      expect(result.data.tokenId).toBe("nft1");
    });

    it("should return error if post not found", async () => {
      Post.findById.mockResolvedValue(null);

      const result = await PostService.createNFTFromPostMedia(
        "post1",
        0,
        "0x1",
        {}
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Post not found");
    });

    it("should return error if media not found", async () => {
      Post.findById.mockResolvedValue({
        _id: "post1",
        author: "0x1",
        status: "active",
        media: [],
      });

      const result = await PostService.createNFTFromPostMedia(
        "post1",
        0,
        "0x1",
        {}
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Media not found in post");
    });

    it("should return error if user is not post author", async () => {
      Post.findById.mockResolvedValue({
        _id: "post1",
        author: "0x1",
        status: "active",
        media: [{ uri: "ipfs://cid" }],
      });

      const result = await PostService.createNFTFromPostMedia(
        "post1",
        0,
        "0x2",
        {}
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.message).toBe(
        "Only the post author can create NFT from this media"
      );
    });
  });

  describe("listNFTFromPost", () => {
    it("should list NFT for sale successfully", async () => {
      NFTService.listNFTForSale.mockResolvedValue({
        success: true,
        tokenId: "nft1",
        price: "1",
        txHash: "tx1",
      });
      Post.updateOne.mockResolvedValue({});

      const result = await PostService.listNFTFromPost(
        "nft1",
        "1",
        "0x1",
        "post1"
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.tokenId).toBe("nft1");
    });

    it("should return error if NFT listing fails", async () => {
      NFTService.listNFTForSale.mockResolvedValue({
        success: false,
        message: "Listing failed",
      });

      const result = await PostService.listNFTFromPost(
        "nft1",
        "1",
        "0x1",
        "post1"
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Listing failed");
    });
  });

  describe("utils", () => {
    describe("formatPostResponse", () => {
      it("should format post response correctly", async () => {
        const mockPost = {
          _id: "post1",
          author: "0x1",
          content: "Hello",
          media: [{ uri: "ipfs://cid" }],
        };
        const mockAuthor = { username: "user1", avatarURI: "ipfs://cid" };
        IPFSService.formatIPFSUrl.mockReturnValue("https://ipfs.io/ipfs/cid");

        const result = formatPostResponse(mockPost, mockAuthor, true, true);

        expect(result).toMatchObject({
          _id: "post1",
          content: "Hello",
          isLiked: true,
          isSaved: true,
          authorDetails: { username: "user1" },
        });
      });
    });

    describe("getPostInteractionStatus", () => {
      it("should return interaction status for posts", async () => {
        Like.find.mockResolvedValue([{ postId: "post1" }]);
        SavePost.find.mockResolvedValue([{ postId: "post1" }]);

        const result = await getPostInteractionStatus(
          [{ _id: "post1" }],
          "0x1"
        );

        expect(result.likedMap.get("post1")).toBe(true);
        expect(result.savedMap.get("post1")).toBe(true);
      });
    });

    describe("createPaginationObject", () => {
      it("should create pagination object correctly", () => {
        const result = createPaginationObject(100, 2, 10);

        expect(result).toEqual({
          total: 100,
          page: 2,
          limit: 10,
          pages: 10,
        });
      });
    });
  });
});
