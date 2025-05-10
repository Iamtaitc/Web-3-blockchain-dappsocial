"use strict";

const express = require("express");
const router = express.Router();
const walletAuthController = require("../../controllers/auth.controller");

router.post("/connect-wallet", walletAuthController.connectWallet);
router.post("/login", walletAuthController.login);
router.post("/refresh-token", walletAuthController.refreshToken);
router.post("/logout", walletAuthController.logout);


module.exports = router;
