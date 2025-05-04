const { getSubscriptionInfo } = require("../blockchain.services");

/**
 * Service cơ sở cho các chức năng liên quan đến điểm thưởng
 */
class BaseRewardService {
  /**
   * Kiểm tra tính hợp lệ của địa chỉ ví
   * @param {String} address - Địa chỉ ví cần kiểm tra
   * @returns {Boolean} - Kết quả kiểm tra
   * @protected
   */
  _validateWalletAddress(address) {
    if (!address || typeof address !== "string" || address.length !== 42) {
      throw new Error("Địa chỉ ví không hợp lệ");
    }

    // Kiểm tra định dạng địa chỉ Ethereum (0x theo sau bởi 40 ký tự hex)
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethereumAddressRegex.test(address)) {
      throw new Error("Địa chỉ ví không đúng định dạng Ethereum");
    }

    return true;
  }

  /**
   * Lấy ngày hiện tại (đầu ngày)
   * @returns {Date} - Ngày hiện tại lúc 00:00:00
   * @protected
   */
  _getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Lấy multiplier từ subscription của người dùng
   * @param {String} address - Địa chỉ ví
   * @returns {Number} - Hệ số multiplier
   * @protected
   */
  async _getMultiplier(address) {
    try {
      const subscriptionInfo = await getSubscriptionInfo(address);
      return subscriptionInfo.level || 1;
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Không thể lấy thông tin subscription");
      }
      return 1; // Default multiplier if error
    }
  }
}

module.exports = BaseRewardService;
