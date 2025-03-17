"use strict";

const express = require("express");
const router = express.Router();
router.get('/v1', require("./authWallet"));
router.use("/v1", require("./users"));
module.exports = router;