// src/controllers/adminController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const NFTCache = require('../models/NFTCache');
const Task = require('../models/Task');
const CompletedTask = require('../models/CompletedTask');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const analyticsService = require('../services/analyticsService');
const config = require("../configs/config.env");

/**
 * Kiểm tra quyền admin
 * @param {string} address - Địa chỉ ví cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
const isAdmin = (address) => {
  return config.ADMIN_ADDRESSES.includes(address.toLowerCase());
};

/**
 * Middleware kiểm tra quyền admin
 */
exports.checkAdminAccess = (req, res, next) => {
  if (!req.user || !isAdmin(req.user.address)) {
    return res.status(403).json({ error: 'Không có quyền truy cập admin' });
  }
  
  next();
};

/**
 * Lấy thống kê tổng quan hệ thống
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Đếm số lượng users
    const totalUsers = await User.countDocuments({ status: 'active' });
    
    // Người dùng mới trong 7 ngày qua
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newUsers = await User.countDocuments({
      status: 'active',
      createdAt: { $gte: lastWeek }
    });
    
    // Thống kê bài đăng
    const totalPosts = await Post.countDocuments({ status: 'active' });
    const newPosts = await Post.countDocuments({
      status: 'active',
      createdAt: { $gte: lastWeek }
    });
    
    // Thống kê NFT
    const totalNFTs = await NFTCache.countDocuments();
    const listedNFTs = await NFTCache.countDocuments({ forSale: true });
    
    // Thống kê tương tác
    const totalComments = await Comment.countDocuments({ status: 'active' });
    
    // Top người dùng theo điểm
    const topUsers = await User.find({ status: 'active' })
      .sort({ points: -1 })
      .limit(10)
      .select('walletAddress username avatarURI points');
    
    // Subscriptions
    const premiumUsers = await User.countDocuments({
      'subscription.level': { $gt: 1 },
      'subscription.expiration': { $gt: new Date() }
    });
    
    res.status(200).json({
      users: {
        total: totalUsers,
        new: newUsers,
        premium: premiumUsers
      },
      content: {
        posts: totalPosts,
        newPosts,
        comments: totalComments,
        nfts: totalNFTs,
        listedNFTs
      },
      topUsers: topUsers.map(user => ({
        walletAddress: user.walletAddress,
        username: user.username,
        avatarURI: user.avatarURI ? ipfsService.formatIPFSUrl(user.avatarURI) : null,
        points: user.points
      }))
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};

/**
 * Quản lý người dùng - Lấy danh sách
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Xây dựng query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } },
        { ensName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    // Lấy danh sách users
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số users
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      users: users.map(user => ({
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI ? ipfsService.formatIPFSUrl(user.avatarURI) : null,
        socialStats: user.socialStats,
        points: user.points,
        subscription: user.subscription,
        status: user.status,
        createdAt: user.createdAt
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * Cập nhật trạng thái người dùng
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    
    // Cập nhật người dùng
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: { status } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    // Nếu user bị suspend, ẩn tất cả bài đăng của họ
    if (status === 'suspended') {
      await Post.updateMany(
        { author: walletAddress.toLowerCase() },
        { $set: { status: 'hidden' } }
      );
      
      await Comment.updateMany(
        { author: walletAddress.toLowerCase() },
        { $set: { status: 'hidden' } }
      );
    }
    
    // Nếu user được kích hoạt lại, hiện lại bài đăng
    if (status === 'active') {
      await Post.updateMany(
        { author: walletAddress.toLowerCase(), status: 'hidden' },
        { $set: { status: 'active' } }
      );
      
      await Comment.updateMany(
        { author: walletAddress.toLowerCase(), status: 'hidden' },
        { $set: { status: 'active' } }
      );
    }
    
    res.status(200).json({
      message: 'Cập nhật trạng thái người dùng thành công',
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

/**
 * Xác minh người dùng (verified)
 */
