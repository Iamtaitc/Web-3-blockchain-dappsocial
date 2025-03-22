// src/controllers/leaderboardController.js

const {User, Post, NFTCache} = require('../models/index');
const ipfsService = require('../services/ipfs.services');
const { validationResult } = require('express-validator');

/**
 * Lấy bảng xếp hạng người dùng dựa trên điểm số
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getUserLeaderboard = async (req, res) => {
  try {
    const { limit = 20, page = 1, period = 'alltime' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Xác định thời điểm bắt đầu dựa trên period
    let startDate = new Date(0); // Từ đầu thời gian
    if (period === 'daily') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Lấy danh sách người dùng có điểm cao nhất
    const users = await User.find({ 
      status: 'active',
      points: { $gt: 0 }
    })
    .sort({ points: -1 })
    .skip(skip)
    .limit(limitNumber)
    .select('walletAddress username ensName avatarURI points followerCount postCount subscription isVerified');

    // Format response
    const leaderboard = users.map(user => ({
      walletAddress: user.walletAddress,
      username: user.username,
      ensName: user.ensName,
      avatarURI: user.avatarURI ? ipfsService.formatIPFSUrl(user.avatarURI) : null,
      points: user.points,
      followerCount: user.followerCount,
      postCount: user.postCount,
      subscriptionLevel: user.subscription?.level || 1,
      isVerified: user.isVerified
    }));

    // Lấy tổng số người dùng có điểm > 0
    const total = await User.countDocuments({ 
      status: 'active',
      points: { $gt: 0 }
    });

    // Lấy thứ hạng của user hiện tại nếu đã đăng nhập
    let currentUserRank = null;
    if (req.user) {
      const userAddress = req.user.address.toLowerCase();
      const currentUser = await User.findOne({ walletAddress: userAddress });
      
      if (currentUser && currentUser.points > 0) {
        const higherRankedUsers = await User.countDocuments({
          status: 'active',
          points: { $gt: currentUser.points }
        });
        
        currentUserRank = higherRankedUsers + 1;
      }
    }

    res.status(200).json({
      leaderboard,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      },
      period,
      currentUserRank
    });
  } catch (error) {
    console.error('Error getting user leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lấy bảng xếp hạng NFT dựa trên giá, lượt thích và lượt xem
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getNFTLeaderboard = async (req, res) => {
  try {
    const { limit = 20, page = 1, sortBy = 'value' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Xác định tiêu chí sắp xếp
    let sortCriteria = {};
    if (sortBy === 'value') {
      // Sắp xếp theo giá (chỉ NFT đang bán)
      sortCriteria = { forSale: -1, price: -1 };
    } else if (sortBy === 'popularity') {
      // Sắp xếp theo lượt thích và xem
      sortCriteria = { likeCount: -1, viewCount: -1 };
    } else if (sortBy === 'recent') {
      // Sắp xếp theo thời gian tạo mới nhất
      sortCriteria = { mintedAt: -1 };
    } else {
      // Mặc định là trending score
      sortCriteria = { trendScore: -1 };
    }

    // Lấy danh sách NFT
    const nfts = await NFTCache.find()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNumber);

    // Format response
    const leaderboard = await Promise.all(nfts.map(async (nft) => {
      // Lấy thông tin creator
      const creator = await User.findOne({ walletAddress: nft.creator.toLowerCase() })
        .select('username avatarURI isVerified');
      
      // Lấy thông tin owner
      const owner = await User.findOne({ walletAddress: nft.owner.toLowerCase() })
        .select('username avatarURI isVerified');

      return {
        tokenId: nft.tokenId,
        name: nft.metadata.name,
        image: nft.metadata.image ? ipfsService.formatIPFSUrl(nft.metadata.image) : null,
        creator: {
          address: nft.creator,
          username: creator?.username || 'Unknown',
          avatarURI: creator?.avatarURI ? ipfsService.formatIPFSUrl(creator.avatarURI) : null,
          isVerified: creator?.isVerified || false
        },
        owner: {
          address: nft.owner,
          username: owner?.username || 'Unknown',
          avatarURI: owner?.avatarURI ? ipfsService.formatIPFSUrl(owner.avatarURI) : null,
          isVerified: owner?.isVerified || false
        },
        forSale: nft.forSale,
        price: nft.price,
        likeCount: nft.likeCount,
        viewCount: nft.viewCount,
        mintedAt: nft.mintedAt
      };
    }));

    // Lấy tổng số NFT
    const total = await NFTCache.countDocuments();

    res.status(200).json({
      leaderboard,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      },
      sortBy
    });
  } catch (error) {
    console.error('Error getting NFT leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lấy bảng xếp hạng bài đăng dựa trên lượt thích, comment và tương tác
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getPostLeaderboard = async (req, res) => {
  try {
    const { limit = 20, page = 1, period = 'weekly' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Xác định thời điểm bắt đầu dựa trên period
    let startDate = new Date();
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'alltime') {
      startDate = new Date(0); // Từ đầu thời gian
    }

    // Tính toán trending score cho bài đăng
    const trendingPosts = await Post.aggregate([
      // Chỉ lấy bài đăng active và trong khoảng thời gian
      { 
        $match: { 
          status: 'active',
          createdAt: { $gte: startDate } 
        } 
      },
      
      // Tính toán trending score
      {
        $addFields: {
          // Formula: (likes*3 + comments*2 + saves + views/10) / (age in hours + 2)^1.5
          ageInHours: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $divide: [
              { $add: [
                { $multiply: ['$stats.likeCount', 3] },
                { $multiply: ['$stats.commentCount', 2] },
                '$stats.saveCount',
                { $divide: [{ $ifNull: ['$viewCount', 0] }, 10] }
              ]},
              { $pow: [{ $add: ['$ageInHours', 2] }, 1.5] }
            ]
          }
        }
      },
      
      // Sort by trending score
      { $sort: { trendingScore: -1 } },
      
      // Paginate
      { $skip: skip },
      { $limit: limitNumber }
    ]);

    // Lấy thông tin authors
    const authorAddresses = [...new Set(trendingPosts.map(post => post.author))];
    const authors = await User.find({
      walletAddress: { $in: authorAddresses }
    }).select('walletAddress username avatarURI isVerified');
    
    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author;
    });

    // Format response
    const leaderboard = trendingPosts.map(post => {
      const author = authorsMap[post.author];
      
      return {
        _id: post._id,
        author: post.author,
        authorDetails: author ? {
          username: author.username,
          avatarURI: author.avatarURI ? ipfsService.formatIPFSUrl(author.avatarURI) : null,
          isVerified: author.isVerified
        } : null,
        content: post.content,
        media: post.media && post.media.length > 0 ? 
          post.media.map(m => ({
            ...m,
            uri: ipfsService.formatIPFSUrl(m.uri)
          })) : [],
        stats: post.stats,
        trendingScore: Math.round(post.trendingScore * 100) / 100,
        createdAt: post.createdAt
      };
    });

    // Lấy tổng số bài đăng thỏa điều kiện
    const total = await Post.countDocuments({ 
      status: 'active',
      createdAt: { $gte: startDate } 
    });

    res.status(200).json({
      leaderboard,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      },
      period
    });
  } catch (error) {
    console.error('Error getting post leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lấy bảng xếp hạng các tags phổ biến
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getTagLeaderboard = async (req, res) => {
  try {
    const { limit = 20, period = 'weekly' } = req.query;
    const limitNumber = parseInt(limit);

    // Xác định thời điểm bắt đầu dựa trên period
    let startDate = new Date();
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'alltime') {
      startDate = new Date(0); // Từ đầu thời gian
    }

    // Lấy các tags phổ biến và số lượng sử dụng
    const popularTags = await Post.aggregate([
      { 
        $match: { 
          status: 'active',
          createdAt: { $gte: startDate },
          tags: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 },
          likes: { $sum: '$stats.likeCount' },
          comments: { $sum: '$stats.commentCount' },
          saves: { $sum: '$stats.saveCount' }
        } 
      },
      { 
        $project: {
          tag: '$_id',
          count: 1,
          likes: 1,
          comments: 1,
          saves: 1,
          score: { 
            $add: [
              '$count',
              { $multiply: ['$likes', 0.5] },
              { $multiply: ['$comments', 0.3] },
              { $multiply: ['$saves', 0.2] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limitNumber }
    ]);

    // Format response
    const leaderboard = popularTags.map(item => ({
      tag: item.tag,
      postCount: item.count,
      likes: item.likes,
      comments: item.comments,
      saves: item.saves,
      score: Math.round(item.score * 100) / 100
    }));

    res.status(200).json({
      leaderboard,
      period
    });
  } catch (error) {
    console.error('Error getting tag leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lấy thứ hạng của người dùng hiện tại trên leaderboard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCurrentUserRank = async (req, res) => {
  try {
    const walletAddress = req.user.address.toLowerCase();
    
    // Lấy thông tin user hiện tại
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.points <= 0) {
      return res.status(200).json({ 
        rank: null,
        points: 0,
        message: 'User has no points yet' 
      });
    }
    
    // Đếm số người dùng có điểm cao hơn
    const higherRankedUsers = await User.countDocuments({
      status: 'active',
      points: { $gt: user.points }
    });
    
    // Thứ hạng = số người có điểm cao hơn + 1
    const rank = higherRankedUsers + 1;
    
    // Lấy top 3 (để so sánh)
    const topUsers = await User.find({ status: 'active' })
      .sort({ points: -1 })
      .limit(3)
      .select('walletAddress username points');
    
    // Tính điểm cần để lên hạng tiếp theo
    let pointsToNextRank = null;
    if (rank > 1) {
      const nextRankUser = await User.findOne({
        status: 'active',
        points: { $gt: user.points }
      }).sort({ points: 1 }).select('points');
      
      if (nextRankUser) {
        pointsToNextRank = nextRankUser.points - user.points;
      }
    }
    
    res.status(200).json({
      rank,
      points: user.points,
      topUsers: topUsers.map(u => ({
        walletAddress: u.walletAddress,
        username: u.username,
        points: u.points
      })),
      pointsToNextRank
    });
  } catch (error) {
    console.error('Error getting user rank:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;