const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Blockchain info
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Profile
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  ensName: String,
  bio: String,
  metadataURI: String, // IPFS URI cho full metadata
  avatarURI: String,   // IPFS URI cho avatar
  coverURI: String,    // IPFS URI cho cover image
  
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
      enum: [0, 1, 2, 5, 10]
    },
    startDate: Date,
    expiration: Date,
    paymentId: String, // Reference đến lần thanh toán gần nhất
    autoRenew: { type: Boolean, default: false },
    paymentHistory: [{
      paymentId: String,
      amount: Number,
      currency: {
        type: String,
        enum: ['ETH', 'DXT'],
        default: 'ETH'
      },
      transactionHash: String,
      date: { type: Date, default: Date.now },
      months: { type: Number, default: 1 }
    }]
  },
  
  // Status
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
UserSchema.virtual('isSubscribed').get(function() {
  if (!this.subscription || !this.subscription.expiration) return false;
  return this.subscription.expiration > new Date();
});

// Thêm virtual để lấy tên subscription level
UserSchema.virtual('subscriptionName').get(function() {
  const levels = {
    1: 'Standard',
    2: 'Plus',
    5: 'Pro',
    10: 'Elite'
  };
  return levels[this.subscription?.level || 0];
});

// Virtual cho reward multiplier
UserSchema.virtual('rewardMultiplier').get(function() {
  if (!this.isSubscribed) return 1;
  
  const multipliers = {
    1: 1.5,  // Standard: 1.5x
    2: 2,    // Plus: 2x
    5: 3,    // Pro: 3x
    10: 5    // Elite: 5x
  };
  
  return multipliers[this.subscription.level] || 1;
});

// Thêm method để tính thời gian claim tiếp theo
UserSchema.methods.getNextClaimTime = function() {
  if (!this.lastClaimTime) return new Date();
  
  const nextClaimTime = new Date(this.lastClaimTime);
  nextClaimTime.setHours(nextClaimTime.getHours() + 8); // Cứ 8 giờ claim 1 lần
  
  return nextClaimTime;
};

// Method để kiểm tra người dùng có thể claim token không
UserSchema.methods.canClaimTokens = function() {
  if (!this.lastClaimTime) return true;
  
  const hoursSinceLastClaim = (new Date() - this.lastClaimTime) / (1000 * 60 * 60);
  return hoursSinceLastClaim >= 8;
};

// Method để tính số token sẽ nhận được khi claim
UserSchema.methods.getClaimAmount = function() {
  const baseAmount = 8; // Token cơ bản cho mỗi lần claim
  return Math.floor(baseAmount * this.rewardMultiplier);
};

// Indexes
UserSchema.index({ username: 'text', bio: 'text' });
UserSchema.index({ points: -1 });
UserSchema.index({ 'subscription.level': 1 });
UserSchema.index({ 'subscription.expiration': 1 });
UserSchema.index({ lastClaimTime: 1 });

module.exports = mongoose.model('User', UserSchema);