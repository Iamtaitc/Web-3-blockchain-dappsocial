// models/UserRewards.js
const mongoose = require('mongoose');

const UserRewardsSchema = new mongoose.Schema({
  user: {
    type: String, // Địa chỉ ví
    required: true,
    lowercase: true
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
    transactionHash: String
  }]
});