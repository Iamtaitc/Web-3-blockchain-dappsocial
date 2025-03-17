"use strict";

const express = require("express");
const router = express.Router();
const walletAuthController = require("../../controllers/authController");

router.post("./connect-wallet", walletAuthController.connectWallet);
router.post("./verify-signature", walletAuthController.verifyWalletSignature);
router.post("./refresh-token", walletAuthController.refreshToken);
router.post("./logout", walletAuthController.logout);
