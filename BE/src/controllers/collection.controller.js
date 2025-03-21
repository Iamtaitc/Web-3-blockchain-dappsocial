// src/controllers/collectionController.js
const Collection = require('../models/Collection');
const NFTCache = require('../models/NFTCache');
const User = require('../models/User');
const ipfsService = require('../services/ipfsService');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Tạo bộ sưu tập NFT mới
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.createCollection = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, category, isPublic } = req.body;
    const walletAddress = req.user.address;
    
    // Kiểm tra số lượng bộ sưu tập (giới hạn mỗi user tạo 20 bộ sưu tập)
    const collectionsCount = await Collection.countDocuments({ 
      creator: walletAddress.toLowerCase() 
    });
    
    if (collectionsCount >= 20) {
      return res.status(400).json({ 
        error: 'Bạn đã đạt giới hạn số lượng bộ sưu tập (20)' 
      });
    }
    
    // Upload hình ảnh lên IPFS nếu có
    let bannerCID = null;
    let thumbnailCID = null;
    
    if (req.files) {
      if (req.files.banner) {
        bannerCID = await ipfsService.uploadFile(
          req.files.banner.data,
          req.files.banner.name
        );
      }
      
      if (req.files.thumbnail) {
        thumbnailCID = await ipfsService.uploadFile(
          req.files.thumbnail.data,
          req.files.thumbnail.name
        );
      }
    }
    
    // Tạo collection mới
    const newCollection = new Collection({
      name,
      description,
      category: category || 'other',
      creator: walletAddress.toLowerCase(),
      isPublic: isPublic !== false, // Mặc định là public
      bannerURI: bannerCID ? `ipfs://${bannerCID}` : null,
      thumbnailURI: thumbnailCID ? `ipfs://${thumbnailCID}` : null,
      nftCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newCollection.save();
    
    // Format response
    const response = {
      _id: newCollection._id,
      name: newCollection.name,
      description: newCollection.description,
      category: newCollection.category,
      creator: newCollection.creator,
      isPublic: newCollection.isPublic,
      bannerURL: newCollection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(newCollection.bannerURI) : null,
      thumbnailURL: newCollection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(newCollection.thumbnailURI) : null,
      nftCount: 0,
      createdAt: newCollection.createdAt
    };
    
    res.status(201).json({
      message: 'Bộ sưu tập đã được tạo thành công',
      collection: response
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Lỗi khi tạo bộ sưu tập' });
  }
};

/**
 * Cập nhật thông tin bộ sưu tập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.updateCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { name, description, category, isPublic } = req.body;
    const walletAddress = req.user.address;
    
    // Kiểm tra bộ sưu tập có tồn tại không
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ error: 'Bộ sưu tập không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu
    if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật bộ sưu tập này' });
    }
    
    // Upload hình ảnh mới nếu có
    let bannerCID = null;
    let thumbnailCID = null;
    
    if (req.files) {
      if (req.files.banner) {
        bannerCID = await ipfsService.uploadFile(
          req.files.banner.data,
          req.files.banner.name
        );
      }
      
      if (req.files.thumbnail) {
        thumbnailCID = await ipfsService.uploadFile(
          req.files.thumbnail.data,
          req.files.thumbnail.name
        );
      }
    }
    
    // Cập nhật thông tin
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (bannerCID) updateData.bannerURI = `ipfs://${bannerCID}`;
    if (thumbnailCID) updateData.thumbnailURI = `ipfs://${thumbnailCID}`;
    
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { $set: updateData },
      { new: true }
    );
    
    // Format response
    const response = {
      _id: updatedCollection._id,
      name: updatedCollection.name,
      description: updatedCollection.description,
      category: updatedCollection.category,
      creator: updatedCollection.creator,
      isPublic: updatedCollection.isPublic,
      bannerURL: updatedCollection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(updatedCollection.bannerURI) : null,
      thumbnailURL: updatedCollection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(updatedCollection.thumbnailURI) : null,
      nftCount: updatedCollection.nftCount,
      createdAt: updatedCollection.createdAt,
      updatedAt: updatedCollection.updatedAt
    };
    
    res.status(200).json({
      message: 'Bộ sưu tập đã được cập nhật thành công',
      collection: response
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật bộ sưu tập' });
  }
};

/**
 * Lấy thông tin của một bộ sưu tập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.getCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    // Lấy thông tin bộ sưu tập
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ error: 'Bộ sưu tập không tồn tại' });
    }
    
    // Kiểm tra quyền truy cập nếu bộ sưu tập private
    if (!collection.isPublic) {
      // Nếu không đăng nhập hoặc không phải creator
      if (!req.user || req.user.address.toLowerCase() !== collection.creator.toLowerCase()) {
        return res.status(403).json({ error: 'Bạn không có quyền xem bộ sưu tập này' });
      }
    }
    
    // Lấy thông tin creator
    const creator = await User.findOne({ walletAddress: collection.creator });
    
    // Lấy NFTs trong bộ sưu tập (giới hạn 8 NFT cho preview)
    const nfts = await NFTCache.find({ collectionId: collection._id })
      .sort({ mintedAt: -1 })
      .limit(8);
    
    // Format NFTs
    const formattedNFTs = nfts.map(nft => ({
      tokenId: nft.tokenId,
      name: nft.metadata.name,
      image: nft.metadata.image ? ipfsService.ipfsUriToGatewayUrl(nft.metadata.image) : null,
      creator: nft.creator,
      owner: nft.owner,
      forSale: nft.forSale,
      price: nft.price
    }));
    
    // Format response
    const response = {
      _id: collection._id,
      name: collection.name,
      description: collection.description,
      category: collection.category,
      creator: collection.creator,
      creatorDetails: creator ? {
        username: creator.username,
        avatarURI: creator.avatarURI ? ipfsService.ipfsUriToGatewayUrl(creator.avatarURI) : null,
        isVerified: creator.isVerified
      } : null,
      isPublic: collection.isPublic,
      bannerURL: collection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(collection.bannerURI) : null,
      thumbnailURL: collection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(collection.thumbnailURI) : null,
      nftCount: collection.nftCount,
      preview: formattedNFTs,
      floorPrice: collection.floorPrice || '0',
      volume: collection.volume || '0',
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    };
    
    res.status(200).json({ collection: response });
  } catch (error) {
    console.error('Error getting collection:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin bộ sưu tập' });
  }
};

/**
 * Lấy tất cả NFTs trong một bộ sưu tập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.getCollectionNFTs = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Lấy thông tin bộ sưu tập
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ error: 'Bộ sưu tập không tồn tại' });
    }
    
    // Kiểm tra quyền truy cập nếu bộ sưu tập private
    if (!collection.isPublic) {
      // Nếu không đăng nhập hoặc không phải creator
      if (!req.user || req.user.address.toLowerCase() !== collection.creator.toLowerCase()) {
        return res.status(403).json({ error: 'Bạn không có quyền xem bộ sưu tập này' });
      }
    }
    
    // Sort options
    const sortOptions = {};
    const sortBy = req.query.sortBy || 'mintedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder;
        break;
      case 'name':
        sortOptions['metadata.name'] = sortOrder;
        break;
      case 'mintedAt':
      default:
        sortOptions.mintedAt = sortOrder;
    }
    
    // Filter options
    const filter = { collectionId: collection._id };
    
    if (req.query.forSale === 'true') {
      filter.forSale = true;
    }
    
    // Lấy NFTs trong bộ sưu tập
    const nfts = await NFTCache.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Đếm tổng số NFTs
    const total = await NFTCache.countDocuments(filter);
    
    // Format NFTs
    const formattedNFTs = await Promise.all(nfts.map(async (nft) => {
      const owner = await User.findOne({ walletAddress: nft.owner });
      
      return {
        tokenId: nft.tokenId,
        name: nft.metadata.name,
        description: nft.metadata.description,
        image: nft.metadata.image ? ipfsService.ipfsUriToGatewayUrl(nft.metadata.image) : null,
        creator: nft.creator,
        owner: nft.owner,
        ownerDetails: owner ? {
          username: owner.username,
          avatarURI: owner.avatarURI ? ipfsService.ipfsUriToGatewayUrl(owner.avatarURI) : null
        } : null,
        forSale: nft.forSale,
        price: nft.price,
        mediaType: nft.mediaType,
        mintedAt: nft.mintedAt
      };
    }));
    
    res.status(200).json({
      nfts: formattedNFTs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting collection NFTs:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách NFT trong bộ sưu tập' });
  }
};

/**
 * Thêm NFT vào bộ sưu tập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.addNFTToCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { tokenId } = req.body;
    const walletAddress = req.user.address;
    
    // Kiểm tra bộ sưu tập có tồn tại không
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ error: 'Bộ sưu tập không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu bộ sưu tập
    if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Bạn không có quyền thêm NFT vào bộ sưu tập này' });
    }
    
    // Kiểm tra NFT có tồn tại không
    const nft = await NFTCache.findOne({ tokenId });
    
    if (!nft) {
      return res.status(404).json({ error: 'NFT không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu NFT
    if (nft.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Bạn chỉ có thể thêm NFT bạn tạo vào bộ sưu tập' });
    }
    
    // Kiểm tra NFT đã nằm trong bộ sưu tập nào chưa
    if (nft.collectionId) {
      // Nếu đã thuộc bộ sưu tập này rồi
      if (nft.collectionId.toString() === collectionId) {
        return res.status(400).json({ error: 'NFT đã nằm trong bộ sưu tập này' });
      }
      
      // Nếu đang thuộc bộ sưu tập khác, cập nhật số lượng của bộ sưu tập cũ
      await Collection.findByIdAndUpdate(
        nft.collectionId,
        { $inc: { nftCount: -1 } }
      );
    }
    
    // Cập nhật NFT để thêm vào bộ sưu tập
    await NFTCache.findOneAndUpdate(
      { tokenId },
      { $set: { collectionId, updatedAt: new Date() } }
    );
    
    // Cập nhật số lượng NFT trong bộ sưu tập
    await Collection.findByIdAndUpdate(
      collectionId,
      { $inc: { nftCount: 1 }, $set: { updatedAt: new Date() } }
    );
    
    res.status(200).json({
      message: 'NFT đã được thêm vào bộ sưu tập thành công',
      tokenId,
      collectionId
    });
  } catch (error) {
    console.error('Error adding NFT to collection:', error);
    res.status(500).json({ error: 'Lỗi khi thêm NFT vào bộ sưu tập' });
  }
};

/**
 * Xóa NFT khỏi bộ sưu tập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.removeNFTFromCollection = async (req, res) => {
  try {
    const { collectionId, tokenId } = req.params;
    const walletAddress = req.user.address;
    
    // Kiểm tra bộ sưu tập có tồn tại không
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ error: 'Bộ sưu tập không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu bộ sưu tập
    if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa NFT khỏi bộ sưu tập này' });
    }
    
    // Kiểm tra NFT có tồn tại không và đang thuộc bộ sưu tập này không
    const nft = await NFTCache.findOne({ 
      tokenId,
      collectionId
    });
    
    if (!nft) {
      return res.status(404).json({ error: 'NFT không tồn tại hoặc không thuộc bộ sưu tập này' });
    }
    
    // Xóa NFT khỏi bộ sưu tập
    await NFTCache.findOneAndUpdate(
      { tokenId },
      { $unset: { collectionId: "" }, $set: { updatedAt: new Date() } }
    );
    
    // Cập nhật số lượng NFT trong bộ sưu tập
    await Collection.findByIdAndUpdate(
      collectionId,
      { $inc: { nftCount: -1 }, $set: { updatedAt: new Date() } }
    );
    
    res.status(200).json({
      message: 'NFT đã được xóa khỏi bộ sưu tập thành công',
      tokenId,
      collectionId
    });
  } catch (error) {
    console.error('Error removing NFT from collection:', error);
    res.status(500).json({ error: 'Lỗi khi xóa NFT khỏi bộ sưu tập' });
  }
};

/**
 * Xóa bộ sưu tập
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const walletAddress = req.user.address;
    
    // Kiểm tra bộ sưu tập có tồn tại không
    const collection = await Collection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ error: 'Bộ sưu tập không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu bộ sưu tập
    if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bộ sưu tập này' });
    }
    
    // Sử dụng session để đảm bảo atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Xóa tham chiếu collectionId từ tất cả NFTs
      await NFTCache.updateMany(
        { collectionId },
        { $unset: { collectionId: "" } },
        { session }
      );
      
      // Xóa bộ sưu tập
      await Collection.findByIdAndDelete(collectionId, { session });
      
      // Commit transaction
      await session.commitTransaction();
    } catch (error) {
      // Abort transaction nếu có lỗi
      await session.abortTransaction();
      throw error;
    } finally {
      // Kết thúc session
      session.endSession();
    }
    
    res.status(200).json({
      message: 'Bộ sưu tập đã được xóa thành công',
      collectionId
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Lỗi khi xóa bộ sưu tập' });
  }
};

/**
 * Lấy tất cả bộ sưu tập của một người dùng
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.getUserCollections = async (req, res) => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Xây dựng filter
    const filter = { creator: address.toLowerCase() };
    
    // Nếu không phải chủ sở hữu, chỉ hiển thị bộ sưu tập public
    if (!req.user || req.user.address.toLowerCase() !== address.toLowerCase()) {
      filter.isPublic = true;
    }
    
    // Lấy bộ sưu tập của user
    const collections = await Collection.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Đếm tổng số bộ sưu tập
    const total = await Collection.countDocuments(filter);
    
    // Format collections
    const formattedCollections = collections.map(collection => ({
      _id: collection._id,
      name: collection.name,
      description: collection.description,
      category: collection.category,
      creator: collection.creator,
      isPublic: collection.isPublic,
      bannerURL: collection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(collection.bannerURI) : null,
      thumbnailURL: collection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(collection.thumbnailURI) : null,
      nftCount: collection.nftCount,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    }));
    
    res.status(200).json({
      collections: formattedCollections,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user collections:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bộ sưu tập của người dùng' });
  }
};

/**
 * Lấy danh sách tất cả bộ sưu tập (public)
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.getAllCollections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Lọc category nếu có
    const filter = { isPublic: true };
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    
    // Sort options
    const sortOptions = {};
    const sortBy = req.query.sortBy || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'nftCount':
        sortOptions.nftCount = sortOrder;
        break;
      case 'createdAt':
        sortOptions.createdAt = sortOrder;
        break;
      case 'name':
        sortOptions.name = sortOrder;
        break;
      case 'updatedAt':
      default:
        sortOptions.updatedAt = sortOrder;
    }
    
    // Lấy collections
    const collections = await Collection.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Đếm tổng số collections
    const total = await Collection.countDocuments(filter);
    
    // Lấy thông tin creators
    const creatorAddresses = [...new Set(collections.map(c => c.creator))];
    const creators = await User.find({ 
      walletAddress: { $in: creatorAddresses } 
    }).select('walletAddress username avatarURI isVerified');
    
    const creatorsMap = {};
    creators.forEach(creator => {
      creatorsMap[creator.walletAddress] = creator;
    });
    
    // Format collections
    const formattedCollections = collections.map(collection => {
      const creator = creatorsMap[collection.creator];
      
      return {
        _id: collection._id,
        name: collection.name,
        description: collection.description,
        category: collection.category,
        creator: collection.creator,
        creatorDetails: creator ? {
          username: creator.username,
          avatarURI: creator.avatarURI ? ipfsService.ipfsUriToGatewayUrl(creator.avatarURI) : null,
          isVerified: creator.isVerified
        } : null,
        bannerURL: collection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(collection.bannerURI) : null,
        thumbnailURL: collection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(collection.thumbnailURI) : null,
        nftCount: collection.nftCount,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      };
    });
    
    // Lấy thống kê cho các danh mục
    const categoryStats = await Collection.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      collections: formattedCollections,
      categories: categoryStats.map(stat => ({
        category: stat._id,
        count: stat.count
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all collections:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bộ sưu tập' });
  }
};

/**
 * Xem các bộ sưu tập nổi bật
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
exports.getFeaturedCollections = async (req, res) => {
  try {
    // Lấy top 6 bộ sưu tập có nhiều NFT nhất
    const topCollections = await Collection.find({ 
      isPublic: true,
      nftCount: { $gt: 0 } 
    })
    .sort({ nftCount: -1, updatedAt: -1 })
    .limit(6);
    
    // Lấy top 6 bộ sưu tập mới nhất
    const newCollections = await Collection.find({ 
      isPublic: true 
    })
    .sort({ createdAt: -1 })
    .limit(6);
    
    // Lấy thông tin creators
    const creatorAddresses = [
      ...new Set([
        ...topCollections.map(c => c.creator),
        ...newCollections.map(c => c.creator)
      ])
    ];
    
    const creators = await User.find({ 
      walletAddress: { $in: creatorAddresses } 
    }).select('walletAddress username avatarURI isVerified');
    
    const creatorsMap = {};
    creators.forEach(creator => {
      creatorsMap[creator.walletAddress] = creator;
    });
    
    // Format collections
    const formatCollection = (collection) => {
        const creator = creatorsMap[collection.creator];
        
        return {
          _id: collection._id,
          name: collection.name,
          description: collection.description,
          category: collection.category,
          creator: collection.creator,
          creatorDetails: creator ? {
            username: creator.username,
            avatarURI: creator.avatarURI ? ipfsService.ipfsUriToGatewayUrl(creator.avatarURI) : null,
            isVerified: creator.isVerified
          } : null,
          bannerURL: collection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(collection.bannerURI) : null,
          thumbnailURL: collection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(collection.thumbnailURI) : null,
          nftCount: collection.nftCount,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt
        };
      };
      
      // Return formatted collections
      res.status(200).json({
        featured: {
          top: topCollections.map(formatCollection),
          new: newCollections.map(formatCollection),
        }
      });
    } catch (error) {
      console.error('Error getting featured collections:', error);
      res.status(500).json({ error: 'Lỗi khi lấy danh sách bộ sưu tập nổi bật' });
    }
  };
  
  /**
   * Tìm kiếm bộ sưu tập
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  exports.searchCollections = async (req, res) => {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' });
      }
      
      // Tìm kiếm collections
      const collections = await Collection.find({
        isPublic: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ nftCount: -1 })
      .skip(skip)
      .limit(limit);
      
      // Đếm tổng số kết quả
      const total = await Collection.countDocuments({
        isPublic: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
      
      // Lấy thông tin creators
      const creatorAddresses = [...new Set(collections.map(c => c.creator))];
      const creators = await User.find({ 
        walletAddress: { $in: creatorAddresses } 
      }).select('walletAddress username avatarURI isVerified');
      
      const creatorsMap = {};
      creators.forEach(creator => {
        creatorsMap[creator.walletAddress] = creator;
      });
      
      // Format collections
      const formattedCollections = collections.map(collection => {
        const creator = creatorsMap[collection.creator];
        
        return {
          _id: collection._id,
          name: collection.name,
          description: collection.description,
          category: collection.category,
          creator: collection.creator,
          creatorDetails: creator ? {
            username: creator.username,
            avatarURI: creator.avatarURI ? ipfsService.ipfsUriToGatewayUrl(creator.avatarURI) : null,
            isVerified: creator.isVerified
          } : null,
          bannerURL: collection.bannerURI ? ipfsService.ipfsUriToGatewayUrl(collection.bannerURI) : null,
          thumbnailURL: collection.thumbnailURI ? ipfsService.ipfsUriToGatewayUrl(collection.thumbnailURI) : null,
          nftCount: collection.nftCount,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt
        };
      });
      
      res.status(200).json({
        collections: formattedCollections,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error searching collections:', error);
      res.status(500).json({ error: 'Lỗi khi tìm kiếm bộ sưu tập' });
    }
  };
  
  /**
   * Cập nhật thông tin thống kê của bộ sưu tập
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  exports.updateCollectionStats = async (req, res) => {
    try {
      const { collectionId } = req.params;
      
      // Kiểm tra nếu người dùng là admin
      const walletAddress = req.user.address;
      const isAdmin = config.ADMIN_ADDRESSES.includes(walletAddress.toLowerCase());
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này' });
      }
      
      // Tính toán floor price (giá sàn)
      const floorPrice = await NFTCache.find({
        collectionId,
        forSale: true
      })
      .sort({ price: 1 })
      .limit(1)
      .then(nfts => nfts.length > 0 ? nfts[0].price : '0');
      
      // Tính tổng volume giao dịch
      const volume = await NFTCache.aggregate([
        { $match: { collectionId: mongoose.Types.ObjectId(collectionId) } },
        { $unwind: '$transactions' },
        { $match: { 'transactions.type': 'sale' } },
        { $group: {
            _id: null,
            totalVolume: { $sum: { $toDouble: '$transactions.price' } }
          }
        }
      ]).then(result => result.length > 0 ? result[0].totalVolume.toString() : '0');
      
      // Cập nhật thông tin bộ sưu tập
      await Collection.findByIdAndUpdate(collectionId, {
        $set: {
          floorPrice,
          volume,
          updatedAt: new Date()
        }
      });
      
      res.status(200).json({
        message: 'Thống kê bộ sưu tập đã được cập nhật',
        stats: {
          floorPrice,
          volume
        }
      });
    } catch (error) {
      console.error('Error updating collection stats:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật thống kê bộ sưu tập' });
    }
  };
  
  /**
   * Lấy danh mục bộ sưu tập
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  exports.getCategories = async (req, res) => {
    try {
      // Lấy số lượng bộ sưu tập theo từng danh mục
      const categories = await Collection.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Danh sách các danh mục cố định (để đảm bảo luôn có các danh mục chính)
      const defaultCategories = [
        'art', 'photography', 'gaming', 'music', 
        'sports', 'virtual worlds', 'collectibles', 'other'
      ];
      
      // Kết hợp danh mục từ database và danh mục mặc định
      const existingCategories = new Set(categories.map(c => c._id));
      
      // Thêm các danh mục mặc định nếu chưa có
      const formattedCategories = [...categories];
      
      for (const category of defaultCategories) {
        if (!existingCategories.has(category)) {
          formattedCategories.push({
            _id: category,
            count: 0
          });
        }
      }
      
      // Sắp xếp theo số lượng
      formattedCategories.sort((a, b) => b.count - a.count);
      
      res.status(200).json({
        categories: formattedCategories.map(category => ({
          name: category._id,
          count: category.count
        }))
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Lỗi khi lấy danh mục bộ sưu tập' });
    }
  };
  
  module.exports = exports;