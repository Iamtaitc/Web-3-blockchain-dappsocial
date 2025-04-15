"use strict";
const express = require("express");
const router = express.Router();
const SubscriptionController = require("../../controllers/subscription.controller");

router.post("/subscription/buy", SubscriptionController.createSubscriptionRequest);
router.post("/subscription/confirm", SubscriptionController.confirmPayment);

module.exports = router;
