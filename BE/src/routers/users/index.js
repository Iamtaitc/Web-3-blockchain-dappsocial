"use strict";
const express = require('express');
const router = express.Router();

const userController = require("../../controllers/userController");

router.get("/register", userController.getUserProfile);

module.exports = router;