exports.verifyUser = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { verified } = req.body;
    
    // Cập nhật người dùng
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: { isVerified: Boolean(verified) } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    // Gửi thông báo cho người dùng nếu được xác minh
    if (verified) {
      // Tạo thông báo
      await Notification.create({
        recipient: walletAddress.toLowerCase(),
        type: 'system',
        content: 'Tài khoản của bạn đã được xác minh!',
        read: false,
        createdAt: new Date()
      });
    }
    
    res.status(200).json({
      message: verified ? 'Xác minh người dùng thành công' : 'Hủy xác minh người dùng thành công',
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
};

/**
 * Quản lý nội dung - Lấy bài đăng cần kiểm duyệt
 */
exports.getModerationPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Xây dựng query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // Lấy danh sách bài đăng
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Lấy thông tin author
    const authorAddresses = [...new Set(posts.map(post => post.author))];
    const authors = await User.find({ walletAddress: { $in: authorAddresses } })
      .select('walletAddress username avatarURI isVerified');
    
    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author;
    });
    
    // Đếm tổng số bài đăng
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      posts: posts.map(post => ({
        _id: post._id,
        content: post.content,
        author: post.author,
        authorDetails: authorsMap[post.author] ? {
          username: authorsMap[post.author].username,
          avatarURI: authorsMap[post.author].avatarURI ? ipfsService.formatIPFSUrl(authorsMap[post.author].avatarURI) : null,
          isVerified: authorsMap[post.author].isVerified
        } : null,
        media: post.media.map(m => ({
          ...m,
          uri: ipfsService.formatIPFSUrl(m.uri)
        })),
        status: post.status,
        stats: post.stats,
        createdAt: post.createdAt
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting moderation posts:', error);
    res.status(500).json({ error: 'Failed to get moderation posts' });
  }
};

/**
 * Cập nhật trạng thái bài đăng
 */
exports.updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    
    // Cập nhật bài đăng
    const post = await Post.findByIdAndUpdate(
      postId,
      { $set: { status } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }
    
    // Gửi thông báo cho người dùng nếu bài đăng bị ẩn/xóa
    if (status !== 'active') {
      // Tạo thông báo
      await Notification.create({
        recipient: post.author,
        type: 'system',
        content: `Bài đăng của bạn đã bị ${status === 'hidden' ? 'ẩn' : 'xóa'} vì vi phạm tiêu chuẩn cộng đồng.`,
        targetType: 'post',
        targetId: postId,
        read: false,
        createdAt: new Date()
      });
    }
    
    res.status(200).json({
      message: 'Cập nhật trạng thái bài đăng thành công',
      post: {
        _id: post._id,
        status: post.status
      }
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ error: 'Failed to update post status' });
  }
};

/**
 * Quản lý nhiệm vụ - Lấy tất cả nhiệm vụ
 */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ type: 1, createdAt: -1 });
    
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
};

/**
 * Tạo nhiệm vụ mới
 */
