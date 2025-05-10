// models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    // Thông tin người dùng
    user: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    // Thông tin subscription
    level: {
      type: Number,
      required: true,
      enum: [1, 2, 5, 10], // Standard, Plus, Pro, Elite
      default: 1,
    },
    months: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },

    // Thông tin mô tả về subscription
    subscriptionName: {
      type: String,
      enum: ["Standard", "Plus", "Pro", "Elite"],
      default: "Standard",
    },
    subscriptionBenefits: {
      type: [String],
      default: [],
    },

    // Thông tin thanh toán
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentCurrency: {
      type: String,
      required: true,
      enum: ["ETH", "DXT"], // Ethereum hoặc DX Token
      default: "ETH",
    },
    network: {
      type: String,
      required: true,
      enum: ["mainnet", "sepolia"],
      default: "sepolia",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "expired"],
      default: "pending",
    },

    // Thông tin blockchain
    transactionHash: {
      type: String,
      sparse: true, // Cho phép null nhưng vẫn đảm bảo unique khi có giá trị
      index: true,
    },
    subscriptionTransactionHash: {
      type: String,
      sparse: true,
    },

    // Metadata
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    confirmationDate: {
      type: Date,
    },
    expirationTime: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 giờ để thanh toán
    },

    // Thông tin bổ sung
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes
subscriptionSchema.index({ user: 1, createdAt: -1 });
subscriptionSchema.index({ paymentStatus: 1, expirationTime: 1 });

// Method để kiểm tra xem yêu cầu thanh toán đã hết hạn chưa
subscriptionSchema.methods.isExpired = function () {
  return this.expirationTime < new Date() && this.paymentStatus === "pending";
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
