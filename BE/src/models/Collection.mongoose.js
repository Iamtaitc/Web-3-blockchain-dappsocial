// src/models/Collection.js
const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  category: {
    type: String,
    enum: ['art', 'photography', 'gaming', 'music', 'sports', 'virtual worlds', 'collectibles', 'other'],
    default: 'other'
  },
  
  creator: {
    type: String, // Địa chỉ ví
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  bannerURI: {
    type: String, // IPFS URI
    trim: true
  },
  
  thumbnailURI: {
    type: String, // IPFS URI
    trim: true
  },
  
  nftCount: {
    type: Number,
    default: 0
  },
  
  floorPrice: {
    type: String,
    default: '0'
  },
  
  volume: {
    type: String,
    default: '0'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
CollectionSchema.index({ creator: 1 });
CollectionSchema.index({ nftCount: -1 });
CollectionSchema.index({ createdAt: -1 });
CollectionSchema.index({ category: 1 });
CollectionSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Collection', CollectionSchema);