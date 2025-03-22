// utils/scheduler.js
const cron = require('node-cron');
const NFTCache = require('../models/NFTCache.mongoose');
const User = require('../models/User.mongoose');
const { getContracts } = require('../services/blockchain.services');

// Khởi tạo scheduled tasks
const initScheduledTasks = () => {
  // Sync NFT data mỗi 5 phút
  cron.schedule('*/5 * * * *', syncNFTData);
  
  // Sync subscription data mỗi giờ
  cron.schedule('0 * * * *', syncSubscriptionData);
  
  // Reset daily tasks mỗi ngày lúc 00:00
  cron.schedule('0 0 * * *', resetDailyTasks);
  
  console.log('Scheduled tasks initialized');
};

// Sync NFT data từ blockchain
const syncNFTData = async () => {
  console.log('Syncing NFT data from blockchain...');
  
  try {
    const { nftMedia, marketplace } = getContracts();
    
    // Đếm tổng số NFT trên blockchain
    const tokenCount = (await nftMedia.tokenIdCounter()).toNumber();
    
    // Sync từng NFT
    for (let i = 1; i <= tokenCount; i++) {
      const tokenId = i.toString();
      
      // Kiểm tra NFT có tồn tại trong database chưa
      const existingNFT = await NFTCache.findOne({ tokenId });
      
      // Nếu chưa có hoặc cần cập nhật
      if (!existingNFT || !existingNFT.lastUpdated || new Date() - existingNFT.lastUpdated > 3600000) {
        // Lấy thông tin NFT từ blockchain
        const owner = await nftMedia.ownerOf(tokenId);
        const tokenURI = await nftMedia.tokenURI(tokenId);
        const nftInfo = await nftMedia.mediaNFTs(tokenId);
        
        // Lấy thông tin listing từ marketplace
        const listing = await marketplace.listings(tokenId);
        
        // Cập nhật vào database
        await NFTCache.findOneAndUpdate(
          { tokenId },
          {
            $set: {
              owner: owner.toLowerCase(),
              tokenURI,
              mediaType: nftInfo.mediaType,
              royaltyPercent: nftInfo.royaltyPercent.toNumber() / 100,
              forSale: listing.active,
              price: listing.active ? ethers.utils.formatEther(listing.price) : '0',
              lastUpdated: new Date()
            }
          },
          { upsert: true }
        );
      }
    }
    
    console.log('NFT data sync completed');
  } catch (error) {
    console.error('Error syncing NFT data:', error);
  }
};

// Cập nhật thông tin subscription từ blockchain
const syncSubscriptionData = async () => {
  console.log('Syncing subscription data from blockchain...');
  
  try {
    const { subscription } = getContracts();
    
    // Lấy tất cả users có subscription đang active
    const users = await User.find({
      'subscription.level': { $gt: 1 },
      'subscription.expiration': { $exists: true }
    });
    
    // Kiểm tra và cập nhật từng user
    for (const user of users) {
      const walletAddress = user.walletAddress;
      
      // Lấy thông tin từ blockchain
      const [level, expiration] = await subscription.getSubscription(walletAddress);
      const expirationDate = new Date(expiration.toNumber() * 1000);
      
      // Cập nhật nếu khác với thông tin hiện tại
      if (level.toNumber() !== user.subscription.level || 
          Math.abs(expirationDate - user.subscription.expiration) > 3600000) {
        
        await User.updateOne(
          { walletAddress },
          {
            $set: {
              'subscription.level': level.toNumber(),
              'subscription.expiration': expirationDate
            }
          }
        );
      }
    }
    
    console.log('Subscription data sync completed');
  } catch (error) {
    console.error('Error syncing subscription data:', error);
  }
};

// Reset các nhiệm vụ hàng ngày
const resetDailyTasks = async () => {
  console.log('Resetting daily tasks...');
  
  try {
    // Reset các nhiệm vụ đã hoàn thành
    await CompletedTask.deleteMany({
      'completedForDate': { $lt: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    console.log('Daily tasks reset completed');
  } catch (error) {
    console.error('Error resetting daily tasks:', error);
  }
};

module.exports = {
  initScheduledTasks
};