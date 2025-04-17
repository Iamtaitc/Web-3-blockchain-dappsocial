"use strict";
const express = require("express");
const router = express.Router();
const NftController = require("../../controllers/nft.controller");

// Lấy danh sách tất cả NFTs
router.get("/nft/all", NftController.getAllNFTs);

// Lấy thông tin chi tiết của một NFT
router.get("/nft/id/:tokenId", NftController.getNFTById);

// Mint NFT mới (yêu cầu xác thực)
// router.post("/nft/mint", NftController.mintNFT);

// Đăng bán NFT (yêu cầu xác thực)
// router.post("/nft/:tokenId/list", NftController.listNFTForSale);

// Hủy đăng bán NFT (yêu cầu xác thực)
router.post("/nft/:tokenId/unlist", NftController.unlistNFT);

// Mua NFT (yêu cầu xác thực)
router.post("/nft/:tokenId/buy", NftController.buyNFT);

// Lấy danh sách NFT trên marketplace
router.get("/nft/marketplace", NftController.getMarketplaceNFTs);

// Lấy danh sách NFT của một creator
router.get("/nft/creator/:address", NftController.getCreatorNFTs);

module.exports = router;
