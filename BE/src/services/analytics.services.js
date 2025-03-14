const Post = require('../models/Post.mongoose');
const NFTCache = require('../models/NFTCache.mongoose');
const User = require('../models/User.mongoose');
const Comment = require('../models/Comment.mongoose');

/**
 * Tính toán điểm trending cho bài đăng
 * Công thức: (likes*3 + comments*2 + saves + views/10) / (hours_since_creation + 2)^1.5
 * @param {string} postId - ID của bài đăng
 */
const calculatePostTrendingScore = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) return;
    
    const now = new Date();
    const createdAt = post.createdAt || now;
    
    // Tính số giờ từ lúc tạo
    const hoursSinceCreation = Math.max(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60),
      0
    );
    
    // Tính điểm trending
    const likeWeight = post.likeCount * 3;
    const commentWeight = post.commentCount * 2;
    const saveWeight = post.saveCount;
    const viewWeight = (post.viewCount || 0) / 10;
    
    const score = 
      (likeWeight + commentWeight + saveWeight + viewWeight) / 
      Math.pow(hoursSinceCreation + 2, 1.5);
    
    // Cập nhật điểm trending
    await Post.updateOne(
      { _id: postId },
      { $set: { trendScore: score } }
    );
    
    return score;
  } catch (error) {
    console.error('Error calculating post trending score:', error);
  }
};

/**
 * Tính toán điểm trending cho NFT
 * @param {string} tokenId - ID của NFT
 */
const calculateNFTTrendingScore = async (tokenId) => {
  try {
    const nft = await NFTCache.findOne({ tokenId });
    if (!nft) return;
    
    const now = new Date();
    const mintedAt = nft.mintedAt || now;
    
    // Tính số giờ từ lúc mint
    const hoursSinceCreation = Math.max(
      (now.getTime() - mintedAt.getTime()) / (1000 * 60 * 60),
      0
    );
    
    // Tính điểm trending
    const viewWeight = (nft.viewCount || 0) / 5;
    const likeWeight = nft.likeCount * 2;
    const forSaleBonus = nft.forSale ? 10 : 0;
    
    const score = 
      (viewWeight + likeWeight + forSaleBonus) / 
      Math.pow(hoursSinceCreation + 2, 1.3);
    
    // Cập nhật điểm trending
    await NFTCache.updateOne(
      { tokenId },
      { $set: { trendScore: score } }
    );
    
    return score;
  } catch (error) {
    console.error('Error calculating NFT trending score:', error);
  }
};

/**
 * Cập nhật tất cả điểm trending (chạy định kỳ)
 */
const updateAllTrendingScores = async () => {
  console.log('Updating all trending scores...');
  
  try {
    // Lấy tất cả posts từ 7 ngày trước
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    const posts = await Post.find({
      createdAt: { $gte: cutoffDate },
      status: 'active'
    }).select('_id');
    
    // Cập nhật từng post
    for (const post of posts) {
      await calculatePostTrendingScore(post._id);
    }
    
    // Cập nhật NFTs
    const nfts = await NFTCache.find().select('tokenId');
    
    for (const nft of nfts) {
      await calculateNFTTrendingScore(nft.tokenId);
    }
    
    console.log('Trending scores update completed');
  } catch (error) {
    console.error('Error updating trending scores:', error);
  }
};

/**
 * Tính toán thống kê người dùng
 * @param {string} walletAddress - Địa chỉ ví người dùng
 */
const calculateUserStats = async (walletAddress) => {
  try {
    const address = walletAddress.toLowerCase();
    
    // Đếm số bài đăng
    const postCount = await Post.countDocuments({
      author: address,
      status: 'active'
    });
    
    // Đếm số NFT đã mint
    const nftCount = await NFTCache.countDocuments({
      creator: address
    });
    
    // Đếm số comments
    const commentCount = await Comment.countDocuments({
      author: address,
      status: 'active'
    });
    
    // Cập nhật thống kê
    await User.updateOne(
      { walletAddress: address },
      {
        $set: {
          'socialStats.postCount': postCount,
          'socialStats.nftCount': nftCount,
          'socialStats.commentCount': commentCount
        }
      }
    );
    
    return {
      postCount,
      nftCount,
      commentCount
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
  }
};

module.exports = {
  calculatePostTrendingScore,
  calculateNFTTrendingScore,
  updateAllTrendingScores,
  calculateUserStats
};