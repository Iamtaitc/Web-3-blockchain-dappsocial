const { body, param, query } = require('express-validator');

// Validation cho user profile
const userValidation = {
  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username phải có từ 3-30 ký tự')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username chỉ được chứa chữ cái, số và dấu gạch dưới'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio không quá 500 ký tự')
  ]
};

// Validation cho bài đăng
const postValidation = {
  createPost: [
    body('content')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Nội dung bài đăng phải từ 1-5000 ký tự'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags phải là một mảng')
  ]
};

// Validation cho comment
const commentValidation = {
  createComment: [
    body('content')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Nội dung comment phải từ 1-1000 ký tự')
  ]
};

// Validation cho NFT
const nftValidation = {
  mintNFT: [
    body('name')
      .isLength({ min: 3, max: 100 })
      .withMessage('Tên NFT phải từ 3-100 ký tự'),
    body('description')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Mô tả NFT phải từ 1-1000 ký tự'),
    body('royaltyPercent')
      .isFloat({ min: 0, max: 10 })
      .withMessage('Royalty phải từ 0-10%')
  ]
};

module.exports = {
  userValidation,
  postValidation,
  commentValidation,
  nftValidation
};