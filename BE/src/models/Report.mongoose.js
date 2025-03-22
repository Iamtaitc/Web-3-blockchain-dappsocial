// src/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  // Người báo cáo
  reporter: {
    type: String, // Địa chỉ ví
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Loại target bị báo cáo
  targetType: {
    type: String,
    enum: ['post', 'comment', 'user', 'nft'],
    required: true
  },
  
  // ID của target
  targetId: {
    type: String,
    required: true
  },
  
  // Lý do báo cáo
  reason: {
    type: String,
    enum: [
      'spam', 
      'harassment', 
      'violence', 
      'nudity', 
      'hate_speech', 
      'misinformation',
      'copyright', 
      'scam', 
      'impersonation',
      'other'
    ],
    required: true
  },
  
  // Chi tiết báo cáo (tùy chọn)
  details: {
    type: String,
    maxlength: 1000
  },
  
  // Trạng thái báo cáo
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Bình luận của admin khi xử lý báo cáo
  adminComment: {
    type: String
  },
  
  // Thời điểm xử lý báo cáo
  resolvedAt: {
    type: Date
  },
  
  // Admin đã xử lý báo cáo
  resolvedBy: {
    type: String, // Địa chỉ ví của admin
    lowercase: true,
    trim: true
  },
  
  // Thời điểm tạo báo cáo
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Compound index để đảm bảo mỗi người dùng chỉ có thể báo cáo mỗi target một lần
ReportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index cho tìm kiếm và truy vấn
ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);