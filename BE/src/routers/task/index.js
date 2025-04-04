"use strict";
const express = require('express');
const router = express.Router();
const userController = require("../../controllers/user.controller");

router.get("/tasks", TaskController.getAllTasks);
router.get("/tasks/user", TaskController.getUserTasks);
router.post("/tasks/check-in", TaskController.checkIn);
router.get("/tasks/subscription", TaskController.getUserSubscription);
router.get("/tasks/points", TaskController.getUserPoints);
router.post("/tasks/claim-tokens", TaskController.claimTokens);

module.exports = router;