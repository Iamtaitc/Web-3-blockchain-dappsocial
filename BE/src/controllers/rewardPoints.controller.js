const ApiResponse = require("../utils/apiResponse.utils");
const RewardPointsService = require("../services/rewardPoints.services");

/**
 * Controller xử lý các chức năng liên quan đến điểm thưởng và tokens
 */
class RewardPointsController {
  async checkIn(req, res) {
    try {
      const address = req.user.address;
      const result = await RewardPointsService.checkIn(address);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.message,
          result.error ? 400 : 500,
          result.error
        );
      }

      return ApiResponse.success(res, {
        message: "Check-in thành công",
        streak: result.data.streak,
        pointsEarned: result.data.pointsEarned,
        tokensEarned: result.data.tokensEarned,
        checkIn: result.data.checkIn
      });
    } catch (error) {
      return ApiResponse.error(res, "Lỗi khi xử lý check-in", 500, error.message);
    }
  }

  async getUserPoints(req, res) {
    try {
      const address = req.user.address;
      const result = await RewardPointsService.getUserPoints(address);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.message,
          result.error ? 400 : 404,
          result.error
        );
      }

      return ApiResponse.success(res, result.data);
    } catch (error) {
      return ApiResponse.error(res, "Lỗi khi lấy thông tin điểm thưởng", 500, error.message);
    }
  }

  async claimTokens(req, res) {
    try {
      const walletAddress = req.user.address;
      const result = await RewardPointsService.claimTokens(walletAddress);

      if (!result.success) {
        const status = result.error && result.error.nextClaimTime ? 429 : 400;
        return ApiResponse.error(
          res,
          result.message,
          status,
          result.error
        );
      }

      return ApiResponse.success(res, {
        message: "Claim token thành công",
        amount: result.data.amount,
        transactionHash: result.data.transactionHash
      });
    } catch (error) {
      return ApiResponse.error(res, "Lỗi khi claim token", 500, error.message);
    }
  }

  async getUserRewards(req, res) {
    try {
      const walletAddress = req.user.address;
      const result = await RewardPointsService.getUserRewards(walletAddress);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.message,
          400,
          result.error
        );
      }

      return ApiResponse.success(res, result.data);
    } catch (error) {
      return ApiResponse.error(res, "Lỗi khi lấy thông tin rewards", 500, error.message);
    }
  }

  async handleFirstLogin(req, res) {
    try {
      const walletAddress = req.user.address;
      const result = await RewardPointsService.handleFirstLogin(walletAddress);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.message,
          400,
          result.error
        );
      }

      if (result.isFirstLogin) {
        return ApiResponse.success(res, {
          message: result.message,
          isFirstLogin: true,
          pendingTokens: result.data.pendingTokens
        });
      }

      return ApiResponse.success(res, {
        isFirstLogin: false,
        pendingTokens: result.data.pendingTokens
      });
    } catch (error) {
      return ApiResponse.error(res, "Lỗi khi xử lý đăng nhập lần đầu", 500, error.message);
    }
  }

  async completeTask(req, res) {
    try {
      const { taskId } = req.params;
      const walletAddress = req.user.address;

      if (!taskId) {
        return ApiResponse.error(res, "ID nhiệm vụ không được để trống", 400);
      }

      const result = await RewardPointsService.completeTask(walletAddress, taskId);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.message,
          result.error ? 400 : 404,
          result.error
        );
      }

      return ApiResponse.success(res, {
        message: "Hoàn thành nhiệm vụ thành công",
        pointsEarned: result.data.pointsEarned,
        tokensEarned: result.data.tokensEarned,
        taskName: result.data.taskName
      });
    } catch (error) {
      return ApiResponse.error(res, "Lỗi khi hoàn thành nhiệm vụ", 500, error.message);
    }
  }

  // async addPendingTokens(req, res) {
  //   try {
  //     const { walletAddress, amount, reason } = req.body;
  //     const address = req.user.address;

  //     if (!req.user.isAdmin) {
  //       return ApiResponse.error(res, "Không đủ quyền hạn", 403);
  //     }

  //     if (!walletAddress || !amount) {
  //       return ApiResponse.error(res, "Thiếu thông tin bắt buộc", 400);
  //     }

  //     const result = await RewardPointsService.addPendingTokens(walletAddress, Number(amount), reason);

  //     if (!result.success) {
  //       return ApiResponse.error(
  //         res,
  //         result.message,
  //         400,
  //         result.error
  //       );
  //     }

  //     return ApiResponse.success(res, {
  //       message: `Đã thêm ${amount} token vào tài khoản`,
  //       pendingTokens: result.data.pendingTokens,
  //       totalPoints: result.data.totalPoints,
  //       reason: result.data.reason
  //     });
  //   } catch (error) {
  //     return ApiResponse.error(res, "Lỗi khi thêm token", 500, error.message);
  //   }
  // }
}

module.exports = new RewardPointsController();
