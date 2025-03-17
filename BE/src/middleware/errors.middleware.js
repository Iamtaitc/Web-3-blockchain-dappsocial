const ApiResponse = require("../utils/ApiResponse.utils");

/**
 * Middleware xử lý lỗi 404 - Tài nguyên không tồn tại
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  return ApiResponse.notFound(res, `Resource '${req.originalUrl}' not found`);
};

/**
 * Middleware xử lý lỗi toàn cục
 * @param {object} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error("Global error:", err);

  // Xử lý lỗi validation từ Mongoose
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message);
    return ApiResponse.badRequest(res, "Validation Error", errors);
  }

  // Xử lý lỗi trùng lặp từ MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.conflict(res, `${field} already exists`, {
      field,
      value: err.keyValue[field],
    });
  }

  // Xử lý lỗi từ JWT
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.unauthorized(res, "Token expired");
  }

  // Xử lý lỗi SyntaxError (JSON parsing)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return ApiResponse.badRequest(res, "Invalid JSON");
  }

  // Xử lý lỗi custom với statusCode
  if (err.statusCode) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Lỗi mặc định
  return ApiResponse.serverError(
    res,
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message,
    process.env.NODE_ENV === "production" ? null : err.stack
  );
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
