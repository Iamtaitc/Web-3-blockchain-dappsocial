const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Content được lưu cả ở MongoDB (preview) và IPFS (full)
  content: String,
  contentURI: String, // IPFS URI
  
  // Media
  media: [{
    type: { type: String, enum: ['image', 'video', 'audio'] },
    uri: String, // IPFS URI
    mimeType: String
  }],
  
  // Metadata
  tags: [String],
  mentions: [String],
  
  // Stats
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
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
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ content: 'text', tags: 'text' });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likeCount: -1 });
PostSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', PostSchema);