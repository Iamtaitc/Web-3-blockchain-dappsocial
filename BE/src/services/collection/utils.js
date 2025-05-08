const { User } = require("../../models/index");
const IPFSService = require("../ipfs.services");

/**
 * Format thông tin creator
 * @param {Object} creator - Đối tượng user từ database
 * @returns {Object} Thông tin creator đã format
 */
const formatCreatorDetails = (creator) => {
  if (!creator) return null;
  
  return {
    username: creator.username,
    avatarURI: creator.avatarURI
      ? IPFSService.formatIPFSUrl(creator.avatarURI)
      : null,
    isVerified: creator.isVerified,
  };
};

/**
 * Format thông tin collection để trả về
 * @param {Object} collection - Đối tượng collection từ database
 * @param {Object} creator - Đối tượng creator (optional)
 * @returns {Object} Thông tin collection đã format
 */
const formatCollectionResponse = (collection, creator = null) => {
  return {
    _id: collection._id,
    name: collection.name,
    description: collection.description,
    category: collection.category,
    creator: collection.creator,
    creatorDetails: creator ? formatCreatorDetails(creator) : null,
    isPublic: collection.isPublic,
    bannerURL: collection.bannerURI
      ? IPFSService.formatIPFSUrl(collection.bannerURI)
      : null,
    thumbnailURL: collection.thumbnailURI
      ? IPFSService.formatIPFSUrl(collection.thumbnailURI)
      : null,
    nftCount: collection.nftCount,
    floorPrice: collection.floorPrice || "0",
    volume: collection.volume || "0",
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
};

/**
 * Format thông tin NFT để trả về
 * @param {Object} nft - Đối tượng NFT từ database
 * @param {Object} owner - Đối tượng owner (optional)
 * @returns {Object} Thông tin NFT đã format
 */
const formatNFTResponse = (nft, owner = null) => {
  return {
    tokenId: nft.tokenId,
    name: nft.metadata.name,
    description: nft.metadata.description,
    image: nft.metadata.image
      ? IPFSService.formatIPFSUrl(nft.metadata.image)
      : null,
    creator: nft.creator,
    owner: nft.owner,
    ownerDetails: owner ? formatCreatorDetails(owner) : null,
    forSale: nft.forSale,
    price: nft.price,
    mediaType: nft.mediaType,
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

/**
 * Tạo đối tượng sort options cho MongoDB
 * @param {String} sortBy - Trường cần sắp xếp
 * @param {String} sortOrder - Thứ tự sắp xếp (asc/desc)
 * @returns {Object} Sort options
 */
const createSortOptions = (sortBy, sortOrder) => {
  const sortOptions = {};
  const order = sortOrder === "asc" ? 1 : -1;

  switch (sortBy) {
    case "nftCount":
      sortOptions.nftCount = order;
      break;
    case "price":
      sortOptions.price = order;
      break;
    case "name":
      sortOptions.name = order;
      break;
    case "createdAt":
      sortOptions.createdAt = order;
      break;
    case "mintedAt":
      sortOptions.mintedAt = order;
      break;
    case "updatedAt":
    default:
      sortOptions.updatedAt = order;
  }

  return sortOptions;
};

module.exports = {
  formatCreatorDetails,
  formatCollectionResponse,
  formatNFTResponse,
  createPaginationObject,
  createSortOptions
};