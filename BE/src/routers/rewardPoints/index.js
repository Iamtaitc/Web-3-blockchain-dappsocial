// src/routes/api/rewardPoints.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const RewardPointsController = require("../../controllers/rewardPoints.controller");

// Check-in hàng ngày
router.post("/reward/check-in", RewardPointsController.checkIn);

// Lấy thông tin điểm thưởng người dùng
router.get("/reward/points", RewardPointsController.getUserPoints);

// Claim tokens từ pending sang claimed
router.post("/reward/claim", RewardPointsController.claimTokens);

// Lấy thông tin rewards của người dùng
router.get("/reward/info", RewardPointsController.getUserRewards);

// Xử lý đăng nhập lần đầu và rewards chào mừng
router.post("/reward/first-login", RewardPointsController.handleFirstLogin);

// Hoàn thành nhiệm vụ
router.post("/reward/task/:taskId", RewardPointsController.completeTask);

// Thêm tokens vào pending (admin only)
// router.post("/reward/add-pending", RewardPointsController.addPendingTokens);

module.exports = router;
