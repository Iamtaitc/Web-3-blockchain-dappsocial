"use strict";
const express = require("express");
const router = express.Router();
const NftController = require("../../controllers/nft.controller");

// Lấy danh sách tất cả NFTs
router.get("/nft/all", NftController.getAllNFTs);

// Lấy thông tin chi tiết của một NFT
router.get("/nft/id/:tokenId", NftController.getNFTById);

// Hủy đăng bán NFT (yêu cầu xác thực)
router.post("/nft/:tokenId/unlist", NftController.unlistNFT);

// Mua NFT (yêu cầu xác thực)
router.post("/nft/:tokenId/buy", NftController.buyNFT);

// Xác nhận hoàn tất giao dịch mua NFT
router.post("/nft/purchase-complete", NftController.purchaseComplete);

// Lấy danh sách NFT trên marketplace
router.get("/nft/marketplace", NftController.getMarketplaceNFTs);

// Lấy danh sách NFT của một creator
router.get("/nft/creator/:address", NftController.getCreatorNFTs);

module.exports = router;
