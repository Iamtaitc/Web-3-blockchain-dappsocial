const mongoose = require('mongoose');

const UserRewardsSchema = new mongoose.Schema({
  user: {
    type: String, // Địa chỉ ví
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Điểm tích lũy tổng cộng
  totalPoints: {
    type: Number,
    default: 0
  },
  
  // Token DX đang chờ claim
  pendingTokens: {
    type: Number,
    default: 0
  },
  
  // Token DX đã claim
  claimedTokens: {
    type: Number,
    default: 0
  },
  
  // Thời gian claim gần nhất
  lastClaimTime: {
    type: Date
  },
  
  // Lịch sử claim
  claimHistory: [{
    amount: Number,
    timestamp: Date,
    // transactionHash: String
  }],
  
  // Thông tin check-in
  checkIn: {
    lastCheckIn: { type: Date },
    currentStreak: { type: Number, default: 0 },
    lastStreakUpdate: { type: Date }, // Để biết khi nào streak được cập nhật lần cuối
    history: [{
      date: Date,
      streak: Number,
      pointsEarned: Number,
      tokensEarned: Number
    }]
  }
});

// Index
UserRewardsSchema.index({ user: 1 }, { unique: true });
UserRewardsSchema.index({ 'checkIn.lastCheckIn': -1 });

module.exports = mongoose.model('RewardPoints', UserRewardsSchema);