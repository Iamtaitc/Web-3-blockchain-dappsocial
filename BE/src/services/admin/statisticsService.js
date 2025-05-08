/**
 * Statistics Service - Quản lý thống kê dữ liệu theo thời gian
 */

const { User } = require("../../models/index");

class StatisticsService {
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
}

module.exports = new StatisticsService();
