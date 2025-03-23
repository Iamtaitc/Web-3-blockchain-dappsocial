"use strict";
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth.middleware');
const userController = require("../../controllers/userController");

// router.use(verifyToken);

router.get("/user/:id", userController.getUserProfile);
router.patch("/user/update", userController.updateProfile);
router.post("/user/follower/:id", userController.followUser);
router.post("/user/unfollower/:id", userController.unfollowUser);
router.get("/user/following", userController.getUserFollowing);
router.get("/user/followers", userController.getUserFollowers);
router.get("/user/leaderboard", userController.getLeaderboard);

module.exports = router;