const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Compound index để đảm bảo mỗi cặp user-post chỉ được like một lần
LikeSchema.index({ user: 1, postId: 1 }, { unique: true });

// Index riêng để tối ưu truy vấn
LikeSchema.index({ user: 1 });
LikeSchema.index({ postId: 1 });

module.exports = mongoose.model('Like', LikeSchema);