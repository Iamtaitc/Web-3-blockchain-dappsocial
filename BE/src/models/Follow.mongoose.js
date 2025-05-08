const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
  follower: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  following: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  createdAt: { type: Date, default: Date.now }
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index riêng để tối ưu truy vấn
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });

module.exports = mongoose.model('Follow', FollowSchema);