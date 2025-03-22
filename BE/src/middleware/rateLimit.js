const rateLimit = require('express-rate-limit');

// Giới hạn general API calls
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests mỗi IP trong 15 phút
  standardHeaders: true,
  message: { error: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.' }
});

// Giới hạn cho việc đăng bài
const postLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5, // Giới hạn 5 post mỗi IP trong 5 phút
  message: { error: 'Đã đạt giới hạn đăng bài, vui lòng thử lại sau.' }
});

// Giới hạn cho việc comment
const commentLimit = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 phút
  max: 10, // Giới hạn 10 comments mỗi IP trong 2 phút
  message: { error: 'Đã đạt giới hạn bình luận, vui lòng thử lại sau.' }
});

// Giới hạn cho việc mint NFT
const nftLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // Giới hạn 10 NFTs mỗi IP trong 1 giờ
  message: { error: 'Đã đạt giới hạn mint NFT, vui lòng thử lại sau.' }
});

module.exports = {
  globalLimit,
  postLimit,
  commentLimit,
  nftLimit
};