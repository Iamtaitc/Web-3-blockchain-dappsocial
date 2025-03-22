const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  description: String,
  
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special'],
    default: 'daily'
  },
  
  rewardPoints: {
    type: Number,
    required: true,
    default: 0
  },
  
  rewardTokens: {
    type: Number,
    default: 0
  },
  
  requirements: {
    action: {
      type: String,
      enum: ['post', 'like', 'comment', 'follow', 'check-in', 'mint-nft']
    },
    count: {
      type: Number,
      default: 1
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);