const getNFTService = require('./getNFT');
const mintNFTService = require('./mintNFT');
const marketplaceNFTService = require('./marketplaceNFT');

/**
 * Service xử lý các chức năng liên quan đến NFT
 */
class NFTService {
  // Get NFT methods
  getAllNFTs = getNFTService.getAllNFTs;
  getNFTById = getNFTService.getNFTById;
  getMarketplaceNFTs = getNFTService.getMarketplaceNFTs;
  getCreatorNFTs = getNFTService.getCreatorNFTs;
  
  // Mint NFT
  mintNFT = mintNFTService.mintNFT;
  
  // Marketplace functionality
  listNFTForSale = marketplaceNFTService.listNFTForSale;
  unlistNFT = marketplaceNFTService.unlistNFT;
  buyNFT = marketplaceNFTService.buyNFT;
  purchaseComplete = marketplaceNFTService.purchaseComplete;
}

module.exports = new NFTService();