exports.createTask = async (req, res) => {
  try {
    const { name, description, type, rewardPoints, rewardTokens, requirements } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Tạo nhiệm vụ mới
    const newTask = new Task({
      name,
      description,
      type: type || 'daily',
      rewardPoints: parseInt(rewardPoints) || 0,
      rewardTokens: parseFloat(rewardTokens) || 0,
      requirements,
      isActive: true,
      createdAt: new Date()
    });
    
    await newTask.save();
    
    res.status(201).json({
      message: 'Tạo nhiệm vụ thành công',
      task: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Cập nhật nhiệm vụ
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { name, description, type, rewardPoints, rewardTokens, requirements, isActive } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Cập nhật nhiệm vụ
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          name,
          description,
          type,
          rewardPoints: parseInt(rewardPoints),
          rewardTokens: parseFloat(rewardTokens),
          requirements,
          isActive: Boolean(isActive),
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
    }
    
    res.status(200).json({
      message: 'Cập nhật nhiệm vụ thành công',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Xóa nhiệm vụ
 */
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Xóa nhiệm vụ
    const task = await Task.findByIdAndDelete(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
    }
    
    // Xóa tất cả completed tasks liên quan
    await CompletedTask.deleteMany({ taskId });
    
    res.status(200).json({
      message: 'Xóa nhiệm vụ thành công'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * Reset nhiệm vụ hàng ngày
 */
exports.resetDailyTasks = async (req, res) => {
  try {
    // Xóa tất cả completed tasks của ngày hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await CompletedTask.deleteMany({
      completedForDate: {
        $gte: today
      }
    });
    
    res.status(200).json({
      message: 'Reset nhiệm vụ hàng ngày thành công',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error resetting daily tasks:', error);
    res.status(500).json({ error: 'Failed to reset daily tasks' });
  }
};

/**
 * Tạo token DX cho người dùng (mint)
 */
exports.mintDXTokens = async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;
    
    if (!walletAddress || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Địa chỉ ví và số lượng token là bắt buộc' });
    }
    
    // Mint token
    const privateKey = process.env.PRIVATE_KEY;
    await blockchainService.mintDXTokens(
      privateKey,
      walletAddress,
      amount.toString()
    );
    
    res.status(200).json({
      message: `Mint ${amount} DX tokens thành công cho ${walletAddress}`
    });
  } catch (error) {
    console.error('Error minting DX tokens:', error);
    res.status(500).json({ error: 'Failed to mint DX tokens' });
  }
};

/**
 * Tạo thông báo hệ thống cho tất cả người dùng
 */
exports.createSystemAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }
    
    // Lấy tất cả người dùng active
    const users = await User.find({ status: 'active' }).select('walletAddress');
    
    // Tạo thông báo cho từng người dùng
    const notifications = users.map(user => ({
      recipient: user.walletAddress,
      type: 'system',
      content: `${title}: ${content}`,
      read: false,
      createdAt: new Date()
    }));
    
    // Lưu thông báo
    await Notification.insertMany(notifications);
    
    res.status(200).json({
      message: 'Tạo thông báo hệ thống thành công',
      recipientCount: users.length
    });
  } catch (error) {
    console.error('Error creating system announcement:', error);
    res.status(500).json({ error: 'Failed to create system announcement' });
  }
};

/**
 * Lấy thống kê người dùng theo thời gian
 */
exports.getUsersOverTime = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy = {};
    let format = '';
    
    // Xác định nhóm và format theo period
    if (period === 'day') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      format = '%Y-%m-%d';
    } else if (period === 'week') {
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      format = '%Y-W%V';
    } else {
      // month
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      format = '%Y-%m';
    }
    
    // Thực hiện aggregation
    const result = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: format,
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month' || 1,
                  day: '$_id.day' || 1
                }
              }
            }
          },
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.status(200).json({
      period,
      data: result
    });
  } catch (error) {
    console.error('Error getting users over time:', error);
    res.status(500).json({ error: 'Failed to get users over time' });
  }
};

/**
 * Cập nhật các cấu hình hệ thống
 */
exports.updateSystemConfig = async (req, res) => {
  try {
    // Tạo file config mới
    // Lưu ý: Trong thực tế, bạn sẽ muốn lưu cấu hình vào database
    // thay vì ghi đè file
    
    res.status(200).json({
      message: 'Cập nhật cấu hình hệ thống thành công',
      // Trả về cấu hình mới
      config: {
        // Lọc các thông tin nhạy cảm
        ...config,
        JWT_SECRET: undefined,
        JWT_REFRESH_SECRET: undefined,
        PRIVATE_KEY: undefined,
        ENCRYPTION_KEY: undefined
      }
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Failed to update system config' });
  }
};

/**
 * Lấy log hệ thống
 */
exports.getSystemLogs = async (req, res) => {
  try {
    const { type = 'all', limit = 100 } = req.query;
    
    // Trong thực tế, bạn sẽ đọc log từ file hoặc database
    // Đây chỉ là mô phỏng
    const logs = [
      { timestamp: new Date(), level: 'info', message: 'Server started' },
      { timestamp: new Date(), level: 'error', message: 'Database connection error' },
      // ...
    ];
    
    // Lọc theo type
    let filteredLogs = logs;
    if (type !== 'all') {
      filteredLogs = logs.filter(log => log.level === type);
    }
    
    // Giới hạn số lượng
    filteredLogs = filteredLogs.slice(0, parseInt(limit));
    
    res.status(200).json({
      logs: filteredLogs
    });
  } catch (error) {
    console.error('Error getting system logs:', error);
    res.status(500).json({ error: 'Failed to get system logs' });
  }
};

/**
 * Force sync dữ liệu từ blockchain
 */
exports.forceBlockchainSync = async (req, res) => {
  try {
    // Trigger sync service
    // Giả sử bạn có một service để đồng bộ dữ liệu từ blockchain
    const syncService = require('../services/syncService');
    
    // Bắt đầu đồng bộ
    await syncService.syncNFTEvents();
    await syncService.syncSubscriptionData();
    
    res.status(200).json({
      message: 'Đồng bộ dữ liệu blockchain thành công'
    });
  } catch (error) {
    console.error('Error syncing blockchain data:', error);
    res.status(500).json({ error: 'Failed to sync blockchain data' });
  }
};

module.exports = exports;