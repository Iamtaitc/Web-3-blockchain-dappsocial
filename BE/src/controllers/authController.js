// controllers/authController.js
const jwt = require("jsonwebtoken");
const ethers = require("ethers");
const User = require("../models/User.mongoose");
const config = require("../config");

/**
 * Tạo nonce để xác thực ví
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Địa chỉ ví không hợp lệ" });
    }

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

    // Tạo message để ký
    const message = `Chào mừng đến với DeSo Social!\n\nVui lòng ký thông điệp này để xác thực.\n\nThao tác này không tạo transaction và không tiêu tốn gas fee.\n\nĐịa chỉ ví: ${walletAddress}\nNonce: ${nonce}\nThời gian: ${new Date().toISOString()}`;

    res.status(200).json({
      message,
      nonce,
    });
  } catch (error) {
    console.error("Lỗi khi kết nối ví:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

/**
 * Xác thực chữ ký và đăng nhập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.login = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res
        .status(400)
        .json({ error: "Địa chỉ ví và chữ ký là bắt buộc" });
    }

    // Tìm user và nonce
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user || !user.nonce || !user.nonceExpiry) {
      return res
        .status(400)
        .json({ error: "Vui lòng lấy nonce mới trước khi đăng nhập" });
    }

    // Kiểm tra nonce có hết hạn không
    if (user.nonceExpiry < new Date()) {
      return res
        .status(400)
        .json({ error: "Nonce đã hết hạn, vui lòng lấy nonce mới" });
    }

    // Tái tạo message đã ký
    const message = `Chào mừng đến với DeSo Social!\n\nVui lòng ký thông điệp này để xác thực.\n\nThao tác này không tạo transaction và không tiêu tốn gas fee.\n\nĐịa chỉ ví: ${walletAddress}\nNonce: ${user.nonce}\nThời gian: ${new Date().toISOString()}`;

    // Xác thực chữ ký
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({ error: "Chữ ký không hợp lệ" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Xác thực chữ ký thất bại" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        address: walletAddress.toLowerCase(),
        userId: user._id,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN || "24h" }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      {
        address: walletAddress.toLowerCase(),
        userId: user._id,
      },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN || "7d" }
    );

    // Xóa nonce sau khi xác thực thành công
    user.nonce = null;
    user.nonceExpiry = null;
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Trả về user info và token
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      refreshToken,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username || `user_${user.walletAddress.substring(2, 8)}`,
        avatarURI: user.avatarURI,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

/**
 * Refresh token
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token là bắt buộc" });
    }

    // Xác thực refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    // Tìm user với refresh token
    const user = await User.findOne({
      walletAddress: decoded.address.toLowerCase(),
      refreshToken,
    });

    if (!user) {
      return res.status(401).json({ error: "Refresh token không hợp lệ" });
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

    res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Lỗi refresh token:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

/**
 * Đăng xuất
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token là bắt buộc" });
    }

    // Xóa refresh token trong database
    await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
