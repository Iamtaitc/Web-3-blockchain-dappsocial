const SubscriptionService = require("../services/subscription.services");
const ApiResponse = require("../utils/apiResponse.utils");

class SubscriptionController {
  /**
   * Tạo yêu cầu thanh toán subscription
   */
  async createSubscriptionRequest(req, res) {
    const { level, months } = req.body;
    const walletAddress = req.user?.address;

    const result = await SubscriptionService.createSubscriptionRequest(
      walletAddress,
      level,
      months
    );

    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status);
    }

    return ApiResponse.success(res, {
      paymentId: result.data.paymentId,
      totalPrice: result.data.totalPrice,
      currency: result.data.currency,
      transactionHash: result.data.transactionHash,
      network: result.data.network,
      level: result.data.level,
      months: result.data.months,
    });
  }

  /**
   * Xác nhận thanh toán và kích hoạt subscription
   */
  async confirmPayment(req, res) {
    const { paymentId, transactionHash } = req.body;

    const result = await SubscriptionService.confirmPaymentAndActivate(
      paymentId,
      transactionHash
    );

    if (!result.success) {
      return ApiResponse.error(res, result.message, result.status);
    }

    return ApiResponse.success(res, {
      user: result.data.user,
      level: result.data.level,
      months: result.data.months,
      subscriptionTransactionHash: result.data.subscriptionTransactionHash,
    });
  }
}

module.exports = new SubscriptionController();
