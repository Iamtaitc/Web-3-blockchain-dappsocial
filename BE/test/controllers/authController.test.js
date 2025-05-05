// tests/controllers/authController.test.js
const AuthController = require('../../src/controllers/auth.controller');
const AuthService = require('../../src/services/auth.services');
const ApiResponse = require('../../src/utils/apiResponse.utils');

// Mock dependencies
jest.mock('../../src/services/auth.services');
jest.mock('../../src/utils/apiResponse.utils');

describe('AuthController', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connectWallet', () => {
    it('should connect wallet successfully', async () => {
      // Arrange
      const req = {
        body: {
          walletAddress: '0x123456789abcdef'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: true,
        data: {
          message: 'Chào mừng đến với DeSo Social!',
          nonce: '123456'
        }
      };

      AuthService.connectWallet.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.connectWallet(req, res);
      
      // Assert
      expect(AuthService.connectWallet).toHaveBeenCalledWith('0x123456789abcdef');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        res,
        serviceResult.data,
        "Tạo nonce thành công"
      );
    });

    it('should handle error when connecting wallet', async () => {
      // Arrange
      const req = {
        body: {
          walletAddress: '0x123456789abcdef'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: false,
        error: 'Lỗi server',
        status: 500
      };

      AuthService.connectWallet.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.connectWallet(req, res);
      
      // Assert
      expect(AuthService.connectWallet).toHaveBeenCalledWith('0x123456789abcdef');
      expect(ApiResponse.error).toHaveBeenCalledWith(
        res,
        serviceResult.error,
        serviceResult.status
      );
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      // Arrange
      const req = {
        body: {
          walletAddress: '0x123456789abcdef',
          signature: 'validSignature'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: true,
        data: {
          message: 'Đăng nhập thành công',
          token: 'jwt-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-id',
            walletAddress: '0x123456789abcdef',
            username: 'user_123456',
            avatarURI: 'avatar-uri',
            isVerified: false
          }
        }
      };

      AuthService.login.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.login(req, res);
      
      // Assert
      expect(AuthService.login).toHaveBeenCalledWith('0x123456789abcdef', 'validSignature');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        res,
        serviceResult.data,
        "Đăng nhập thành công"
      );
    });

    it('should handle error when login fails', async () => {
      // Arrange
      const req = {
        body: {
          walletAddress: '0x123456789abcdef',
          signature: 'invalidSignature'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: false,
        error: 'Chữ ký không hợp lệ',
        status: 401
      };

      AuthService.login.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.login(req, res);
      
      // Assert
      expect(AuthService.login).toHaveBeenCalledWith('0x123456789abcdef', 'invalidSignature');
      expect(ApiResponse.error).toHaveBeenCalledWith(
        res,
        serviceResult.error,
        serviceResult.status
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const req = {
        body: {
          refreshToken: 'valid-refresh-token'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: true,
        data: {
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        }
      };

      AuthService.refreshToken.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.refreshToken(req, res);
      
      // Assert
      expect(AuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        res,
        serviceResult.data,
        "Làm mới token thành công"
      );
    });

    it('should handle error when refresh token fails', async () => {
      // Arrange
      const req = {
        body: {
          refreshToken: 'invalid-refresh-token'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: false,
        error: 'Refresh token không hợp lệ hoặc đã hết hạn',
        status: 401
      };

      AuthService.refreshToken.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.refreshToken(req, res);
      
      // Assert
      expect(AuthService.refreshToken).toHaveBeenCalledWith('invalid-refresh-token');
      expect(ApiResponse.error).toHaveBeenCalledWith(
        res,
        serviceResult.error,
        serviceResult.status
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const req = {
        body: {
          refreshToken: 'valid-refresh-token'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: true,
        data: {
          message: 'Đăng xuất thành công'
        }
      };

      AuthService.logout.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.logout(req, res);
      
      // Assert
      expect(AuthService.logout).toHaveBeenCalledWith('valid-refresh-token');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        res,
        serviceResult.data,
        "Đăng xuất thành công"
      );
    });

    it('should handle error when logout fails', async () => {
      // Arrange
      const req = {
        body: {
          refreshToken: 'invalid-refresh-token'
        }
      };
      const res = {};
      
      const serviceResult = {
        success: false,
        error: 'Refresh token không tồn tại',
        status: 400
      };

      AuthService.logout.mockResolvedValue(serviceResult);
      
      // Act
      await AuthController.logout(req, res);
      
      // Assert
      expect(AuthService.logout).toHaveBeenCalledWith('invalid-refresh-token');
      expect(ApiResponse.error).toHaveBeenCalledWith(
        res,
        serviceResult.error,
        serviceResult.status
      );
    });
  });
});