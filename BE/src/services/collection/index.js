const createCollectionService = require('./createCollection');
const getCollectionService = require('./getCollection');
const manageNFTsService = require('./manageNFTs');
const searchCollectionService = require('./searchCollection');
const statsCollectionService = require('./statsCollection');
const deleteCollectionService = require('./deleteCollection');

/**
 * Service xử lý các chức năng bộ sưu tập NFT
 */
class CollectionService {
  // Create & Update Collection
  createCollection = createCollectionService.createCollection;
  updateCollection = createCollectionService.updateCollection;
  
  // Get Collection
  getCollection = getCollectionService.getCollection;
  getCollectionNFTs = getCollectionService.getCollectionNFTs;
  getUserCollections = getCollectionService.getUserCollections;
  getAllCollections = getCollectionService.getAllCollections;
  getFeaturedCollections = getCollectionService.getFeaturedCollections;
  
  // Manage NFTs in Collection
  addNFTToCollection = manageNFTsService.addNFTToCollection;
  removeNFTFromCollection = manageNFTsService.removeNFTFromCollection;
  
  // Search & Categories
  searchCollections = searchCollectionService.searchCollections;
  getCategories = searchCollectionService.getCategories;
  
  // Stats
  updateCollectionStats = statsCollectionService.updateCollectionStats;
  
  // Delete
  deleteCollection = deleteCollectionService.deleteCollection;
}

module.exports = new CollectionService();