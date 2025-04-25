const { ethers } = require("ethers");
const { getProvider, getSignedContracts } = require("./blockchain.services");
const { Subscription, User } = require("../models/index");
const config = require("../configs/config.env");

class SubscriptionService {
  constructor() {
    this.priceMap = {
      1: 0, // Standard: 0 DX
      2: 0.000002, // Plus: 50 DX/tháng
      5: 0.00001, // Pro: 100 DX/tháng
      10: 0.0001, // Elite: 180 DX/tháng
    };
    this.validLevels = Object.keys(this.priceMap).map(Number);
    this.maxMonths = 12;
    this.minMonths = 1;
    this.network = "sepolia";
    this.currency = "ETH";

    // Thêm thông tin mô tả quyền lợi cho mỗi cấp độ subscription
    this.subscriptionBenefits = {
      1: {
        // Standard
        name: "Standard",
        benefits: [
          "Reward multiplier 1.5x",
          "Access to basic features",
          "Daily token claim limit: 12 tokens",
          "Maximum 3 posts per day",
        ],
      },
      2: {
        // Plus
        name: "Plus",
        benefits: [
          "Reward multiplier 2x",
          "All Standard features",
          "Daily token claim limit: 16 tokens",
          "Maximum 10 posts per day",
          "Access to exclusive content",
        ],
      },
      5: {
        // Pro
        name: "Pro",
        benefits: [
          "Reward multiplier 3x",
          "All Plus features",
          "Daily token claim limit: 24 tokens",
          "Unlimited posts",
          "Priority support",
          "Premium profile badge",
        ],
      },
      10: {
        // Elite
        name: "Elite",
        benefits: [
          "Reward multiplier 5x",
          "All Pro features",
          "Daily token claim limit: 40 tokens",
          "Exclusive NFT access",
          "VIP events access",
          "Dedicated support channel",
          "Custom profile features",
        ],
      },
    };
  }

  /**
   * Lấy thông tin mô tả về các cấp độ subscription
   */
  getSubscriptionLevels() {
    const levels = {};

    for (const level of this.validLevels) {
      levels[level] = {
        name: this.subscriptionBenefits[level].name,
        pricePerMonth: this.priceMap[level],
        currency: this.currency,
        benefits: this.subscriptionBenefits[level].benefits,
      };
    }

    return {
      success: true,
      status: 200,
      message: "Lấy thông tin các cấp độ subscription thành công",
      data: {
        levels,
        maxMonths: this.maxMonths,
        minMonths: this.minMonths,
        network: this.network,
      },
    };
  }

  /**
   * Tạo yêu cầu thanh toán subscription
   */
  async createSubscriptionRequest(walletAddress, level, months) {
    try {
      if (!this.validLevels.includes(Number(level))) {
        return {
          success: false,
          status: 400,
          message: "Level không hợp lệ. Chỉ chấp nhận 1, 2, 5 hoặc 10",
        };
      }

      if (months < this.minMonths || months > this.maxMonths) {
        return {
          success: false,
          status: 400,
          message: "Số tháng không hợp lệ. Chỉ chấp nhận từ 1-12 tháng",
        };
      }

      const normalizedAddress = walletAddress.toLowerCase();
      const pricePerMonth = this.priceMap[level];
      const totalPrice = pricePerMonth * months;

      const privateKey = config.PRIVATE_KEY;
      if (!privateKey) {
        return {
          success: false,
          status: 500,
          message: "Không tìm thấy private key từ cấu hình",
        };
      }

      const provider = getProvider();
      const adminWallet = new ethers.Wallet(privateKey, provider);

      // Tạo ID riêng cho mỗi yêu cầu
      const paymentId = ethers.keccak256(
        ethers.toUtf8Bytes(
          `${normalizedAddress}-${level}-${months}-${Date.now()}`
        )
      );

      // Lấy thông tin về level subscription
      const subscriptionInfo = this.subscriptionBenefits[level];

      const subscriptionPayment = new Subscription({
        user: normalizedAddress,
        level,
        months,
        totalPrice,
        paymentId,
        paymentStatus: "pending",
        paymentCurrency: this.currency,
        network: this.network,
        createdAt: new Date(),
        // Thêm thông tin mô tả về subscription
        subscriptionName: subscriptionInfo.name,
        subscriptionBenefits: subscriptionInfo.benefits,
      });

      await subscriptionPayment.save();

      return {
        success: true,
        status: 200,
        message: "Tạo yêu cầu subscription thành công",
        data: {
          paymentId,
          totalPrice,
          currency: this.currency,
          recipient: adminWallet.address,
          network: this.network,
          level,
          months,
          subscriptionName: subscriptionInfo.name,
          subscriptionBenefits: subscriptionInfo.benefits,
        },
      };
    } catch (error) {
      console.error("Lỗi tạo yêu cầu subscription:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi hệ thống khi tạo yêu cầu subscription",
      };
    }
  }

