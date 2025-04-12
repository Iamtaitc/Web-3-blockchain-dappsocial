// src/services/AdminService.js
const {
  User,
  Post,
  Comment,
  NFTCache,
  Task,
  CompletedTask,
  Notification,
} = require("../models/index");
const blockchainService = require("./blockchain.services");
const IPFSService = require("./ipfs.services");
const config = require("../configs/config.env");

/**
 * Service xử lý các chức năng quản trị
 */
class AdminService {
  /**
   * Lấy thống kê tổng quan hệ thống
   * @returns {Object} Kết quả thống kê
   */
  async getDashboardStats() {
    try {
      // Đếm số lượng users
      const totalUsers = await User.countDocuments({ status: "active" });

      // Người dùng mới trong 7 ngày qua
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const newUsers = await User.countDocuments({
        status: "active",
        createdAt: { $gte: lastWeek },
      });

      // Thống kê bài đăng
      const totalPosts = await Post.countDocuments({ status: "active" });
      const newPosts = await Post.countDocuments({
        status: "active",
        createdAt: { $gte: lastWeek },
      });

      // Thống kê NFT
      const totalNFTs = await NFTCache.countDocuments();
      const listedNFTs = await NFTCache.countDocuments({ forSale: true });

      // Thống kê tương tác
      const totalComments = await Comment.countDocuments({ status: "active" });

      // Top người dùng theo điểm
      const topUsers = await User.find({ status: "active" })
        .sort({ points: -1 })
        .limit(10)
        .select("walletAddress username avatarURI points");

      // Subscriptions
      const premiumUsers = await User.countDocuments({
        "subscription.level": { $gt: 1 },
        "subscription.expiration": { $gt: new Date() },
      });

      const formattedTopUsers = topUsers.map((user) => ({
        walletAddress: user.walletAddress,
        username: user.username,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        points: user.points,
      }));

      const stats = {
        users: {
          total: totalUsers,
          new: newUsers,
          premium: premiumUsers,
        },
        content: {
          posts: totalPosts,
          newPosts,
          comments: totalComments,
          nfts: totalNFTs,
          listedNFTs,
        },
        topUsers: formattedTopUsers,
      };

      return {
        success: true,
        status: 200,
        message: "Lấy thống kê dashboard thành công",
        data: stats,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy thống kê dashboard",
        error: error.message,
      };
    }
  }

