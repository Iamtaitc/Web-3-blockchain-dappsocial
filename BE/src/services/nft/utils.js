const IPFSService = require("../ipfs.services");

/**
 * Format thông tin người dùng (creator hoặc owner)
 * @param {Object} user - Đối tượng user từ database
 * @returns {Object} Thông tin user đã format
 */
const formatUserDetails = (user) => {
  if (!user) return null;
  
  return {
    username: user.username,
    avatarURI: IPFSService.formatIPFSUrl(user.avatarURI),
    isVerified: user.isVerified,
  };
};

/**
 * Format metadata của NFT
 * @param {Object} metadata - Metadata của NFT
 * @param {Boolean} includeAttributes - Có bao gồm attributes hay không
 * @returns {Object} Metadata đã format
 */
const formatNFTMetadata = (metadata, includeAttributes = false) => {
  const formattedMetadata = {
    name: metadata.name,
    description: metadata.description,
    image: IPFSService.formatIPFSUrl(metadata.image),
  };
  
  if (includeAttributes && metadata.attributes) {
    formattedMetadata.attributes = metadata.attributes;
  }
  
  return formattedMetadata;
};

/**
 * Format thông tin NFT cơ bản
 * @param {Object} nft - Đối tượng NFT từ database
 * @returns {Object} Thông tin NFT cơ bản đã format
 */
const formatBasicNFTResponse = (nft) => {
  return {
    tokenId: nft.tokenId,
    creator: nft.creator,
    owner: nft.owner,
    metadata: formatNFTMetadata(nft.metadata),
    mediaType: nft.mediaType,
    forSale: nft.forSale,
    price: nft.price,
    royaltyPercent: nft.royaltyPercent,
    viewCount: nft.viewCount,
    mintedAt: nft.mintedAt,
  };
};

/**
 * Format thông tin NFT đầy đủ với thông tin creator và owner
 * @param {Object} nft - Đối tượng NFT từ database
 * @param {Object} creator - Đối tượng creator
 * @param {Object} owner - Đối tượng owner
 * @returns {Object} Thông tin NFT đầy đủ đã format
 */
const formatDetailedNFTResponse = (nft, creator, owner) => {
  return {
    tokenId: nft.tokenId,
    creator: nft.creator,
    creatorDetails: formatUserDetails(creator),
    owner: nft.owner,
    ownerDetails: formatUserDetails(owner),
    metadata: formatNFTMetadata(nft.metadata, true),
    mediaType: nft.mediaType,
    forSale: nft.forSale,
    price: nft.price,
    royaltyPercent: nft.royaltyPercent,
    viewCount: nft.viewCount,
    transactions: nft.transactions,
    mintedAt: nft.mintedAt,
  };
};

/**
 * Tạo đối tượng pagination
 * @param {Number} total - Tổng số kết quả
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số kết quả mỗi trang
 * @returns {Object} Thông tin pagination
 */
const createPaginationObject = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

module.exports = {
  formatUserDetails,
  formatNFTMetadata,
  formatBasicNFTResponse,
  formatDetailedNFTResponse,
  createPaginationObject
};