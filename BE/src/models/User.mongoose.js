const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // Blockchain info
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Profile
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    ensName: String,
    bio: String,
    metadataURI: String, // IPFS URI cho full metadata
    avatarURI: String, // IPFS URI cho avatar
    coverURI: String, // IPFS URI cho cover image

    // Auth
    nonce: String,
    nonceExpiry: Date,
    refreshToken: String,

    // Social stats (cache)
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },

    // Rewards & Tokens
    pendingTokens: { type: Number, default: 0 },
    claimedTokens: { type: Number, default: 0 },
    lastClaimTime: Date,
    points: { type: Number, default: 0 },
    lastCheckIn: Date,
    checkInStreak: { type: Number, default: 0 },

    // Subscription
    subscription: {
      level: {
        type: Number,
        default: 0, // 0 = không có subscription, 1, 2, 5, 10 tương ứng với các cấp
        enum: [0, 1, 2, 5, 10],
      },
      startDate: Date,
      expiration: Date,
      paymentId: String, // Reference đến lần thanh toán gần nhất
      autoRenew: { type: Boolean, default: false },
      // Thêm thông tin mô tả về subscription
      subscriptionName: {
        type: String,
        enum: ["Free", "Standard", "Plus", "Pro", "Elite"],
        default: "Free",
      },
      subscriptionBenefits: {
        type: [String],
        default: [],
      },
      paymentHistory: [
        {
          paymentId: String,
          amount: Number,
          currency: {
            type: String,
            enum: ["ETH", "DXT"],
            default: "ETH",
          },
          transactionHash: String,
          date: { type: Date, default: Date.now },
          months: { type: Number, default: 1 },
          level: { type: Number, default: 1 },
          subscriptionName: String,
        },
      ],
    },

    // Status
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
UserSchema.virtual("isSubscribed").get(function () {
  if (!this.subscription || !this.subscription.expiration) return false;
  return this.subscription.expiration > new Date();
});

// Thêm virtual để lấy tên subscription level
UserSchema.virtual("subscriptionName").get(function () {
  const levels = {
    0: "Free",
    1: "Standard",
    2: "Plus",
    5: "Pro",
    10: "Elite",
  };
  return levels[this.subscription?.level || 0];
});

// Virtual cho reward multiplier
UserSchema.virtual("rewardMultiplier").get(function () {
  if (!this.isSubscribed) return 1;

  const multipliers = {
    1: 1.5, // Standard: 1.5x
    2: 2, // Plus: 2x
    5: 3, // Pro: 3x
    10: 5, // Elite: 5x
  };

  return multipliers[this.subscription.level] || 1;
});

// Virtual cho đặc quyền gói subscription
UserSchema.virtual("subscriptionBenefits").get(function () {
  const benefits = {
    0: [
      "Base reward multiplier 1x",
      "Access to free features only",
      "Daily token claim limit: 8 tokens",
      "Maximum 1 post per day",
    ],
    1: [
      "Reward multiplier 1.5x",
      "Access to basic features",
      "Daily token claim limit: 12 tokens",
      "Maximum 3 posts per day",
    ],
    2: [
      "Reward multiplier 2x",
      "All Standard features",
      "Daily token claim limit: 16 tokens",
      "Maximum 10 posts per day",
      "Access to exclusive content",
    ],
    5: [
      "Reward multiplier 3x",
      "All Plus features",
      "Daily token claim limit: 24 tokens",
      "Unlimited posts",
      "Priority support",
      "Premium profile badge",
    ],
    10: [
      "Reward multiplier 5x",
      "All Pro features",
      "Daily token claim limit: 40 tokens",
      "Exclusive NFT access",
      "VIP events access",
      "Dedicated support channel",
      "Custom profile features",
    ],
  };

  return benefits[this.subscription?.level || 0];
});

// Thêm method để tính thời gian claim tiếp theo
UserSchema.methods.getNextClaimTime = function () {
  if (!this.lastClaimTime) return new Date();

  const nextClaimTime = new Date(this.lastClaimTime);
  nextClaimTime.setHours(nextClaimTime.getHours() + 8); // Cứ 8 giờ claim 1 lần

  return nextClaimTime;
};

// Method để kiểm tra người dùng có thể claim token không
UserSchema.methods.canClaimTokens = function () {
  if (!this.lastClaimTime) return true;

  const hoursSinceLastClaim =
    (new Date() - this.lastClaimTime) / (1000 * 60 * 60);
  return hoursSinceLastClaim >= 8;
};

// Method để tính số token sẽ nhận được khi claim
UserSchema.methods.getClaimAmount = function () {
  const baseAmount = 8; // Token cơ bản cho mỗi lần claim
  return Math.floor(baseAmount * this.rewardMultiplier);
};

// Method để lấy thông tin đầy đủ về subscription
UserSchema.methods.getSubscriptionDetails = function () {
  if (!this.isSubscribed) {
    return {
      name: "Free",
      level: 0,
      multiplier: 1,
      benefits: this.subscriptionBenefits,
      expiration: null,
      isActive: false,
    };
  }

  return {
    name: this.subscriptionName,
    level: this.subscription.level,
    multiplier: this.rewardMultiplier,
    benefits: this.subscriptionBenefits,
    expiration: this.subscription.expiration,
    isActive: true,
    startDate: this.subscription.startDate,
  };
};

// Indexes
UserSchema.index({ username: "text", bio: "text" });
UserSchema.index({ points: -1 });
UserSchema.index({ "subscription.level": 1 });
UserSchema.index({ "subscription.expiration": 1 });
UserSchema.index({ lastClaimTime: 1 });

module.exports = mongoose.model("User", UserSchema);
