const { ethers } = require("ethers");
const {
  getProvider,
  getSignedContracts,
} = require("../../src/services/blockchain.services");
const { Subscription, User } = require("../../src/models/index");
const config = require("../../src/configs/config.env");
const SubscriptionService = require("../../src/services/subscription.service");

// Mock các modules
jest.mock("ethers", () => ({
  ethers: {
    Wallet: jest.fn().mockImplementation(() => ({
      address: "0xMockAdminAddress",
      sendTransaction: jest.fn().mockResolvedValue({
        hash: "0xMockTransactionHash",
      }),
    })),
    keccak256: jest.fn().mockReturnValue("0xMockPaymentId"),
    toUtf8Bytes: jest.fn().mockReturnValue([]),
    parseEther: jest.fn().mockReturnValue("1000000000000000000"), // 1 ETH in wei
  },
}));

jest.mock("../../src/services/blockchain.services", () => ({
  getProvider: jest.fn().mockReturnValue({
    getTransactionReceipt: jest.fn(),
    getTransaction: jest.fn(),
  }),
  getSignedContracts: jest.fn().mockReturnValue({
    subscription: {
      activateSubscription: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: "0xMockActivationTransactionHash",
        }),
      }),
    },
  }),
}));

jest.mock("../../src/models/index", () => ({
  Subscription: {
    findOne: jest.fn(),
    save: jest.fn().mockReturnThis(),
  },
  User: {
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("../../src/configs/config.env", () => ({
  PRIVATE_KEY: "mockPrivateKey",
  ADMIN_ADDRESSES: ["0xmockadminaddress"],
}));

describe("SubscriptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSubscriptionRequest", () => {
    test("should create a subscription request successfully", async () => {
      // Arrange
      const walletAddress = "0xUserWalletAddress";
      const level = 2;
      const months = 3;

      // Mock Subscription constructor
      const mockSave = jest.fn();
      function MockSubscription() {
        this.save = mockSave;
        return this;
      }

      // Temporarily replace the Subscription mock
      const originalSubscription = Subscription;
      Subscription = MockSubscription;

      // Act
      const result = await SubscriptionService.createSubscriptionRequest(
        walletAddress,
        level,
        months
      );

      // Restore the original Subscription mock
      Subscription = originalSubscription;

      // Assert
      expect(ethers.Wallet).toHaveBeenCalledWith(
        "mockPrivateKey",
        expect.anything()
      );
      expect(ethers.toUtf8Bytes).toHaveBeenCalledWith(
        expect.stringContaining(walletAddress.toLowerCase())
      );
      expect(ethers.keccak256).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        status: 200,
        message: "Tạo yêu cầu subscription thành công",
        data: {
          paymentId: "0xMockPaymentId",
          totalPrice: 0.0002 * 3, // level 2 price * 3 months
          currency: "ETH",
          recipient: "0xMockAdminAddress",
          network: "sepolia",
          level,
          months,
          transactionHash: "0xMockTransactionHash",
        },
      });
    });

    test("should return error for invalid level", async () => {
      // Act
      const result = await SubscriptionService.createSubscriptionRequest(
        "0xUserWalletAddress",
        3,
        3
      );

      // Assert
      expect(result).toEqual({
        success: false,
        status: 400,
        message: "Level không hợp lệ. Chỉ chấp nhận 1, 2, 5 hoặc 10",
      });
    });

    test("should return error for invalid months", async () => {
      // Act
      const result = await SubscriptionService.createSubscriptionRequest(
        "0xUserWalletAddress",
        2,
        13
      );

      // Assert
      expect(result).toEqual({
        success: false,
        status: 400,
        message: "Số tháng không hợp lệ. Chỉ chấp nhận từ 1-12 tháng",
      });
    });
  });

  describe("confirmPaymentAndActivate", () => {
    test("should confirm payment and activate subscription successfully", async () => {
      // Arrange
      const paymentId = "0xMockPaymentId";
      const transactionHash = "0xMockTransactionHash";

      // Mock subscription record
      const mockSubscription = {
        paymentId,
        paymentStatus: "pending",
        user: "0xuserwalletaddress",
        level: 2,
        months: 3,
        totalPrice: 0.0006,
        save: jest.fn(),
      };

      // Mock transaction receipt
      const mockReceipt = {
        status: 1,
      };

      // Mock transaction
      const mockTransaction = {
        to: "0xmockadminaddress",
        value: ethers.parseEther("0.0006"), // Same as totalPrice
      };

      // Setup mocks
      Subscription.findOne.mockResolvedValue(mockSubscription);

      const mockProvider = getProvider();
      mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);
      mockProvider.getTransaction.mockResolvedValue(mockTransaction);

      // Act
      const result = await SubscriptionService.confirmPaymentAndActivate(
        paymentId,
        transactionHash
      );

      // Assert
      expect(Subscription.findOne).toHaveBeenCalledWith({ paymentId });
      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith(
        transactionHash
      );
      expect(mockProvider.getTransaction).toHaveBeenCalledWith(transactionHash);

      expect(getSignedContracts).toHaveBeenCalledWith("mockPrivateKey");
      expect(
        getSignedContracts().subscription.activateSubscription
      ).toHaveBeenCalledWith(
        mockSubscription.user,
        mockSubscription.level,
        mockSubscription.months
      );

      expect(mockSubscription.save).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        status: 200,
        message: "Xác nhận thanh toán và kích hoạt subscription thành công",
        data: {
          user: mockSubscription.user,
          level: mockSubscription.level,
          months: mockSubscription.months,
          subscriptionTransactionHash: "0xMockActivationTransactionHash",
        },
      });
    });

    test("should return error when payment not found", async () => {
      // Arrange
      Subscription.findOne.mockResolvedValue(null);

      // Act
      const result = await SubscriptionService.confirmPaymentAndActivate(
        "nonExistentPaymentId",
        "0xMockTransactionHash"
      );

      // Assert
      expect(result).toEqual({
        success: false,
        status: 404,
        message: "Không tìm thấy thông tin thanh toán",
      });
    });

    test("should return error when payment status is not pending", async () => {
      // Arrange
      const mockSubscription = {
        paymentId: "0xMockPaymentId",
        paymentStatus: "completed",
      };

      Subscription.findOne.mockResolvedValue(mockSubscription);

      // Act
      const result = await SubscriptionService.confirmPaymentAndActivate(
        "0xMockPaymentId",
        "0xMockTransactionHash"
      );

      // Assert
      expect(result).toEqual({
        success: false,
        status: 400,
        message: "Thanh toán đã được xử lý trước đó (completed)",
      });
    });
  });
});
