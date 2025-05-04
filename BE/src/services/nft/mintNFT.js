const NFTCache = require("../../models/NFTCache.mongoose");
const User = require("../../models/User.mongoose");
const blockchainService = require("../blockchain.services");
const IPFSService = require("../ipfs.services");
const { retryOperation } = require("../../utils/retry.utils");

/**
 * Mint NFT mới
 * @param {Object} data - Dữ liệu NFT cần mint
 * @param {String} walletAddress - Địa chỉ ví của người tạo
 * @param {Buffer} fileBuffer - Dữ liệu file
 * @param {String} mimetype - MIME type của file
 * @param {String} originalname - Tên gốc của file
 * @returns {Object} Thông tin NFT đã mint
 */
const mintNFT = async (data, walletAddress, fileBuffer, mimetype, originalname) => {
  try {
    const { name, description, royaltyPercent } = data;

    // Determine media type
    const mediaType = mimetype.startsWith("image/")
      ? "image"
      : mimetype.startsWith("video/")
        ? "video"
        : "audio";

    // Upload file lên IPFS
    const filename = `${Date.now()}-${originalname}`;
    const imageCID = await IPFSService.uploadFile(fileBuffer, filename);
    console.log(`Media uploaded to IPFS with CID: ${imageCID}`);

    // Tạo metadata
    const metadata = {
      name,
      description,
      image: `ipfs://${imageCID}`,
      attributes: [
        { trait_type: "Creator", value: walletAddress },
        { trait_type: "Media Type", value: mediaType },
      ],
      created_at: new Date().toISOString(),
    };

    // Upload metadata lên IPFS
    const metadataCID = await IPFSService.uploadJSON(metadata);
    console.log(`Metadata uploaded to IPFS with CID: ${metadataCID}`);

    const tokenURI = `ipfs://${metadataCID}`;

    // Mint NFT trên blockchain
    const royaltyPercentValue = parseFloat(royaltyPercent);

    const mintResult = await retryOperation(async () => {
      return await blockchainService.mintNFT(
        process.env.PRIVATE_KEY,
        tokenURI,
        mediaType,
        royaltyPercentValue
      );
    }, 3);

    // Lưu thông tin vào database
    const newNFT = new NFTCache({
      tokenId: mintResult.tokenId,
      creator: walletAddress.toLowerCase(),
      owner: walletAddress.toLowerCase(),
      tokenURI,
      metadata: {
        name,
        description,
        image: `ipfs://${imageCID}`,
        attributes: metadata.attributes,
      },
      mediaType,
      forSale: false,
      royaltyPercent: royaltyPercentValue,
      mintedAt: new Date(),
      transactions: [
        {
          type: "mint",
          from: "0x0000000000000000000000000000000000000000",
          to: walletAddress.toLowerCase(),
          timestamp: new Date(),
          txHash: mintResult.transactionHash,
        },
      ],
    });

    await newNFT.save();

    // Cập nhật NFT count của user - sử dụng mongoose v6 syntax
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $inc: { "socialStats.nftCount": 1 } },
      { new: true }
    );

    return {
      tokenId: mintResult.tokenId,
      name,
      description,
      mediaType,
      royaltyPercent: royaltyPercentValue,
      txHash: mintResult.transactionHash,
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
};

module.exports = {
  mintNFT,
};