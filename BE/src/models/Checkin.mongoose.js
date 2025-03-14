const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  date: {
    type: Date,
    required: true
  },
  
  streak: {
    type: Number,
    default: 1
  },
  
  pointsEarned: {
    type: Number,
    default: 5
  },
  
  tokensEarned: {
    type: Number,
    default: 0
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Compound index
CheckInSchema.index({ user: 1, date: 1 }, { unique: true });

// Index riêng
CheckInSchema.index({ user: 1, createdAt: -1 });
CheckInSchema.index({ date: 1 });

module.exports = mongoose.model('CheckIn', CheckInSchema);