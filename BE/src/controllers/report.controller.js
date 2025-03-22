// src/controllers/reportController.js
const {Report, Post, Comment, User, NFTCache } = require('../models/Report');
const { validationResult } = require('express-validator');

/**
 * Tạo báo cáo mới
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createReport = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetType, targetId, reason, details } = req.body;
    const reporterAddress = req.user.address;

    // Kiểm tra xem target có tồn tại không
    let targetExists = false;
    let targetOwner = null;

    switch (targetType) {
      case 'post':
        const post = await Post.findOne({ _id: targetId });
        targetExists = !!post;
        targetOwner = post?.author;
        break;
      case 'comment':
        const comment = await Comment.findOne({ _id: targetId });
        targetExists = !!comment;
        targetOwner = comment?.author;
        break;
      case 'user':
        const user = await User.findOne({ walletAddress: targetId.toLowerCase() });
        targetExists = !!user;
        targetOwner = user?.walletAddress;
        break;
      case 'nft':
        const nft = await NFTCache.findOne({ tokenId: targetId });
        targetExists = !!nft;
        targetOwner = nft?.creator;
        break;
      default:
        return res.status(400).json({ error: 'Invalid target type' });
    }

    if (!targetExists) {
      return res.status(404).json({ error: 'Target not found' });
    }

    // Người dùng không thể báo cáo nội dung của chính mình
    if (targetOwner && targetOwner.toLowerCase() === reporterAddress.toLowerCase()) {
      return res.status(400).json({ error: 'You cannot report your own content' });
    }

    // Kiểm tra xem người dùng đã báo cáo target này chưa
    const existingReport = await Report.findOne({
      reporter: reporterAddress.toLowerCase(),
      targetType,
      targetId
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this content' });
    }

    // Tạo báo cáo mới
    const newReport = new Report({
      reporter: reporterAddress.toLowerCase(),
      targetType,
      targetId,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date()
    });

    await newReport.save();

    // Cập nhật số lượng báo cáo của target
    await updateReportCount(targetType, targetId);

    res.status(201).json({
      message: 'Report submitted successfully',
      reportId: newReport._id
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lấy danh sách các báo cáo của người dùng hiện tại
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserReports = async (req, res) => {
  try {
    const walletAddress = req.user.address;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy báo cáo
    const reports = await Report.find({ reporter: walletAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Lấy thông tin chi tiết của target
    const reportsWithDetails = await Promise.all(reports.map(async (report) => {
      const reportObj = report.toObject();
      reportObj.targetDetails = await getTargetDetails(report.targetType, report.targetId);
      return reportObj;
    }));

    // Đếm tổng số báo cáo
    const total = await Report.countDocuments({ reporter: walletAddress.toLowerCase() });

    res.status(200).json({
      reports: reportsWithDetails,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lấy danh sách tất cả các báo cáo (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllReports = async (req, res) => {
  try {
    // Kiểm tra người dùng có phải là admin không
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'pending'; // pending, resolved, rejected
    const targetType = req.query.targetType; // post, comment, user, nft

    // Xây dựng query
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    if (targetType) {
      query.targetType = targetType;
    }

    // Lấy báo cáo
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Lấy thông tin chi tiết của target và reporter
    const reportsWithDetails = await Promise.all(reports.map(async (report) => {
      const reportObj = report.toObject();
      reportObj.targetDetails = await getTargetDetails(report.targetType, report.targetId);
      
      // Lấy thông tin reporter
      const reporter = await User.findOne({ walletAddress: report.reporter });
      if (reporter) {
        reportObj.reporterDetails = {
          username: reporter.username,
          walletAddress: reporter.walletAddress
        };
      }
      
      return reportObj;
    }));

    // Đếm tổng số báo cáo
    const total = await Report.countDocuments(query);

    res.status(200).json({
      reports: reportsWithDetails,
      counts: {
        pending: await Report.countDocuments({ status: 'pending' }),
        resolved: await Report.countDocuments({ status: 'resolved' }),
        rejected: await Report.countDocuments({ status: 'rejected' })
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Cập nhật trạng thái báo cáo (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateReportStatus = async (req, res) => {
  try {
    // Kiểm tra người dùng có phải là admin không
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const { reportId } = req.params;
    const { status, adminComment, action } = req.body;

    // Validate input
    if (!['pending', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Lấy báo cáo
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Cập nhật trạng thái
    report.status = status;
    report.adminComment = adminComment;
    report.resolvedAt = status === 'pending' ? null : new Date();
    report.resolvedBy = status === 'pending' ? null : req.user.address;
    await report.save();

    // Thực hiện hành động nếu có (hide, delete, ban)
    if (status === 'resolved' && action) {
      await executeModAction(report.targetType, report.targetId, action, req.user.address);
    }

    res.status(200).json({
      message: 'Report status updated successfully',
      report: {
        _id: report._id,
        status: report.status,
        resolvedAt: report.resolvedAt
      }
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Helper để lấy thông tin chi tiết của target
 * @param {string} targetType - Loại target (post, comment, user, nft)
 * @param {string} targetId - ID của target
 * @returns {Object} Thông tin chi tiết của target
 */
