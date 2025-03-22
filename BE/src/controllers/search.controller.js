// TODO: cần tách code controller và services
const User = require('../models/User');
const Post = require('../models/Post');
const NFTCache = require('../models/NFTCache');
const Comment = require('../models/Comment');
const ipfsService = require('../services/ipfsService');
const addressUtils = require('../utils/addressUtils');

/**
 * Tìm kiếm tổng hợp (users, posts, NFTs, tags)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.search = async (req, res) => {
  try {
    const { query, type, limit = 10, page = 1 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Chuỗi tìm kiếm phải có ít nhất 2 ký tự' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchLimit = parseInt(limit);
    
    const results = {};
    
    // Tìm kiếm người dùng
    if (!type || type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { ensName: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ],
        status: 'active'
      })
      .select('walletAddress username ensName avatarURI bio isVerified followerCount')
      .sort({ followerCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(searchLimit);
      
      const totalUsers = await User.countDocuments({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { ensName: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ],
        status: 'active'
      });
      
      results.users = {
        items: users.map(user => ({
          walletAddress: user.walletAddress,
          username: user.username,
          ensName: user.ensName,
          avatarURI: user.avatarURI ? ipfsService.formatIPFSUrl(user.avatarURI) : null,
          bio: user.bio,
          isVerified: user.isVerified,
          followerCount: user.followerCount
        })),
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: searchLimit,
          pages: Math.ceil(totalUsers / searchLimit)
        }
      };
    }
    
    // Tìm kiếm bài viết
    if (!type || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ],
        status: 'active'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(searchLimit);
      
      const totalPosts = await Post.countDocuments({
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ],
        status: 'active'
      });
      
      // Lấy thông tin author cho mỗi post
      const postResults = await Promise.all(posts.map(async (post) => {
        const author = await User.findOne({ walletAddress: post.author });
        
        // Kiểm tra xem người dùng đã like/save bài đăng chưa (nếu đã đăng nhập)
        let isLiked = false;
        let isSaved = false;
        
        if (req.user) {
          const userAddress = req.user.address.toLowerCase();
          isLiked = post.likedBy.some(like => like.walletAddress === userAddress);
          isSaved = post.savedBy.some(save => save.walletAddress === userAddress);
        }
        
        return {
          _id: post._id,
          author: post.author,
          authorDetails: author ? {
            username: author.username,
            avatarURI: author.avatarURI ? ipfsService.formatIPFSUrl(author.avatarURI) : null,
            isVerified: author.isVerified
          } : null,
          content: post.content,
          contentURI: post.contentURI,
          media: post.media.map(media => ({
            ...media,
            uri: ipfsService.formatIPFSUrl(media.uri)
          })),
          tags: post.tags,
          stats: post.stats,
          isLiked,
          isSaved,
          createdAt: post.createdAt
        };
      }));
      
      results.posts = {
        items: postResults,
        pagination: {
          total: totalPosts,
          page: parseInt(page),
          limit: searchLimit,
          pages: Math.ceil(totalPosts / searchLimit)
        }
      };
    }
    
    // Tìm kiếm NFTs
    if (!type || type === 'nfts') {
      const nfts = await NFTCache.find({
        $or: [
          { 'metadata.name': { $regex: query, $options: 'i' } },
          { 'metadata.description': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ mintedAt: -1 })
      .skip(skip)
      .limit(searchLimit);
      
      const totalNFTs = await NFTCache.countDocuments({
        $or: [
          { 'metadata.name': { $regex: query, $options: 'i' } },
          { 'metadata.description': { $regex: query, $options: 'i' } }
        ]
      });
      
      results.nfts = {
        items: nfts.map(nft => ({
          tokenId: nft.tokenId,
          creator: nft.creator,
          owner: nft.owner,
          metadata: {
            name: nft.metadata.name,
            description: nft.metadata.description,
            image: nft.metadata.image ? ipfsService.formatIPFSUrl(nft.metadata.image) : null
          },
          mediaType: nft.mediaType,
          forSale: nft.forSale,
          price: nft.price,
          royaltyPercent: nft.royaltyPercent,
          mintedAt: nft.mintedAt
        })),
        pagination: {
          total: totalNFTs,
          page: parseInt(page),
          limit: searchLimit,
          pages: Math.ceil(totalNFTs / searchLimit)
        }
      };
    }
    
    // Tìm kiếm tags
    if (!type || type === 'tags') {
      // Aggregation để lấy tags phổ biến
      const tagsAggregation = await Post.aggregate([
        { $match: { 
          tags: { $regex: query, $options: 'i' },
          status: 'active'
        }},
        { $unwind: '$tags' },
        { $match: { tags: { $regex: query, $options: 'i' } }},
        { $group: { _id: '$tags', count: { $sum: 1 } }},
        { $sort: { count: -1 }},
        { $limit: searchLimit }
      ]);
      
      results.tags = {
        items: tagsAggregation.map(tag => ({
          name: tag._id,
          postCount: tag.count
        }))
      };
    }
    
    // Tìm kiếm comments
    if (type === 'comments') {
      const comments = await Comment.find({
        content: { $regex: query, $options: 'i' },
        status: 'active'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(searchLimit);
      
      const totalComments = await Comment.countDocuments({
        content: { $regex: query, $options: 'i' },
        status: 'active'
      });
      
      // Lấy thông tin author và post cho mỗi comment
      const commentResults = await Promise.all(comments.map(async (comment) => {
        const author = await User.findOne({ walletAddress: comment.author });
        const post = await Post.findOne({ _id: comment.postId });
        
        return {
          _id: comment._id,
          postId: comment.postId,
          postTitle: post ? (post.content.slice(0, 50) + (post.content.length > 50 ? '...' : '')) : null,
          author: comment.author,
          authorDetails: author ? {
            username: author.username,
            avatarURI: author.avatarURI ? ipfsService.formatIPFSUrl(author.avatarURI) : null,
            isVerified: author.isVerified
          } : null,
          content: comment.content,
          depth: comment.depth,
          stats: comment.stats,
          createdAt: comment.createdAt
        };
      }));
      
      results.comments = {
        items: commentResults,
        pagination: {
          total: totalComments,
          page: parseInt(page),
          limit: searchLimit,
          pages: Math.ceil(totalComments / searchLimit)
        }
      };
    }
    
    // Tìm kiếm địa chỉ ví
    if (type === 'address' && addressUtils.isValidEthereumAddress(query)) {
      // Chuẩn hóa địa chỉ
      const address = addressUtils.normalizeAddress(query);
      
      // Tìm user với địa chỉ này
      const user = await User.findOne({ walletAddress: address });
      
      if (user) {
        results.addressMatch = {
          found: true,
          user: {
            walletAddress: user.walletAddress,
            username: user.username,
            ensName: user.ensName,
            avatarURI: user.avatarURI ? ipfsService.formatIPFSUrl(user.avatarURI) : null,
            isVerified: user.isVerified
          }
        };
      } else {
        results.addressMatch = {
          found: false,
          address
        };
      }
    }
    
    res.status(200).json({
      query,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm' });
  }
};

/**
 * Tìm kiếm người dùng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query, limit = 10, page = 1, sortBy = 'followers' } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Chuỗi tìm kiếm phải có ít nhất 2 ký tự' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Xác định cách sắp xếp
    let sort = { followerCount: -1 };
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'points') {
      sort = { points: -1 };
    }
    
    // Tìm kiếm người dùng
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { ensName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    })
    .select('walletAddress username ensName avatarURI bio isVerified followerCount followingCount subscription.level createdAt')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
    
    const totalUsers = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { ensName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    });
    
    // Kiểm tra xem người dùng hiện tại có follow những users này không
    const formattedUsers = users.map(user => {
      let isFollowing = false;
      
      if (req.user) {
        isFollowing = req.user.following && 
          req.user.following.includes(user.walletAddress.toLowerCase());
      }
      
      return {
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI ? ipfsService.formatIPFSUrl(user.avatarURI) : null,
        bio: user.bio,
        isVerified: user.isVerified,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        subscriptionLevel: user.subscription?.level || 1,
        isFollowing,
        createdAt: user.createdAt
      };
    });
    
    res.status(200).json({
      users: formattedUsers,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalUsers / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm người dùng' });
  }
};

/**
 * Tìm kiếm posts
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.searchPosts = async (req, res) => {
  try {
    const { query, limit = 10, page = 1, sortBy = 'recent', withMedia, hasNFT } = req.query;
    
    if (!query && !withMedia && !hasNFT) {
      return res.status(400).json({ error: 'Phải cung cấp ít nhất một tiêu chí tìm kiếm' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Xây dựng query
    const searchQuery = { status: 'active' };
    
    if (query && query.length >= 2) {
      searchQuery.$or = [
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (withMedia === 'true') {
      searchQuery['media.0'] = { $exists: true };
    }
    
    if (hasNFT === 'true') {
      searchQuery['linkedNFT'] = { $exists: true };
    }
    
    // Xác định cách sắp xếp
    let sort = { createdAt: -1 }; // Mặc định: gần đây nhất
    if (sortBy === 'trending') {
      sort = { trendScore: -1 };
    } else if (sortBy === 'popular') {
      sort = { 'stats.likeCount': -1 };
    }
    
    // Tìm kiếm posts
    const posts = await Post.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalPosts = await Post.countDocuments(searchQuery);
    
    // Lấy thông tin author cho mỗi post
    const authorAddresses = [...new Set(posts.map(post => post.author))];
    const authors = await User.find({ 
      walletAddress: { $in: authorAddresses } 
    }).select('walletAddress username avatarURI isVerified');
    
    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author;
    });
    
    // Format kết quả
    const formattedPosts = await Promise.all(posts.map(async (post) => {
      const author = authorsMap[post.author];
      
      // Kiểm tra xem người dùng đã like/save bài đăng chưa (nếu đã đăng nhập)
      let isLiked = false;
      let isSaved = false;
      
      if (req.user) {
        const userAddress = req.user.address.toLowerCase();
        isLiked = post.likedBy.some(like => like.walletAddress === userAddress);
        isSaved = post.savedBy.some(save => save.walletAddress === userAddress);
      }
      
      return {
        _id: post._id,
        author: post.author,
        authorDetails: author ? {
          username: author.username,
          avatarURI: author.avatarURI ? ipfsService.formatIPFSUrl(author.avatarURI) : null,
          isVerified: author.isVerified
        } : null,
        content: post.content,
        contentURI: post.contentURI,
        media: post.media.map(media => ({
          ...media,
          uri: ipfsService.formatIPFSUrl(media.uri)
        })),
        tags: post.tags,
        stats: post.stats,
        linkedNFT: post.linkedNFT,
        isLiked,
        isSaved,
        createdAt: post.createdAt
      };
    }));
    
    res.status(200).json({
      posts: formattedPosts,
      pagination: {
        total: totalPosts,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalPosts / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Post search error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm bài đăng' });
  }
};

/**
 * Tìm kiếm NFTs
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.searchNFTs = async (req, res) => {
  try {
    const { 
      query, 
      limit = 10, 
      page = 1, 
      sortBy = 'recent', 
      forSale, 
      mediaType, 
      minPrice, 
      maxPrice 
    } = req.query;
    
    if (!query && !forSale && !mediaType && !minPrice && !maxPrice) {
      return res.status(400).json({ error: 'Phải cung cấp ít nhất một tiêu chí tìm kiếm' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Xây dựng query
    const searchQuery = {};
    
    if (query && query.length >= 2) {
      searchQuery.$or = [
        { 'metadata.name': { $regex: query, $options: 'i' } },
        { 'metadata.description': { $regex: query, $options: 'i' } }
      ];
    }
    
    if (forSale === 'true') {
      searchQuery.forSale = true;
    }
    
    if (mediaType) {
      searchQuery.mediaType = mediaType;
    }
    
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = minPrice;
      if (maxPrice) searchQuery.price.$lte = maxPrice;
    }
    
    // Xác định cách sắp xếp
    let sort = { mintedAt: -1 }; // Mặc định: gần đây nhất
    if (sortBy === 'trending') {
      sort = { trendScore: -1 };
    } else if (sortBy === 'price-asc') {
      sort = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sort = { price: -1 };
    }
    
    // Tìm kiếm NFTs
    const nfts = await NFTCache.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalNFTs = await NFTCache.countDocuments(searchQuery);
    
    // Lấy thông tin creator và owner cho mỗi NFT
    const addresses = [...new Set([
      ...nfts.map(nft => nft.creator),
      ...nfts.map(nft => nft.owner)
    ])];
    
    const users = await User.find({ 
      walletAddress: { $in: addresses } 
    }).select('walletAddress username avatarURI isVerified');
    
    const usersMap = {};
    users.forEach(user => {
      usersMap[user.walletAddress] = user;
    });
    
    // Format kết quả
    const formattedNFTs = nfts.map(nft => {
      const creator = usersMap[nft.creator];
      const owner = usersMap[nft.owner];
      
      return {
        tokenId: nft.tokenId,
        creator: nft.creator,
        creatorDetails: creator ? {
          username: creator.username,
          avatarURI: creator.avatarURI ? ipfsService.formatIPFSUrl(creator.avatarURI) : null,
          isVerified: creator.isVerified
        } : null,
        owner: nft.owner,
        ownerDetails: owner ? {
          username: owner.username,
          avatarURI: owner.avatarURI ? ipfsService.formatIPFSUrl(owner.avatarURI) : null,
          isVerified: owner.isVerified
        } : null,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: nft.metadata.image ? ipfsService.formatIPFSUrl(nft.metadata.image) : null
        },
        mediaType: nft.mediaType,
        forSale: nft.forSale,
        price: nft.price,
        royaltyPercent: nft.royaltyPercent,
        trendScore: nft.trendScore,
        mintedAt: nft.mintedAt
      };
    });
    
    res.status(200).json({
      nfts: formattedNFTs,
      pagination: {
        total: totalNFTs,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalNFTs / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('NFT search error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm NFT' });
  }
};

/**
 * Tìm kiếm tags
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.searchTags = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Chuỗi tìm kiếm phải có ít nhất 2 ký tự' });
    }
    
    // Tìm tags phổ biến
    const tagsAggregation = await Post.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: query, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const formattedTags = tagsAggregation.map(tag => ({
      name: tag._id,
      postCount: tag.count
    }));
    
    res.status(200).json({ tags: formattedTags });
  } catch (error) {
    console.error('Tag search error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm tags' });
  }
};

/**
 * Lấy trending tags
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getTrendingTags = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Tìm tags phổ biến trong 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const tagsAggregation = await Post.aggregate([
      { 
        $match: { 
          status: 'active',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const formattedTags = tagsAggregation.map(tag => ({
      name: tag._id,
      postCount: tag.count
    }));
    
    res.status(200).json({ tags: formattedTags });
  } catch (error) {
    console.error('Trending tags error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy trending tags' });
  }
};

module.exports = exports;