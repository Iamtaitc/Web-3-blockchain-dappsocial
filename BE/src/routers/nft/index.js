"use strict";
const express = require("express");
const router = express.Router();
const NftController = require("../../controllers/nft.controller");

// Lấy danh sách tất cả NFTs
router.get("/", NftController.getAllNFTs);

// Lấy thông tin chi tiết của một NFT
router.get("/:tokenId", NftController.getNFTById);

// Mint NFT mới (yêu cầu xác thực)
router.post("/mint", NftController.mintNFT);

// Đăng bán NFT (yêu cầu xác thực)
router.post("/:tokenId/list", NftController.listNFTForSale);

// Hủy đăng bán NFT (yêu cầu xác thực)
router.post("/:tokenId/unlist", NftController.unlistNFT);

// Mua NFT (yêu cầu xác thực)
router.post("/:tokenId/buy", NftController.buyNFT);

// Lấy danh sách NFT trên marketplace
router.get("/marketplace", NftController.getMarketplaceNFTs);

// Lấy danh sách NFT của một creator
router.get("/creator/:address", NftController.getCreatorNFTs);

module.exports = router;
