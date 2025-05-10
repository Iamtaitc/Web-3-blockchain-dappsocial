"use strict";

const express = require("express");
const router = express.Router();

router.use("/v1", require("./authWallet"));
router.use("/v1", require("./users"));
router.use("/v1", require("./tasks"));
router.use("/v1", require("./search"));
router.use("/v1", require("./report"));
router.use("/v1", require("./posts"));
router.use("/v1", require("./notifications"));
router.use("/v1", require("./nft"));
router.use("/v1", require("./comments"));
router.use("/v1", require("./learderBoad"));
router.use("/v1", require("./collection"));
router.use("/v1", require("./rewardPoints"));
router.use("/v1", require("./subscription"));

router.use("/v1", require("./admin"));

module.exports = router;
("use strict");
