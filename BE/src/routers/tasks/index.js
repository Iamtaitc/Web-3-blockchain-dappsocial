"use strict";
const express = require("express");
const router = express.Router();
const TaskController = require("../../controllers/task.controller");

router.get("/tasks", TaskController.getAllTasks);
router.get("/tasks/user", TaskController.getUserTasks);
router.get("/tasks/subscription", TaskController.getUserSubscription);

module.exports = router;
