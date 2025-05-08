/**
 * Token Service - Quản lý token DX
 */

const blockchainService = require("../blockchain.services");

class TokenService {
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
}

module.exports = new TokenService();
