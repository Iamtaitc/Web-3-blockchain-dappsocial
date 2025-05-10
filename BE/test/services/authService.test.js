// tests/services/authService.test.js
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../../src/models/User.mongoose');
const config = require('../../src/configs/config.env');
const AuthService = require('../../src/services/auth.services');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('ethers');
jest.mock('../../src/models/User.mongoose');
jest.mock('../../src/configs/config.env.js', () => ({
  JWT_SECRET: 'test-jwt-secret',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '7d'
}));

describe('AuthService', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Math.random for predictable nonce
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);
    // Mock Date.now for predictable timestamps
    jest.spyOn(global, 'Date').mockImplementation(() => ({
      getTime: () => 1626100000000, // Fixed timestamp
      toISOString: () => '2023-07-12T12:00:00.000Z'
    }));
    global.Date.now = jest.fn(() => 1626100000000);
  });

  describe('connectWallet', () => {
    it('should create a nonce for a new wallet', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      const nonce = '123456'; // From our mocked Math.random
      
      User.findOneAndUpdate.mockResolvedValue({
        walletAddress: walletAddress.toLowerCase(),
        nonce
      });
      
      // Act
      const result = await AuthService.connectWallet(walletAddress);
      
      // Assert
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { walletAddress: walletAddress.toLowerCase() },
        {
          $set: {
            walletAddress: walletAddress.toLowerCase(),
            nonce,
            nonceExpiry: expect.any(Object) // We don't need to test the exact Date object
          }
        },
        { upsert: true }
      );
      
      expect(result).toEqual({
        success: true,
        data: {
          message: 'Chào mừng đến với DeSo Social!',
          nonce
        }
      });
    });

    it('should handle errors when connecting wallet', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      
      User.findOneAndUpdate.mockRejectedValue(new Error('Database error'));
      
      // Act
      const result = await AuthService.connectWallet(walletAddress);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Lỗi server',
        status: 500
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      const signature = 'validSignature';
      const userId = 'mockUserId';
      const nonce = '123456';
      
      const mockUser = {
        _id: userId,
        walletAddress: walletAddress.toLowerCase(),
        nonce,
        nonceExpiry: new Date(Date.now() + 900000), // 15 minutes from now
        username: null,
        avatarURI: null,
        isVerified: false,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Mock the ethers verifyMessage
      jest.mock('ethers', () => ({
        verifyMessage: jest.fn().mockReturnValue('0x123456789abcdef')
      }));
      
      // Mock JWT sign
      const mockToken = 'jwt-token';
      const mockRefreshToken = 'refresh-token';
      jwt.sign.mockImplementation((payload, secret, options) => {
        if (secret === config.JWT_SECRET) return mockToken;
        if (secret === config.JWT_REFRESH_SECRET) return mockRefreshToken;
        return null;
      });
      
      // Act
      const result = await AuthService.login(walletAddress, signature);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        walletAddress: walletAddress.toLowerCase()
      });
      
      expect(ethers.verifyMessage).toHaveBeenCalledWith(
        'Chào mừng đến với DeSo Social!',
        signature
      );
      
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      
      expect(mockUser.save).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        data: {
          message: 'Đăng nhập thành công',
          token: mockToken,
          refreshToken: mockRefreshToken,
          user: {
            id: userId,
            walletAddress: walletAddress.toLowerCase(),
            username: `user_${walletAddress.substring(2, 8)}`,
            avatarURI: null,
            isVerified: false
          }
        }
      });
    });

    it('should fail login with missing credentials', async () => {
      // Arrange - missing signature
      const walletAddress = '0x123456789abcdef';
      const signature = '';
      
      // Act
      const result = await AuthService.login(walletAddress, signature);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Địa chỉ ví và chữ ký là bắt buộc',
        status: 400
      });
    });

    it('should fail login when user not found', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      const signature = 'validSignature';
      
      User.findOne.mockResolvedValue(null);
      
      // Act
      const result = await AuthService.login(walletAddress, signature);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Vui lòng lấy nonce mới trước khi đăng nhập',
        status: 400
      });
    });

    it('should fail login when nonce expired', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      const signature = 'validSignature';
      const userId = 'mockUserId';
      const nonce = '123456';
      
      const mockUser = {
        _id: userId,
        walletAddress: walletAddress.toLowerCase(),
        nonce,
        nonceExpiry: new Date(Date.now() - 1000), // Expired
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      const result = await AuthService.login(walletAddress, signature);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Nonce đã hết hạn, vui lòng lấy nonce mới',
        status: 400
      });
    });

    it('should fail login with invalid signature', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      const signature = 'invalidSignature';
      const userId = 'mockUserId';
      const nonce = '123456';
      
      const mockUser = {
        _id: userId,
        walletAddress: walletAddress.toLowerCase(),
        nonce,
        nonceExpiry: new Date(Date.now() + 900000), // Not expired
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Mock signature verification to fail
      ethers.verifyMessage = jest.fn().mockReturnValue('0xdifferentaddress');
      
      // Act
      const result = await AuthService.login(walletAddress, signature);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Chữ ký không hợp lệ',
        status: 401
      });
    });

    it('should handle errors during signature verification', async () => {
      // Arrange
      const walletAddress = '0x123456789abcdef';
      const signature = 'invalidSignature';
      const userId = 'mockUserId';
      const nonce = '123456';
      
      const mockUser = {
        _id: userId,
        walletAddress: walletAddress.toLowerCase(),
        nonce,
        nonceExpiry: new Date(Date.now() + 900000), // Not expired
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Mock signature verification to throw an error
      ethers.verifyMessage = jest.fn().mockImplementation(() => {
        throw new Error('Verification error');
      });
      
      // Act
      const result = await AuthService.login(walletAddress, signature);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Xác thực chữ ký thất bại',
        status: 401
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const walletAddress = '0x123456789abcdef';
      const userId = 'mockUserId';
      
      // Mock JWT verify
      jwt.verify.mockReturnValue({
        address: walletAddress,
        userId
      });
      
      // Mock finding user with refresh token
      const mockUser = {
        _id: userId,
        walletAddress: walletAddress.toLowerCase(),
        refreshToken,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Mock JWT sign for new tokens
      const newToken = 'new-jwt-token';
      const newRefreshToken = 'new-refresh-token';
      jwt.sign.mockImplementation((payload, secret, options) => {
        if (secret === config.JWT_SECRET) return newToken;
        if (secret === config.JWT_REFRESH_SECRET) return newRefreshToken;
        return null;
      });
      
      // Act
      const result = await AuthService.refreshToken(refreshToken);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, config.JWT_REFRESH_SECRET);
      
      expect(User.findOne).toHaveBeenCalledWith({
        walletAddress: walletAddress.toLowerCase(),
        refreshToken
      });
      
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      
      expect(mockUser.save).toHaveBeenCalled();
      
      expect(result).toEqual({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    });

    it('should fail with missing refresh token', async () => {
      // Arrange
      const refreshToken = '';
      
      // Act
      const result = await AuthService.refreshToken(refreshToken);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Refresh token là bắt buộc',
        status: 400
      });
    });

    it('should fail with invalid refresh token', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      
      // Mock JWT verify to throw an error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act
      const result = await AuthService.refreshToken(refreshToken);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Refresh token không hợp lệ hoặc đã hết hạn',
        status: 401
      });
    });

    it('should fail when user not found', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const walletAddress = '0x123456789abcdef';
      const userId = 'mockUserId';
      
      // Mock JWT verify
      jwt.verify.mockReturnValue({
        address: walletAddress,
        userId
      });
      
      // User not found
      User.findOne.mockResolvedValue(null);
      
      // Act
      const result = await AuthService.refreshToken(refreshToken);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Refresh token không hợp lệ',
        status: 401
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      
      // Mock updateOne to return success
      User.updateOne.mockResolvedValue({
        modifiedCount: 1
      });
      
      // Act
      const result = await AuthService.logout(refreshToken);
      
      // Assert
      expect(User.updateOne).toHaveBeenCalledWith(
        { refreshToken },
        { $set: { refreshToken: null } }
      );
      
      expect(result).toEqual({
        success: true,
        data: {
          message: 'Đăng xuất thành công'
        }
      });
    });

    it('should fail with missing refresh token', async () => {
      // Arrange
      const refreshToken = '';
      
      // Act
      const result = await AuthService.logout(refreshToken);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Refresh token là bắt buộc',
        status: 400
      });
    });

    it('should fail when refresh token not found', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      
      // Mock updateOne to return no match
      User.updateOne.mockResolvedValue({
        modifiedCount: 0
      });
      
      // Act
      const result = await AuthService.logout(refreshToken);
      
      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Refresh token không tồn tại',
        status: 400
      });
    });
  });
});