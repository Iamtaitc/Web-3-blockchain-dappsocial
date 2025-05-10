"use strict";
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth.middleware');
const userController = require("../../controllers/user.controller");

router.use(verifyToken);

router.get("/user/:address", userController.getUserProfile);
router.patch("/user/update", userController.updateProfile);
router.post("/user/follower/:address", userController.followUser);
router.post("/user/unfollower/:address", userController.unfollowUser);
router.get("/user/following/:address", userController.getUserFollowing);
router.get("/user/followers/:address", userController.getUserFollowers);
router.post("/user/leaderboard", userController.getLeaderboard);

module.exports = router;