  /** 
   * Quản lý người dùng - Lấy danh sách
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} search - Từ khóa tìm kiếm
   * @param {String} status - Trạng thái người dùng
   * @returns {Object} Kết quả lấy danh sách
   */
  async getUsers(page, limit, search, status) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query
      const query = {};

      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { walletAddress: { $regex: search, $options: "i" } },
          { ensName: { $regex: search, $options: "i" } },
        ];
      }

      if (status) {
        query.status = status;
      }

      // Lấy danh sách users
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Đếm tổng số users
      const total = await User.countDocuments(query);

      const formattedUsers = users.map((user) => ({
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI
          ? IPFSService.formatIPFSUrl(user.avatarURI)
          : null,
        socialStats: user.socialStats,
        points: user.points,
        subscription: user.subscription,
        status: user.status,
        createdAt: user.createdAt,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách người dùng thành công",
        data: {
          users: formattedUsers,
          pagination: {
            total,
            page: page,
            limit: limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting users:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái người dùng
   * @param {String} walletAddress - Địa chỉ ví
   * @param {String} status - Trạng thái mới
   * @returns {Object} Kết quả cập nhật
   */
  async updateUserStatus(walletAddress, status) {
    try {
      // Cập nhật người dùng
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { $set: { status } },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      // Nếu user bị suspend, ẩn tất cả bài đăng của họ
      if (status === "suspended") {
        await Post.updateMany(
          { author: walletAddress.toLowerCase() },
          { $set: { status: "hidden" } }
        );

        await Comment.updateMany(
          { author: walletAddress.toLowerCase() },
          { $set: { status: "hidden" } }
        );
      }

      // Nếu user được kích hoạt lại, hiện lại bài đăng
      if (status === "active") {
        await Post.updateMany(
          { author: walletAddress.toLowerCase(), status: "hidden" },
          { $set: { status: "active" } }
        );

        await Comment.updateMany(
          { author: walletAddress.toLowerCase(), status: "hidden" },
          { $set: { status: "active" } }
        );
      }

      return {
        success: true,
        status: 200,
        message: "Cập nhật trạng thái người dùng thành công",
        data: {
          walletAddress: user.walletAddress,
          username: user.username,
          status: user.status,
        },
      };
    } catch (error) {
      console.error("Error updating user status:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật trạng thái người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Xác minh người dùng (verified)
   * @param {String} walletAddress - Địa chỉ ví
   * @param {Boolean} verified - Trạng thái xác minh
   * @returns {Object} Kết quả xác minh
   */
  async verifyUser(walletAddress, verified) {
    try {
      // Cập nhật người dùng
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { $set: { isVerified: verified } },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy người dùng",
        };
      }

      // Gửi thông báo cho người dùng nếu được xác minh
      if (verified) {
        // Tạo thông báo
        await Notification.create({
          recipient: walletAddress.toLowerCase(),
          type: "system",
          content: "Tài khoản của bạn đã được xác minh!",
          read: false,
          createdAt: new Date(),
        });
      }

      return {
        success: true,
        status: 200,
        message: verified
          ? "Xác minh người dùng thành công"
          : "Hủy xác minh người dùng thành công",
        data: {
          walletAddress: user.walletAddress,
          username: user.username,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      console.error("Error verifying user:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xác minh người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Quản lý nội dung - Lấy bài đăng cần kiểm duyệt
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} status - Trạng thái bài đăng
   * @returns {Object} Kết quả lấy danh sách
   */
  async getModerationPosts(page, limit, status) {
    try {
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
        .limit(limit);

      // Lấy thông tin author
      const authorAddresses = [...new Set(posts.map((post) => post.author))];
      const authors = await User.find({
        walletAddress: { $in: authorAddresses },
      }).select("walletAddress username avatarURI isVerified");

      const authorsMap = {};
      authors.forEach((author) => {
        authorsMap[author.walletAddress] = author;
      });

      // Đếm tổng số bài đăng
      const total = await Post.countDocuments(query);

      const formattedPosts = posts.map((post) => ({
        _id: post._id,
        content: post.content,
        author: post.author,
        authorDetails: authorsMap[post.author]
          ? {
              username: authorsMap[post.author].username,
              avatarURI: authorsMap[post.author].avatarURI
                ? IPFSService.formatIPFSUrl(authorsMap[post.author].avatarURI)
                : null,
              isVerified: authorsMap[post.author].isVerified,
            }
          : null,
        media: post.media.map((m) => ({
          ...m,
          uri: IPFSService.formatIPFSUrl(m.uri),
        })),
        status: post.status,
        stats: post.stats,
        createdAt: post.createdAt,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách bài đăng thành công",
        data: {
          posts: formattedPosts,
          pagination: {
            total,
            page: page,
            limit: limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting moderation posts:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách bài đăng",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái bài đăng
   * @param {String} postId - ID bài đăng
   * @param {String} status - Trạng thái mới
   * @returns {Object} Kết quả cập nhật
   */
  async updatePostStatus(postId, status) {
    try {
      // Cập nhật bài đăng
      const post = await Post.findByIdAndUpdate(
        postId,
        { $set: { status } },
        { new: true }
      );

      if (!post) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy bài đăng",
        };
      }

      // Gửi thông báo cho người dùng nếu bài đăng bị ẩn/xóa
      if (status !== "active") {
        // Tạo thông báo
        await Notification.create({
          recipient: post.author,
          type: "system",
          content: `Bài đăng của bạn đã bị ${status === "hidden" ? "ẩn" : "xóa"} vì vi phạm tiêu chuẩn cộng đồng.`,
          targetType: "post",
          targetId: postId,
          read: false,
          createdAt: new Date(),
        });
      }

      return {
        success: true,
        status: 200,
        message: "Cập nhật trạng thái bài đăng thành công",
        data: {
          _id: post._id,
          status: post.status,
        },
      };
    } catch (error) {
      console.error("Error updating post status:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật trạng thái bài đăng",
        error: error.message,
      };
    }
  }

  /**
   * Quản lý nhiệm vụ - Lấy tất cả nhiệm vụ
   * @returns {Object} Kết quả lấy danh sách
   */
  async getAllTasks() {
    try {
      const tasks = await Task.find().sort({ type: 1, createdAt: -1 });

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách nhiệm vụ thành công",
        data: tasks,
      };
    } catch (error) {
      console.error("Error getting tasks:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy danh sách nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Tạo nhiệm vụ mới
   * @param {Object} taskData - Dữ liệu nhiệm vụ
   * @returns {Object} Kết quả tạo nhiệm vụ
   */
  async createTask(taskData) {
    try {
      // Tạo nhiệm vụ mới
      const newTask = new Task({
        name: taskData.name,
        description: taskData.description,
        type: taskData.type || "daily",
        rewardPoints: parseInt(taskData.rewardPoints) || 0,
        rewardTokens: parseFloat(taskData.rewardTokens) || 0,
        requirements: taskData.requirements,
        isActive: true,
        createdAt: new Date(),
      });

      await newTask.save();

      return {
        success: true,
        status: 201,
        message: "Tạo nhiệm vụ thành công",
        data: newTask,
      };
    } catch (error) {
      console.error("Error creating task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật nhiệm vụ
   * @param {String} taskId - ID nhiệm vụ
   * @param {Object} taskData - Dữ liệu cập nhật
   * @returns {Object} Kết quả cập nhật
   */
  async updateTask(taskId, taskData) {
    try {
      // Cập nhật nhiệm vụ
      const task = await Task.findByIdAndUpdate(
        taskId,
        {
          $set: {
            name: taskData.name,
            description: taskData.description,
            type: taskData.type,
            rewardPoints: parseInt(taskData.rewardPoints),
            rewardTokens: parseFloat(taskData.rewardTokens),
            requirements: taskData.requirements,
            isActive: Boolean(taskData.isActive),
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!task) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy nhiệm vụ",
        };
      }

      return {
        success: true,
        status: 200,
        message: "Cập nhật nhiệm vụ thành công",
        data: task,
      };
    } catch (error) {
      console.error("Error updating task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Xóa nhiệm vụ
   * @param {String} taskId - ID nhiệm vụ
   * @returns {Object} Kết quả xóa
   */
  async deleteTask(taskId) {
    try {
      // Xóa nhiệm vụ
      const task = await Task.findByIdAndDelete(taskId);

      if (!task) {
        return {
          success: false,
          status: 404,
          message: "Không tìm thấy nhiệm vụ",
        };
      }

      // Xóa tất cả completed tasks liên quan
      await CompletedTask.deleteMany({ taskId });

      return {
        success: true,
        status: 200,
        message: "Xóa nhiệm vụ thành công",
      };
    } catch (error) {
      console.error("Error deleting task:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi xóa nhiệm vụ",
        error: error.message,
      };
    }
  }

  /**
   * Reset nhiệm vụ hàng ngày
   * @returns {Object} Kết quả reset
   */
  async resetDailyTasks() {
    try {
      // Xóa tất cả completed tasks của ngày hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await CompletedTask.deleteMany({
        completedForDate: {
          $gte: today,
        },
      });

      return {
        success: true,
        status: 200,
        message: "Reset nhiệm vụ hàng ngày thành công",
        data: result.deletedCount,
      };
    } catch (error) {
      console.error("Error resetting daily tasks:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi reset nhiệm vụ hàng ngày",
        error: error.message,
      };
    }
  }

  /**
   * Tạo token DX cho người dùng (mint)
   * @param {String} walletAddress - Địa chỉ ví
   * @param {Number} amount - Số lượng token
   * @returns {Object} Kết quả mint token
   */
  async mintDXTokens(walletAddress, amount) {
    try {
      // Mint token
      const privateKey = process.env.PRIVATE_KEY;
      await blockchainService.mintDXTokens(
        privateKey,
        walletAddress,
        amount.toString()
      );

      return {
        success: true,
        status: 200,
        message: `Mint ${amount} DX tokens thành công cho ${walletAddress}`,
      };
    } catch (error) {
      console.error("Error minting DX tokens:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi mint DX tokens",
        error: error.message,
      };
    }
  }

  /**
   * Tạo thông báo hệ thống cho tất cả người dùng
   * @param {String} title - Tiêu đề thông báo
   * @param {String} content - Nội dung thông báo
   * @returns {Object} Kết quả tạo thông báo
   */
  async createSystemAnnouncement(title, content) {
    try {
      // Lấy tất cả người dùng active
      const users = await User.find({ status: "active" }).select(
        "walletAddress"
      );

      // Tạo thông báo cho từng người dùng
      const notifications = users.map((user) => ({
        recipient: user.walletAddress,
        type: "system",
        content: `${title}: ${content}`,
        read: false,
        createdAt: new Date(),
      }));

      // Lưu thông báo
      await Notification.insertMany(notifications);

      return {
        success: true,
        status: 200,
        message: "Tạo thông báo hệ thống thành công",
        data: users.length,
      };
    } catch (error) {
      console.error("Error creating system announcement:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo thông báo hệ thống",
        error: error.message,
      };
    }
  }

  /**
   * Lấy thống kê người dùng theo thời gian
   * @param {String} period - Khoảng thời gian (day, week, month)
   * @returns {Object} Kết quả thống kê
   */
  async getUsersOverTime(period) {
    try {
      let groupBy = {};
      let format = "";

      // Xác định nhóm và format theo period
      if (period === "day") {
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        format = "%Y-%m-%d";
      } else if (period === "week") {
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        format = "%Y-W%V";
      } else {
        // month
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        format = "%Y-%m";
      }

      // Thực hiện aggregation
      const result = await User.aggregate([
        {
          $group: {
            _id: groupBy,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                format: format,
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month" || 1,
                    day: "$_id.day" || 1,
                  },
                },
              },
            },
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ]);

      return {
        success: true,
        status: 200,
        message: "Lấy thống kê người dùng thành công",
        data: result,
      };
    } catch (error) {
      console.error("Error getting users over time:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy thống kê người dùng",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật các cấu hình hệ thống
   * @param {Object} configData - Dữ liệu cấu hình mới
   * @returns {Object} Kết quả cập nhật
   */
  async updateSystemConfig(configData) {
    try {
      // Trong thực tế, đây sẽ là code lưu cấu hình vào database
      // Hiện tại chỉ trả về cấu hình và lọc các thông tin nhạy cảm

      return {
        success: true,
        status: 200,
        message: "Cập nhật cấu hình hệ thống thành công",
        data: {
          // Lọc các thông tin nhạy cảm
          ...config,
          JWT_SECRET: undefined,
          JWT_REFRESH_SECRET: undefined,
          PRIVATE_KEY: undefined,
          ENCRYPTION_KEY: undefined,
        },
      };
    } catch (error) {
      console.error("Error updating system config:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật cấu hình hệ thống",
        error: error.message,
      };
    }
  }

  /**
   * Lấy log hệ thống
   * @param {String} type - Loại log (all, info, error,...)
   * @param {Number} limit - Giới hạn số lượng log
   * @returns {Object} Kết quả lấy log
   */
  async getSystemLogs(type, limit) {
    try {
      // Trong thực tế, bạn sẽ đọc log từ file hoặc database
      // Đây chỉ là mô phỏng
      const logs = [
        { timestamp: new Date(), level: "info", message: "Server started" },
        {
          timestamp: new Date(),
          level: "error",
          message: "Database connection error",
        },
        // ...
      ];

      // Lọc theo type
      let filteredLogs = logs;
      if (type !== "all") {
        filteredLogs = logs.filter((log) => log.level === type);
      }

      // Giới hạn số lượng
      filteredLogs = filteredLogs.slice(0, limit);

      return {
        success: true,
        status: 200,
        message: "Lấy log hệ thống thành công",
        data: filteredLogs,
      };
    } catch (error) {
      console.error("Error getting system logs:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi lấy log hệ thống",
        error: error.message,
      };
    }
  }

  /**
   * Force sync dữ liệu từ blockchain
   * @returns {Object} Kết quả đồng bộ
   */
  async forceBlockchainSync() {
    try {
      // Trigger sync service
      // Giả sử bạn có một service để đồng bộ dữ liệu từ blockchain
      const syncService = require("./syncService");

      // Bắt đầu đồng bộ
      await syncService.syncNFTEvents();
      await syncService.syncSubscriptionData();

      return {
        success: true,
        status: 200,
        message: "Đồng bộ dữ liệu blockchain thành công",
      };
    } catch (error) {
      console.error("Error syncing blockchain data:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi đồng bộ dữ liệu blockchain",
        error: error.message,
      };
    }
  }
}

module.exports = new AdminService();
