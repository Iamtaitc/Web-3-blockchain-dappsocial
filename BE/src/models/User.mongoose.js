const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Blockchain info
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Profile
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  ensName: String,
  bio: String,
  metadataURI: String, // IPFS URI cho full metadata
  avatarURI: String,   // IPFS URI cho avatar
  coverURI: String,    // IPFS URI cho cover image
  
  // Auth
  nonce: String,
  nonceExpiry: Date,
  refreshToken: String,
  
  // Social stats (cache)
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  
  // Rewards
  points: { type: Number, default: 0 },
  lastCheckIn: Date,
  checkInStreak: { type: Number, default: 0 },
  
  // Subscription (cache from blockchain)
  subscription: {
    level: { type: Number, default: 1 },
    expiration: Date
  },
  
  // Status
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
UserSchema.virtual('isSubscribed').get(function() {
  if (!this.subscription || !this.subscription.expiration) return false;
  return this.subscription.expiration > new Date();
});

// Indexes
UserSchema.index({ username: 'text', bio: 'text' });
UserSchema.index({ points: -1 });
UserSchema.index({ 'subscription.level': 1 });

module.exports = mongoose.model('User', UserSchema);