  /**
   * Xác nhận thanh toán và kích hoạt subscription on-chain
   */
  async confirmPaymentAndActivate(paymentId, transactionHash) {
    try {
      const payment = await Subscription.findOne({ paymentId });
      if (!payment) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy thông tin thanh toán",
        };
      }

      if (payment.paymentStatus !== "pending") {
        return {
          success: false,
          status: 400,
          message: `Thanh toán đã được xử lý trước đó (${payment.paymentStatus})`,
        };
      }

      const provider = getProvider();
      const txReceipt = await provider.getTransactionReceipt(transactionHash);

      if (!txReceipt || txReceipt.status !== 1) {
        return {
          success: false,
          status: 400,
          message: "Giao dịch không tồn tại hoặc thất bại trên blockchain",
        };
      }

      const tx = await provider.getTransaction(transactionHash);
      const adminAddresses = config.ADMIN_ADDRESSES;

      if (!adminAddresses || !adminAddresses.includes(tx.to.toLowerCase())) {
        return {
          success: false,
          status: 400,
          message: "Giao dịch không gửi đến đúng ví admin",
        };
      }

      const txValue = Number(ethers.formatEther(tx.value));
      const requiredValue = payment.totalPrice;
      const tolerance = 0.000000001;

      if (txValue < requiredValue - tolerance) {
        return {
          success: false,
          status: 400,
          message: `Số tiền thanh toán (${txValue} ETH) nhỏ hơn yêu cầu (${requiredValue} ETH)`,
        };
      }

      const privateKey = config.PRIVATE_KEY;
      if (!privateKey) {
        return {
          success: false,
          status: 500,
          message: "Không tìm thấy private key từ cấu hình",
        };
      }

      const { subscription } = getSignedContracts(privateKey);
      const activateTx = await subscription.activateSubscription(
        payment.user,
        payment.level,
        payment.months
      );
      const receipt = await activateTx.wait();

      payment.paymentStatus = "completed";
      payment.transactionHash = transactionHash;
      payment.confirmationDate = new Date();
      payment.subscriptionTransactionHash = receipt.transactionHash;
      await payment.save();

      // Lấy thông tin quyền lợi của subscription
      const subscriptionInfo = this.subscriptionBenefits[payment.level];

      const expirationDate = new Date(
        Date.now() + payment.months * 30 * 24 * 60 * 60 * 1000
      );

      // Cập nhật thông tin User và thêm lịch sử thanh toán
      await User.findOneAndUpdate(
        { walletAddress: payment.user },
        {
          subscriptionLevel: payment.level,
          subscriptionExpireDate: expirationDate,
          $push: {
            "subscription.paymentHistory": {
              paymentId: payment.paymentId,
              amount: payment.totalPrice,
              currency: payment.paymentCurrency,
              transactionHash: payment.transactionHash,
              date: payment.confirmationDate,
              months: payment.months,
            },
          },
          // Cập nhật thêm các thông tin về subscription
          "subscription.level": payment.level,
          "subscription.startDate": new Date(),
          "subscription.expiration": expirationDate,
          "subscription.paymentId": payment.paymentId,
        }
      );

      return {
        success: true,
        status: 200,
        message: "Xác nhận thanh toán và kích hoạt subscription thành công",
        data: {
          user: payment.user,
          level: payment.level,
          months: payment.months,
          subscriptionTransactionHash: receipt.transactionHash,
          subscriptionName: subscriptionInfo.name,
          subscriptionBenefits: subscriptionInfo.benefits,
          expiration: expirationDate,
        },
      };
    } catch (error) {
      console.error("Lỗi xác nhận thanh toán:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi hệ thống khi xác nhận thanh toán",
      };
    }
  }
}

module.exports = new SubscriptionService();
