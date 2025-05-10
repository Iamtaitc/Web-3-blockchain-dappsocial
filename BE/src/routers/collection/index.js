"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const collectionController = require("../../controllers/collection.controller");

router.get("/collection/:id", collectionController.getCollection);
router.get("/collection/nft/:id", collectionController.getCollectionNFTs);
router.post("/collection/add/nft/:id", collectionController.addNFTToCollection);
router.patch(
  "/collection/remove/nft/:collectionid/:id",
  collectionController.addNFTToCollection
);
router.delete(
  "/collection/delete/:collectionid",
  collectionController.deleteCollection
);
router.patch("/collection/update/:id", collectionController.updateCollection);
router.post("/collection/create", collectionController.createCollection);
router.get("/collection/user/:id", collectionController.getUserCollections);
router.get("/collection/all", collectionController.getAllCollections);
router.get("/collection/featured", collectionController.getFeaturedCollections);
router.get("/collection/search", collectionController.searchCollections);
router.get("/collection/categories", collectionController.getCategories);

router.patch(
  "/collection/update/status/:id",
  collectionController.updateCollectionStats
);

module.exports = router;
