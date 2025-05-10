// utils/nftFormatter.js
const ipfsService = require("../services/ipfs.services");

/**
 * Formats NFT data for consistent API responses
 * @param {Object} nft - The NFT document from the database
 * @param {Object} creator - The creator user document (optional)
 * @param {Object} owner - The owner user document (optional)
 * @returns {Object} Formatted NFT response object
 */
const formatNFTResponse = (nft, creator = null, owner = null) => {
  return {
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
};

module.exports = {
  formatNFTResponse,
};
