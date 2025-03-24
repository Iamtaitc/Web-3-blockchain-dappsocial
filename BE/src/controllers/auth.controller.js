// controllers/authController.js
const ApiResponse = require('../utils/ApiResponse');
const AuthService = require('../services/auth.services');

class AuthController {
  /**
   * Tạo nonce để xác thực ví
   * @param {object} req - Request object chứa thông tin yêu cầu từ client
   * @param {object} res - Response object dùng để gửi phản hồi về client
   */
  async connectWallet(req, res) {
    const { walletAddress } = req.body;
    
    const result = await AuthService.connectWallet(walletAddress);
    
    if (!result.success) {
      return ApiResponse.error(res, result.error, result.status || 500);
    }
    
    return ApiResponse.success(res, result.data, "Tạo nonce thành công");
  }

  /**
   * Xác thực chữ ký và đăng nhập
   * @param {object} req - Request object chứa thông tin yêu cầu từ client
   * @param {object} res - Response object dùng để gửi phản hồi về client
   */
  async login(req, res) {
    const { walletAddress, signature } = req.body;
    
    const result = await AuthService.login(walletAddress, signature);
    
    if (!result.success) {
      return ApiResponse.error(res, result.error, result.status || 500);
    }
    
    return ApiResponse.success(res, result.data, "Đăng nhập thành công");
  }

  /**
   * Refresh token
   * @param {object} req - Request object chứa thông tin yêu cầu từ client
   * @param {object} res - Response object dùng để gửi phản hồi về client
   */
  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    
    const result = await AuthService.refreshToken(refreshToken);
    
    if (!result.success) {
      return ApiResponse.error(res, result.error, result.status || 500);
    }
    
    return ApiResponse.success(res, result.data, "Làm mới token thành công");
  }

  /**
   * Đăng xuất
   * @param {object} req - Request object chứa thông tin yêu cầu từ client
   * @param {object} res - Response object dùng để gửi phản hồi về client
   */
  async logout(req, res) {
    const { refreshToken } = req.body;
    
    const result = await AuthService.logout(refreshToken);
    
    if (!result.success) {
      return ApiResponse.error(res, result.error, result.status || 500);
    }
    
    return ApiResponse.success(res, result.data, "Đăng xuất thành công");
  }
}

module.exports = new AuthController();