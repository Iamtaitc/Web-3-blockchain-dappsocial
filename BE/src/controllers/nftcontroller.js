const NFTCache = require("../models/NFTCache");
const User = require("../models/User");
const ipfsService = require("../services/ipfsService");
const blockchainService = require("../services/blockchainService");
const { validationResult } = require("express-validator");

// Mint NFT
exports.mintNFT = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, mediaType, royaltyPercent, tags } = req.body;
    const address = req.user.address;

    if (!req.file) {
      return res.status(400).json({ error: "Media file is required" });
    }

    // Upload media lên IPFS
    const mediaBuffer = req.file.buffer;
    const mediaFileName = req.file.originalname;
    const mediaCID = await ipfsService.uploadFile(mediaBuffer, mediaFileName);

    // Tạo metadata
    const nftMetadata = ipfsService.createNFTMetadata(
      name,
      description,
      mediaCID,
      [
        { trait_type: "Creator", value: address },
        { trait_type: "Media Type", value: mediaType },
        ...(tags ? tags.map((tag) => ({ trait_type: "Tag", value: tag })) : []),
      ]
    );

    // Upload metadata lên IPFS
    const metadataCID = await ipfsService.uploadJSON(nftMetadata);
    const tokenURI = `ipfs://${metadataCID}`;

    // Mint NFT on blockchain
    const service =
      process.env.ENV === "development"
        ? {
            mintNFT: () => ({
              tokenId: Math.floor(Math.random() * 1000000).toString(),
              creator: address,
              tokenURI,
            }),
          }
        : blockchainService;

    const result = await service.mintNFT(
      process.env.PRIVATE_KEY,
      tokenURI,
      mediaType,
      parseFloat(royaltyPercent)
    );

    // Lưu thông tin NFT vào database
    const newNFT = new NFTCache({
      tokenId: result.tokenId,
      creator: address.toLowerCase(),
      owner: address.toLowerCase(),
      tokenURI,
      metadata: {
        name,
        description,
        image: `ipfs://${mediaCID}`,
        attributes: [
          { trait_type: "Creator", value: address },
          { trait_type: "Media Type", value: mediaType },
          ...(tags
            ? tags.map((tag) => ({ trait_type: "Tag", value: tag }))
            : []),
        ],
      },
      mediaType,
      royaltyPercent: parseFloat(royaltyPercent),
      forSale: false,
      transactions: [
        {
          type: "mint",
          from: "0x0000000000000000000000000000000000000000",
          to: address.toLowerCase(),
          timestamp: new Date(),
          txHash: result.transactionHash || "local-dev-tx",
        },
      ],
      mintedAt: new Date(),
      lastUpdated: new Date(),
    });

    await newNFT.save();

    // Cập nhật thông tin user
    await User.updateOne(
      { walletAddress: address.toLowerCase() },
      {
        $inc: { "socialStats.nftCount": 1 },
        $push: {
          mintedNFTs: {
            tokenId: result.tokenId,
            tokenURI,
            timestamp: new Date(),
          },
        },
      }
    );

    // Format response
    const nftResponse = {
      tokenId: newNFT.tokenId,
      creator: newNFT.creator,
      owner: newNFT.owner,
      tokenURI,
      metadata: {
        name,
        description,
        image: ipfsService.formatIPFSUrl(`ipfs://${mediaCID}`),
        attributes: newNFT.metadata.attributes,
      },
      mediaType,
      royaltyPercent,
      mintedAt: newNFT.mintedAt,
      transactionHash: result.transactionHash || "local-dev-tx",
    };

    res.status(201).json({
      message: "NFT minted successfully",
      nft: nftResponse,
    });
  } catch (error) {
    console.error("Error minting NFT:", error);
    res.status(500).json({ error: "Failed to mint NFT" });
  }
};

// Lấy tất cả NFTs
exports.getAllNFTs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Lọc theo creator nếu có
    const filter = {};
    if (req.query.creator) {
      filter.creator = req.query.creator.toLowerCase();
    }

    // Lọc theo owner nếu có
    if (req.query.owner) {
      filter.owner = req.query.owner.toLowerCase();
    }

    // Lọc theo media type nếu có
    if (req.query.mediaType) {
      filter.mediaType = req.query.mediaType;
    }

    // Lấy danh sách NFTs
    const nfts = await NFTCache.find(filter)
      .sort({ mintedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedNFTs = nfts.map((nft) => ({
      tokenId: nft.tokenId,
      creator: nft.creator,
      owner: nft.owner,
      tokenURI: nft.tokenURI,
      metadata: {
        name: nft.metadata.name,
        description: nft.metadata.description,
        image: nft.metadata.image
          ? ipfsService.formatIPFSUrl(nft.metadata.image)
          : null,
        attributes: nft.metadata.attributes,
      },
      mediaType: nft.mediaType,
      forSale: nft.forSale,
      price: nft.price,
      royaltyPercent: nft.royaltyPercent,
      mintedAt: nft.mintedAt,
      lastUpdated: nft.lastUpdated,
    }));

    // Lấy tổng số NFTs để phân trang
    const total = await NFTCache.countDocuments(filter);

    res.status(200).json({
      nfts: formattedNFTs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting NFTs:", error);
    res.status(500).json({ error: "Failed to get NFTs" });
  }
};

// Lấy NFT theo tokenId
exports.getNFTById = async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Lấy thông tin NFT từ database
    const nft = await NFTCache.findOne({ tokenId });

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    // Lấy thông tin creator và owner
    const creator = await User.findOne({ walletAddress: nft.creator });
    const owner = await User.findOne({ walletAddress: nft.owner });

    // Cập nhật view count
    await NFTCache.updateOne({ tokenId }, { $inc: { viewCount: 1 } });

    // Format response
    const nftResponse = {
      tokenId: nft.tokenId,
      creator: nft.creator,
      creatorDetails: creator
        ? {
            username: creator.username,
            avatarURI: creator.avatarURI
              ? ipfsService.formatIPFSUrl(creator.avatarURI)
              : null,
            isVerified: creator.isVerified,
          }
        : null,
      owner: nft.owner,
      ownerDetails: owner
        ? {
            username: owner.username,
            avatarURI: owner.avatarURI
              ? ipfsService.formatIPFSUrl(owner.avatarURI)
              : null,
            isVerified: owner.isVerified,
          }
        : null,
      tokenURI: nft.tokenURI,
      metadata: {
        name: nft.metadata.name,
        description: nft.metadata.description,
        image: nft.metadata.image
          ? ipfsService.formatIPFSUrl(nft.metadata.image)
          : null,
        attributes: nft.metadata.attributes,
      },
      mediaType: nft.mediaType,
      forSale: nft.forSale,
      price: nft.price,
      royaltyPercent: nft.royaltyPercent,
      transactions: nft.transactions,
      viewCount: nft.viewCount,
      likeCount: nft.likeCount,
      mintedAt: nft.mintedAt,
      lastUpdated: nft.lastUpdated,
    };

    res.status(200).json({
      nft: nftResponse,
    });
  } catch (error) {
    console.error("Error getting NFT:", error);
    res.status(500).json({ error: "Failed to get NFT information" });
  }
};
