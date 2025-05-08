const mongoose = require("mongoose");
const {
  listNFTForSale,
  unlistNFT,
  buyNFT,
  purchaseComplete,
} = require("../../src/services/nft/marketplaceNFT");
const NFTCache = require("../../models/NFTCache.mongoose");
const blockchainService = require("../../src/services/blockchain.services");
const notificationService = require("../../src/services/notification.services");
const { retryOperation } = require("../../utils/retry.utils");

jest.mock("../../models/NFTCache.mongoose");
jest.mock("../../src/services/blockchain.services");
jest.mock("../../src/services/notification.services");
jest.mock("../../utils/retry.utils");

describe("MarketplaceNFT Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listNFTForSale", () => {
    it("should return error if price is invalid", async () => {
      const result = await listNFTForSale("123", "invalid", "0x123");
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "Giá không hợp lệ",
      });
    });

    it("should return error if NFT does not exist", async () => {
      NFTCache.findOne.mockResolvedValue(null);
      const result = await listNFTForSale("123", "100", "0x123");
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      });
    });

    it("should list NFT successfully", async () => {
      const mockNFT = {
        tokenId: "123",
        owner: "0x123",
        forSale: false,
      };
      const mockListingResult = { transactionHash: "0xabc" };

      NFTCache.findOne.mockResolvedValue(mockNFT);
      retryOperation.mockImplementation(async (fn) => fn());
      blockchainService.listNFTForSale.mockResolvedValue(mockListingResult);
      NFTCache.findOneAndUpdate.mockResolvedValue(mockNFT);

      const result = await listNFTForSale("123", "100", "0x123");
      expect(result).toEqual({
        tokenId: "123",
        price: "100",
        txHash: "0xabc",
      });
    });
  });

  describe("unlistNFT", () => {
    it("should return error if NFT is not for sale", async () => {
      NFTCache.findOne.mockResolvedValue({ tokenId: "123", forSale: false });
      const result = await unlistNFT("123", "0x123");
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "NFT không được đăng bán",
      });
    });
  });

  describe("buyNFT", () => {
    it("should return error if buyer is owner", async () => {
      NFTCache.findOne.mockResolvedValue({
        tokenId: "123",
        forSale: true,
        owner: "0x123",
      });
      const result = await buyNFT("123", "0x123");
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "Bạn không thể mua NFT của chính mình",
      });
    });
  });

  describe("purchaseComplete", () => {
    it("should complete purchase successfully", async () => {
      const mockNFT = {
        tokenId: "123",
        owner: "0x456",
        forSale: true,
        price: "100",
        metadata: { name: "Test NFT" },
      };
      const mockUpdatedNFT = { ...mockNFT, owner: "0x123" };

      NFTCache.findOne.mockResolvedValue(mockNFT);
      blockchainService.verifyTransaction.mockResolvedValue(true);
      NFTCache.findOneAndUpdate.mockResolvedValue(mockUpdatedNFT);
      notificationService.createNotification.mockResolvedValue({});

      const result = await purchaseComplete("123", "0xabc", "0x123");
      expect(result).toEqual({
        tokenId: "123",
        name: "Test NFT",
        previousOwner: "0x456",
        newOwner: "0x123",
        price: "100",
        txHash: "0xabc",
      });
    });
  });
});
