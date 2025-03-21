"use strict";

const express = require("express");
const router = express.Router();

router.use("/v1", require("./authWallet"));
router.use("/v1", require("./users"));
router.use("/v1", require("./posts"));
router.use("/v1", require("./comments"));
router.use("/v1", require("./nft"));

module.exports = router;