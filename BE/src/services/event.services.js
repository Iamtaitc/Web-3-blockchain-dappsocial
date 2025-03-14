const ethers = require('ethers');
const { getContracts } = require('./blockchain.services');
const User = require('../models/User.mongoose');
const NFTCache = require('../models/NFTCache.mongoose');

// Khởi tạo event listeners
const initEventListeners = () => {
  const { dxToken, nftMedia, marketplace, subscription } = getContracts();
  
  // Lắng nghe các event từ NFTMedia
  nftMedia.on('NFTCreated', handleNFTCreated);
  marketplace.on('NFTListed', handleNFTListed);
  marketplace.on('NFTSold', handleNFTSold);
  marketplace.on('NFTUnlisted', handleNFTUnlisted);
  subscription.on('SubscriptionPurchased', handleSubscriptionPurchased);
  
  console.log('Blockchain event listeners initialized');
};

// Handler cho event NFTCreated
const handleNFTCreated = async (tokenId, creator, tokenURI, event) => {
  console.log(`NFT Created - TokenID: ${tokenId}, Creator: ${creator}`);
  
  try {
    // Cập nhật cache trong MongoDB
    await NFTCache.findOneAndUpdate(
      { tokenId: tokenId.toString() },
      {
        $set: {
          tokenId: tokenId.toString(),
          creator: creator.toLowerCase(),
          owner: creator.toLowerCase(),
          tokenURI,
          mintedAt: new Date(),
          transactions: [{
            type: 'mint',
            from: '0x0000000000000000000000000000000000000000',
            to: creator.toLowerCase(),
            timestamp: new Date(),
            txHash: event.transactionHash
          }]
        }
      },
      { upsert: true }
    );
    
    // Cập nhật thông tin user
    await User.findOneAndUpdate(
      { walletAddress: creator.toLowerCase() },
      { $inc: { 'socialStats.nftCount': 1 } }
    );
  } catch (error) {
    console.error('Error handling NFTCreated event:', error);
  }
};

// Handler cho event NFTListed
const handleNFTListed = async (tokenId, seller, price, event) => {
  console.log(`NFT Listed - TokenID: ${tokenId}, Price: ${ethers.utils.formatEther(price)} DX`);
  
  try {
    // Cập nhật cache trong MongoDB
    await NFTCache.findOneAndUpdate(
      { tokenId: tokenId.toString() },
      {
        $set: {
          forSale: true,
          price: ethers.utils.formatEther(price),
          lastUpdated: new Date()
        },
        $push: {
          transactions: {
            type: 'list',
            from: seller.toLowerCase(),
            to: seller.toLowerCase(),
            price: ethers.utils.formatEther(price),
            timestamp: new Date(),
            txHash: event.transactionHash
          }
        }
      }
    );
  } catch (error) {
    console.error('Error handling NFTListed event:', error);
  }
};


module.exports = {
  initEventListeners
};