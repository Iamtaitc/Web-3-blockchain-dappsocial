const mongoose = require('mongoose');

const NFTCacheSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  
  creator: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  owner: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  tokenURI: String,
  
  metadata: {
    name: String,
    description: String,
    image: String,
    attributes: [{
      trait_type: String,
      value: mongoose.Schema.Types.Mixed
    }]
  },
  
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'other'],
    default: 'image'
  },
  
  // Marketplace
  forSale: {
    type: Boolean,
    default: false,
    index: true
  },
  
  price: String,
  
  royaltyPercent: Number,
  
  // Transactions
  transactions: [{
    type: {
      type: String,
      enum: ['mint', 'transfer', 'list', 'unlist', 'sale']
    },
    from: String,
    to: String,
    price: String,
    timestamp: Date,
    txHash: String
  }],
  
  // Stats
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  
  // Collection info
  collectionId: {
    type: String,
    index: true
  },
  
  // Timestamps
  mintedAt: Date,
  lastUpdated: { type: Date, default: Date.now }
});

// Indexes
NFTCacheSchema.index({ 'metadata.name': 'text', 'metadata.description': 'text' });
NFTCacheSchema.index({ forSale: 1, price: 1 });
NFTCacheSchema.index({ collectionId: 1, tokenId: 1 });
NFTCacheSchema.index({ mintedAt: -1 });
NFTCacheSchema.index({ likeCount: -1 });

module.exports = mongoose.model('NFTCache', NFTCacheSchema);