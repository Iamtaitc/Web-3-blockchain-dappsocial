// src/services/ReportService.js
const {Report, Post, Comment, User, NFTCache} = require('../models/index');

/**
 * Service xử lý các chức năng báo cáo
 */
class ReportService {
  /**
   * Tạo báo cáo mới
   * @param {String} targetType - Loại target (post, comment, user, nft)
   * @param {String} targetId - ID của target
   * @param {String} reason - Lý do báo cáo
   * @param {String} details - Chi tiết báo cáo
   * @param {String} reporterAddress - Địa chỉ của người báo cáo
   * @returns {Object} Kết quả tạo báo cáo
   */
  async createReport(targetType, targetId, reason, details, reporterAddress) {
    try {
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
      }

      if (!targetExists) {
        return {
          success: false,
          status: 404,
          message: 'Không tìm thấy target'
        };
      }

      // Người dùng không thể báo cáo nội dung của chính mình
      if (targetOwner && targetOwner.toLowerCase() === reporterAddress.toLowerCase()) {
        return {
          success: false,
          status: 400,
          message: 'Bạn không thể báo cáo nội dung của chính mình'
        };
      }

      // Kiểm tra xem người dùng đã báo cáo target này chưa
      const existingReport = await Report.findOne({
        reporter: reporterAddress.toLowerCase(),
        targetType,
        targetId
      });

      if (existingReport) {
        return {
          success: false,
          status: 400,
          message: 'Bạn đã báo cáo nội dung này rồi'
        };
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
      await this.updateReportCount(targetType, targetId);

      return {
        success: true,
        status: 201,
        message: 'Báo cáo đã được gửi thành công',
        data: {
          reportId: newReport._id
        }
      };
    } catch (error) {
      console.error('Error creating report:', error);
      return {
        success: false,
        status: 500,
        message: 'Lỗi khi tạo báo cáo',
        error: error.message
      };
    }
  }

  /**
   * Lấy danh sách các báo cáo của người dùng hiện tại
   * @param {String} walletAddress - Địa chỉ ví của người dùng
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @returns {Object} Kết quả lấy danh sách báo cáo
   */
  async getUserReports(walletAddress, page, limit) {
    try {
      const skip = (page - 1) * limit;

      // Lấy báo cáo
      const reports = await Report.find({ reporter: walletAddress.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy thông tin chi tiết của target
      const reportsWithDetails = await Promise.all(reports.map(async (report) => {
        const reportObj = report.toObject();
        reportObj.targetDetails = await this.getTargetDetails(report.targetType, report.targetId);
        return reportObj;
      }));

      // Đếm tổng số báo cáo
      const total = await Report.countDocuments({ reporter: walletAddress.toLowerCase() });

      return {
        success: true,
        status: 200,
        message: 'Lấy danh sách báo cáo thành công',
        data: {
          reports: reportsWithDetails,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Error getting user reports:', error);
      return {
        success: false,
        status: 500,
        message: 'Lỗi khi lấy danh sách báo cáo',
        error: error.message
      };
    }
  }

  /**
   * Lấy danh sách tất cả các báo cáo (admin only)
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} status - Trạng thái báo cáo
   * @param {String} targetType - Loại target
   * @returns {Object} Kết quả lấy danh sách báo cáo
   */
  async getAllReports(page, limit, status, targetType) {
    try {
      const skip = (page - 1) * limit;

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
        reportObj.targetDetails = await this.getTargetDetails(report.targetType, report.targetId);
        
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

      return {
        success: true,
        status: 200,
        message: 'Lấy danh sách báo cáo thành công',
        data: {
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
        }
      };
    } catch (error) {
      console.error('Error getting all reports:', error);
      return {
        success: false,
        status: 500,
        message: 'Lỗi khi lấy danh sách báo cáo',
        error: error.message
      };
    }
  }

  /**
   * Cập nhật trạng thái báo cáo (admin only)
   * @param {String} reportId - ID của báo cáo
   * @param {String} status - Trạng thái mới
   * @param {String} adminComment - Ghi chú của admin
   * @param {String} action - Hành động (hide, delete, ban)
   * @param {String} adminAddress - Địa chỉ của admin
   * @returns {Object} Kết quả cập nhật trạng thái
   */
  async updateReportStatus(reportId, status, adminComment, action, adminAddress) {
    try {
      // Lấy báo cáo
      const report = await Report.findById(reportId);
      if (!report) {
        return {
          success: false,
          status: 404,
          message: 'Không tìm thấy báo cáo'
        };
      }

      // Cập nhật trạng thái
      report.status = status;
      report.adminComment = adminComment;
      report.resolvedAt = status === 'pending' ? null : new Date();
      report.resolvedBy = status === 'pending' ? null : adminAddress;
      await report.save();

      // Thực hiện hành động nếu có (hide, delete, ban)
      if (status === 'resolved' && action) {
        await this.executeModAction(report.targetType, report.targetId, action, adminAddress);
      }

      return {
        success: true,
        status: 200,
        message: 'Cập nhật trạng thái báo cáo thành công',
        data: {
          _id: report._id,
          status: report.status,
          resolvedAt: report.resolvedAt
        }
      };
    } catch (error) {
      console.error('Error updating report status:', error);
      return {
        success: false,
        status: 500,
        message: 'Lỗi khi cập nhật trạng thái báo cáo',
        error: error.message
      };
    }
  }

  /**
   * Helper để lấy thông tin chi tiết của target
   * @param {String} targetType - Loại target (post, comment, user, nft)
   * @param {String} targetId - ID của target
   * @returns {Object} Thông tin chi tiết của target
   */
  async getTargetDetails(targetType, targetId) {
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
          const nft = await NFTCache.findOne({ tokenId: targetId });
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
   * @param {String} targetType - Loại target (post, comment, user, nft)
   * @param {String} targetId - ID của target
   */
  async updateReportCount(targetType, targetId) {
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
            { tokenId: targetId },
            { $set: { reportCount } }
          );
          break;
      }

      // Tự động ẩn nội dung nếu số lượng báo cáo vượt ngưỡng
      const AUTO_HIDE_THRESHOLD = 5; // Có thể cấu hình trong config
      if (reportCount >= AUTO_HIDE_THRESHOLD) {
        await this.autoHideContent(targetType, targetId);
      }
    } catch (error) {
      console.error('Error updating report count:', error);
    }
  }

  /**
   * Tự động ẩn nội dung khi số lượng báo cáo vượt ngưỡng
   * @param {String} targetType - Loại target (post, comment, user, nft)
   * @param {String} targetId - ID của target
   */
  async autoHideContent(targetType, targetId) {
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
   * @param {String} targetType - Loại target (post, comment, user, nft)
   * @param {String} targetId - ID của target
   * @param {String} action - Hành động (hide, delete, ban)
   * @param {String} adminAddress - Địa chỉ của admin
   */
  async executeModAction(targetType, targetId, action, adminAddress) {
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
              { tokenId: targetId },
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
}

module.exports = new ReportService();