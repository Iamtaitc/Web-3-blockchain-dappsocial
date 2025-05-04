// services/AuthService.js
const jwt = require("jsonwebtoken");
const { ethers, verifyMessage } = require("ethers");
const User = require("../models/User.mongoose");
const config = require("../configs/config.env");

class AuthService {
  /**
   * Tạo nonce để xác thực ví
   * @param {string} walletAddress - Địa chỉ ví của người dùng
   * @returns {object} - Kết quả của quá trình tạo nonce
   */
  async connectWallet(walletAddress) {
    try {
      // Tạo nonce ngẫu nhiên
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const nonceExpiry = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

      // Lưu hoặc cập nhật user với nonce mới
      await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        {
          $set: {
            walletAddress: walletAddress.toLowerCase(),
            nonce,
            nonceExpiry,
          },
        },
        { upsert: true }
      );
      const privateKey =
        "6b74d9ba5835a91a54cf26ebb45d7304c5232afcfdde6f6ebda3366a09511a3d";
      const wallet = new ethers.Wallet(privateKey);

      // Tạo message để ký
      const message = `Chào mừng đến với DeSo Social!`;

      // Ký tin nhắn đã được hash
      const signature = await wallet.signMessage(message);
      console.log("signature:", signature);
      return {
        success: true,
        data: { message, nonce },
      };
    } catch (error) {
      console.error("Lỗi khi kết nối ví:", error);
      return {
        success: false,
        error: "Lỗi server",
        status: 500,
      };
    }
  }

  /**
   * Xác thực chữ ký và đăng nhập
   * @param {string} walletAddress - Địa chỉ ví của người dùng
   * @param {string} signature - Chữ ký xác thực
   * @returns {object} - Kết quả của quá trình đăng nhập
   */
  async login(walletAddress, signature) {
    try {
      if (!walletAddress || !signature) {
        return {
          success: false,
          error: "Địa chỉ ví và chữ ký là bắt buộc",
          status: 400,
        };
      }

      const user = await User.findOne({
        walletAddress: walletAddress.toLowerCase(),
      });

      if (!user || !user.nonce || !user.nonceExpiry) {
        return {
          success: false,
          error: "Vui lòng lấy nonce mới trước khi đăng nhập",
          status: 400,
        };
      }

      if (user.nonceExpiry < new Date()) {
        return {
          success: false,
          error: "Nonce đã hết hạn, vui lòng lấy nonce mới",
          status: 400,
        };
      }

      const message = `Chào mừng đến với DeSo Social!`;

      try {
        const recoveredAddress = verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return {
            success: false,
            error: "Chữ ký không hợp lệ",
            status: 401,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: "Xác thực chữ ký thất bại",
          status: 401,
        };
      }

      // 🔽 Tạo token
      const token = jwt.sign(
        { address: walletAddress.toLowerCase(), userId: user._id },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN || "24h" }
      );

      const refreshToken = jwt.sign(
        { address: walletAddress.toLowerCase(), userId: user._id },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN || "7d" }
      );

      // 🔽 Gán username nếu chưa có
      if (!user.username || user.username.trim() === "") {
        user.username = `user_${walletAddress.toLowerCase().slice(2, 8)}`;
      }

      user.nonce = null;
      user.nonceExpiry = null;
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();

      await user.save();

      return {
        success: true,
        data: {
          message: "Đăng nhập thành công",
          token,
          refreshToken,
          user: {
            id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            avatarURI: user.avatarURI,
            isVerified: user.isVerified,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return {
        success: false,
        error: "Lỗi server",
        status: 500,
      };
    }
  }

  /**
   * Refresh token
   * @param {string} refreshToken - Refresh token cần làm mới
   * @returns {object} - Kết quả của quá trình làm mới token
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          error: "Refresh token là bắt buộc",
          status: 400,
        };
      }

      // Xác thực refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      } catch (error) {
        return {
          success: false,
          error: "Refresh token không hợp lệ hoặc đã hết hạn",
          status: 401,
        };
      }

      // Tìm user với refresh token
      const user = await User.findOne({
        walletAddress: decoded.address.toLowerCase(),
        refreshToken,
      });

      if (!user) {
        return {
          success: false,
          error: "Refresh token không hợp lệ",
          status: 401,
        };
      }

      // Tạo token mới
      const newToken = jwt.sign(
        {
          address: user.walletAddress,
          userId: user._id,
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN || "24h" }
      );

      // Tạo refresh token mới
      const newRefreshToken = jwt.sign(
        {
          address: user.walletAddress,
          userId: user._id,
        },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN || "7d" }
      );

      // Cập nhật refresh token mới
      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      console.error("Lỗi refresh token:", error);
      return {
        success: false,
        error: "Lỗi server",
        status: 500,
      };
    }
  }

  /**
   * Đăng xuất
   * @param {string} refreshToken - Refresh token cần xóa
   * @returns {object} - Kết quả của quá trình đăng xuất
   */
  async logout(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          error: "Refresh token là bắt buộc",
          status: 400,
        };
      }

      // Xóa refresh token trong database
      const result = await User.updateOne(
        { refreshToken },
        { $set: { refreshToken: null } }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: "Refresh token không tồn tại",
          status: 400,
        };
      }

      return {
        success: true,
        data: {
          message: "Đăng xuất thành công",
        },
      };
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      return {
        success: false,
        error: "Lỗi server",
        status: 500,
      };
    }
  }
}

module.exports = new AuthService();
