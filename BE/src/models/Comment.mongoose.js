const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  
  author: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  content: String,
  contentURI: String, // IPFS URI nếu comment dài
  
  // Hỗ trợ comment đa cấp
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  
  depth: { type: Number, default: 0 },
  
  // Media
  media: [{
    type: { type: String, enum: ['image', 'video', 'audio'] },
    uri: String
  }],
  
  // Stats
  likeCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ postId: 1, parentId: 1 });
CommentSchema.index({ content: 'text' });

module.exports = mongoose.model('Comment', CommentSchema);