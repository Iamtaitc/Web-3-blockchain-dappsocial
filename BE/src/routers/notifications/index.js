"use strict";
const express = require('express');
const router = express.Router();
const notificationController = require("../../controllers/notification.controller");

router.get("/notifications", notificationController.getNotifications);
router.patch("/notifications/:notificationId/read", notificationController.markAsRead);
router.patch("/notifications/read/all", notificationController.markAllAsRead);
module.exports = router;