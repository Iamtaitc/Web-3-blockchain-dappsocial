const NFTCache = require("../../models/NFTCache.mongoose");
const User = require("../../models/User.mongoose");
const IPFSService = require("../ipfs.services");
const {
  formatBasicNFTResponse,
  formatDetailedNFTResponse,
  formatUserDetails,
  createPaginationObject
} = require("./utils");

/**
 * Lấy tất cả NFTs với các filter
 * @param {Object} filters - Các filter để lọc NFT
 * @param {Object} pagination - Thông tin phân trang
 * @returns {Object} Danh sách NFTs và thông tin phân trang
 */
const getAllNFTs = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Xây dựng query dựa trên filters
    const query = {};

    if (filters.creator) {
      query.creator = filters.creator.toLowerCase();
    }

    if (filters.owner) {
      query.owner = filters.owner.toLowerCase();
    }

    if (filters.forSale === "true") {
      query.forSale = true;
    }

    if (filters.mediaType) {
      query.mediaType = filters.mediaType;
    }

    // Lấy NFTs
    const nfts = await NFTCache.find(query)
      .sort({ mintedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Lấy tổng số NFTs để phân trang
    const total = await NFTCache.countDocuments(query);

    // Format response
    const formattedNFTs = nfts.map(formatBasicNFTResponse);

    return {
      nfts: formattedNFTs,
      pagination: createPaginationObject(total, page, limit),
    };
  } catch (error) {
    console.error("Error getting NFTs:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết NFT
 * @param {String} tokenId - ID của NFT
 * @returns {Object} Thông tin chi tiết của NFT
 */
const getNFTById = async (tokenId) => {
  try {
    // Lấy thông tin NFT
    const nft = await NFTCache.findOne({ tokenId });

    if (!nft) {
      throw new Error("NFT không tồn tại");
    }

    // Lấy thông tin creator và owner
    const creator = await User.findOne({ walletAddress: nft.creator });
    const owner = await User.findOne({ walletAddress: nft.owner });

    // Tăng view count
    await NFTCache.updateOne({ tokenId }, { $inc: { viewCount: 1 } });

    // Format response
    const nftResponse = formatDetailedNFTResponse(nft, creator, owner);
    
    // Cập nhật view count để hiển thị chính xác trong response
    nftResponse.viewCount += 1;

    return { nft: nftResponse };
  } catch (error) {
    console.error("Error getting NFT details:", error);
    throw error;
  }
};

/**
 * Lấy danh sách NFT trên marketplace
 * @param {Object} filters - Các filter để lọc NFT
 * @param {Object} pagination - Thông tin phân trang
 * @returns {Object} Danh sách NFTs và thông tin phân trang
 */
const getMarketplaceNFTs = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Lọc NFT đang bán
    const query = { forSale: true };

    // Lọc theo giá (min & max)
    if (filters.minPrice) {
      query.price = { $gte: filters.minPrice };
    }

    if (filters.maxPrice) {
      if (query.price) {
        query.price.$lte = filters.maxPrice;
      } else {
        query.price = { $lte: filters.maxPrice };
      }
    }

    // Lọc theo loại media
    if (filters.mediaType) {
      query.mediaType = filters.mediaType;
    }

    // Lấy NFTs
    const nfts = await NFTCache.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Lấy thông tin chi tiết của chủ sở hữu
    const ownerAddresses = [...new Set(nfts.map((nft) => nft.owner))];
    const owners = await User.find({
      walletAddress: { $in: ownerAddresses },
    }).select("walletAddress username avatarURI isVerified");

    const ownersMap = {};
    owners.forEach((owner) => {
      ownersMap[owner.walletAddress] = owner;
    });

    // Format response
    const formattedNFTs = nfts.map((nft) => ({
      tokenId: nft.tokenId,
      creator: nft.creator,
      owner: nft.owner,
      ownerDetails: ownersMap[nft.owner] 
        ? formatUserDetails(ownersMap[nft.owner]) 
        : null,
      metadata: {
        name: nft.metadata.name,
        description: nft.metadata.description,
        image: IPFSService.formatIPFSUrl(nft.metadata.image),
      },
      mediaType: nft.mediaType,
      price: nft.price,
      royaltyPercent: nft.royaltyPercent,
      viewCount: nft.viewCount,
      listedAt:
        nft.transactions.find((tx) => tx.type === "list")?.timestamp ||
        nft.lastUpdated,
    }));

    // Lấy tổng số NFTs để phân trang
    const total = await NFTCache.countDocuments(query);

    return {
      nfts: formattedNFTs,
      pagination: createPaginationObject(total, page, limit),
    };
  } catch (error) {
    console.error("Error getting marketplace NFTs:", error);
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

/**
 * Lấy danh sách NFT của một creator
 * @param {String} address - Địa chỉ ví của creator
 * @param {Object} pagination - Thông tin phân trang
 * @returns {Object} Danh sách NFTs và thông tin creator
 */
const getCreatorNFTs = async (address, pagination = {}) => {
  try {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Kiểm tra creator có tồn tại không
    const creator = await User.findOne({
      walletAddress: address.toLowerCase(),
    });

    if (!creator) {
      throw new Error("Creator không tồn tại");
    }

    // Lấy NFTs của creator
    const nfts = await NFTCache.find({ creator: address.toLowerCase() })
      .sort({ mintedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format response
    const formattedNFTs = nfts.map(formatBasicNFTResponse);

    // Lấy tổng số NFTs để phân trang
    const total = await NFTCache.countDocuments({
      creator: address.toLowerCase(),
    });

    return {
      creator: {
        walletAddress: creator.walletAddress,
        username: creator.username,
        avatarURI: IPFSService.formatIPFSUrl(creator.avatarURI),
        isVerified: creator.isVerified,
      },
      nfts: formattedNFTs,
      pagination: createPaginationObject(total, page, limit),
    };
  } catch (error) {
    console.error("Error getting creator NFTs:", error);
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

module.exports = {
  getAllNFTs,
  getNFTById,
  getMarketplaceNFTs,
  getCreatorNFTs,
};