async function getTargetDetails(targetType, targetId) {
  try {
    switch (targetType) {
      case 'post':
        const post = await Post.findOne({ _id: targetId });
        if (!post) return { notFound: true };
        return {
          content: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
          author: post.author,
          createdAt: post.createdAt
        };
      case 'comment':
        const comment = await Comment.findOne({ _id: targetId });
        if (!comment) return { notFound: true };
        return {
          content: comment.content?.substring(0, 100) + (comment.content?.length > 100 ? '...' : ''),
          author: comment.author,
          postId: comment.postId,
          createdAt: comment.createdAt
        };
      case 'user':
        const user = await User.findOne({ walletAddress: targetId.toLowerCase() });
        if (!user) return { notFound: true };
        return {
          username: user.username,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt
        };
      case 'nft':
        const nft = await NFTCache.findOne({ tokenId });
        if (!nft) return { notFound: true };
        return {
          name: nft.metadata?.name,
          creator: nft.creator,
          owner: nft.owner,
          tokenId: nft.tokenId
        };
      default:
        return { notFound: true };
    }
  } catch (error) {
    console.error('Error getting target details:', error);
    return { error: true };
  }
}

/**
 * Helper để cập nhật số lượng báo cáo của target
 * @param {string} targetType - Loại target (post, comment, user, nft)
 * @param {string} targetId - ID của target
 */
async function updateReportCount(targetType, targetId) {
  try {
    // Đếm số lượng báo cáo
    const reportCount = await Report.countDocuments({
      targetType,
      targetId,
      status: 'pending'
    });

    // Cập nhật vào target tương ứng
    switch (targetType) {
      case 'post':
        await Post.updateOne(
          { _id: targetId },
          { $set: { reportCount } }
        );
        break;
      case 'comment':
        await Comment.updateOne(
          { _id: targetId },
          { $set: { reportCount } }
        );
        break;
      case 'user':
        await User.updateOne(
          { walletAddress: targetId.toLowerCase() },
          { $set: { reportCount } }
        );
        break;
      case 'nft':
        await NFTCache.updateOne(
          { tokenId },
          { $set: { reportCount } }
        );
        break;
    }

    // Tự động ẩn nội dung nếu số lượng báo cáo vượt ngưỡng
    const AUTO_HIDE_THRESHOLD = 5; // Có thể cấu hình trong config
    if (reportCount >= AUTO_HIDE_THRESHOLD) {
      await autoHideContent(targetType, targetId);
    }
  } catch (error) {
    console.error('Error updating report count:', error);
  }
}

/**
 * Tự động ẩn nội dung khi số lượng báo cáo vượt ngưỡng
 * @param {string} targetType - Loại target (post, comment, user, nft)
 * @param {string} targetId - ID của target
 */
async function autoHideContent(targetType, targetId) {
  try {
    switch (targetType) {
      case 'post':
        await Post.updateOne(
          { _id: targetId },
          { $set: { status: 'hidden', hiddenReason: 'auto-hidden due to reports' } }
        );
        break;
      case 'comment':
        await Comment.updateOne(
          { _id: targetId },
          { $set: { status: 'hidden', hiddenReason: 'auto-hidden due to reports' } }
        );
        break;
      // Các trường hợp khác có thể tự định nghĩa hành động phù hợp
    }
  } catch (error) {
    console.error('Error auto-hiding content:', error);
  }
}

/**
 * Thực hiện hành động moderator
 * @param {string} targetType - Loại target (post, comment, user, nft)
 * @param {string} targetId - ID của target
 * @param {string} action - Hành động (hide, delete, ban)
 * @param {string} adminAddress - Địa chỉ của admin
 */
async function executeModAction(targetType, targetId, action, adminAddress) {
  try {
    switch (action) {
      case 'hide':
        if (targetType === 'post') {
          await Post.updateOne(
            { _id: targetId },
            { 
              $set: { 
                status: 'hidden', 
                hiddenReason: 'hidden by admin', 
                hiddenBy: adminAddress,
                hiddenAt: new Date()
              } 
            }
          );
        } else if (targetType === 'comment') {
          await Comment.updateOne(
            { _id: targetId },
            { 
              $set: { 
                status: 'hidden', 
                hiddenReason: 'hidden by admin',
                hiddenBy: adminAddress,
                hiddenAt: new Date()
              } 
            }
          );
        }
        break;
        
      case 'delete':
        if (targetType === 'post') {
          await Post.updateOne(
            { _id: targetId },
            { 
              $set: { 
                status: 'deleted', 
                deletedReason: 'deleted by admin',
                deletedBy: adminAddress,
                deletedAt: new Date() 
              } 
            }
          );
        } else if (targetType === 'comment') {
          await Comment.updateOne(
            { _id: targetId },
            { 
              $set: { 
                status: 'deleted', 
                deletedReason: 'deleted by admin',
                deletedBy: adminAddress,
                deletedAt: new Date()
              } 
            }
          );
        } else if (targetType === 'nft') {
          // NFT không thể xóa nhưng có thể ẩn khỏi marketplace
          await NFTCache.updateOne(
            { tokenId },
            { 
              $set: { 
                status: 'hidden',
                hiddenReason: 'hidden by admin',
                hiddenBy: adminAddress,
                hiddenAt: new Date()
              } 
            }
          );
        }
        break;
        
      case 'ban':
        if (targetType === 'user') {
          await User.updateOne(
            { walletAddress: targetId.toLowerCase() },
            { 
              $set: { 
                status: 'suspended', 
                suspendedReason: 'banned by admin',
                suspendedBy: adminAddress,
                suspendedAt: new Date()
              } 
            }
          );
        }
        break;
    }
  } catch (error) {
    console.error('Error executing mod action:', error);
  }
}

module.exports = {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus
};