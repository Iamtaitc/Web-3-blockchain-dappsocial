const mongoose = require('mongoose');

const CompletedTaskSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  
  // Reset daily/weekly tasks
  completedForDate: {
    type: Date,
    required: true
  },
  
  pointsEarned: {
    type: Number,
    default: 0
  },
  
  tokensEarned: {
    type: Number,
    default: 0
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Compound index
CompletedTaskSchema.index({ 
  user: 1, 
  taskId: 1, 
  completedForDate: 1 
}, { unique: true });

// Index riêng
CompletedTaskSchema.index({ user: 1, createdAt: -1 });
CompletedTaskSchema.index({ completedForDate: 1 });

module.exports = mongoose.model('CompletedTask', CompletedTaskSchema);