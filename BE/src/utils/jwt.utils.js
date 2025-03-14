require("dotenv").config(); // Load biến môi trường từ file .env
const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || "2h";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Tạo access token
 * @param {Object} payload - Dữ liệu muốn mã hóa
 * @returns {string} - Access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
};

/**
 * Tạo refresh token
 * @param {Object} payload - Dữ liệu muốn mã hóa
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
};

/**
 * Xác thực token
 * @param {string} token - JWT cần kiểm tra
 * @param {boolean} isRefresh - Kiểm tra refresh token hay access token
 * @returns {Object|null} - Payload hoặc null nếu token không hợp lệ
 */
const verifyToken = (token, isRefresh = false) => {
  try {
    return jwt.verify(token, isRefresh ? REFRESH_SECRET : ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
