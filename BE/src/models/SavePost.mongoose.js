const mongoose = require('mongoose');

const SavedPostSchema = new mongoose.Schema({
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

// Compound index
SavedPostSchema.index({ user: 1, postId: 1 }, { unique: true });

// Index riêng
SavedPostSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedPost', SavedPostSchema);