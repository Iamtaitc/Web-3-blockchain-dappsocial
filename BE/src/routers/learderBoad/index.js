"use strict";
const express = require('express');
const router = express.Router();
const leaderBoadController = require("../../controllers/leaderBoad.controller");


router.get("/user/leader-board", leaderBoadController.getUserLeaderboard);
router.get("/user/leader-board/nft", leaderBoadController.getNFTLeaderboard);
router.get("/user/leader-board/post", leaderBoadController.getNFTLeaderboard);
router.get("/user/leader-board/tag", leaderBoadController.getTagLeaderboard);
router.get("/user/leader-board/rank", leaderBoadController.getCurrentUserRank);

module.exports = router;