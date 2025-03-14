const axios = require('axios');
const Post = require('../models/Post.mongoose');
const NFTCache = require('../models/NFTCache.mongoose');
const User = require('../models/User.mongoose');
const ipfsUtils = require('../utils/ipfs.utils');

/**
 * Lấy và cập nhật metadata từ IPFS vào database
 * @param {string} ipfsUri - URI của metadata trên IPFS
 * @param {string} type - Loại metadata ('post', 'comment', 'profile', 'nft')
 * @param {string} itemId - ID của item cần cập nhật
 */
const syncMetadataFromIPFS = async (ipfsUri, type, itemId) => {
  try {
    if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) {
      console.error('Invalid IPFS URI:', ipfsUri);
      return null;
    }
    
    // Chuyển đổi IPFS URI thành HTTP URL
    const gatewayUrl = ipfsUtils.ipfsUriToGatewayUrl(ipfsUri);
    
    // Fetch metadata từ IPFS gateway
    const response = await axios.get(gatewayUrl, { timeout: 10000 });
    
    if (!response.data) {
      console.error('No data returned from IPFS gateway');
      return null;
    }
    
    const metadata = response.data;
    
    // Cập nhật metadata vào database tùy theo loại
    switch (type) {
      case 'post':
        await updatePostMetadata(itemId, metadata);
        break;
      case 'nft':
        await updateNFTMetadata(itemId, metadata);
        break;
      case 'profile':
        await updateProfileMetadata(itemId, metadata);
        break;
      default:
        console.error('Unknown metadata type:', type);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error syncing metadata from IPFS:', error);
    return null;
  }
};

/**
 * Cập nhật metadata của bài đăng
 * @param {string} postId - ID của bài đăng
 * @param {object} metadata - Metadata từ IPFS
 */
const updatePostMetadata = async (postId, metadata) => {
  try {
    const updateData = {
      content: metadata.content,
      tags: metadata.tags || [],
      updatedAt: new Date()
    };
    
    // Cập nhật media nếu có
    if (metadata.media && Array.isArray(metadata.media)) {
      updateData.media = metadata.media.map(mediaUri => ({
        type: mediaUri.includes('image') ? 'image' : 
              mediaUri.includes('video') ? 'video' : 'audio',
        uri: mediaUri
      }));
    }
    
    // Cập nhật vào database
    await Post.findOneAndUpdate(
      { postId },
      { $set: updateData },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating post metadata:', error);
  }
};

/**
 * Cập nhật metadata của NFT
 * @param {string} tokenId - ID của NFT
 * @param {object} metadata - Metadata từ IPFS
 */
const updateNFTMetadata = async (tokenId, metadata) => {
  try {
    const updateData = {
      'metadata.name': metadata.name || '',
      'metadata.description': metadata.description || '',
      'metadata.image': metadata.image || '',
      lastUpdated: new Date()
    };
    
    // Cập nhật attributes nếu có
    if (metadata.attributes && Array.isArray(metadata.attributes)) {
      updateData['metadata.attributes'] = metadata.attributes;
    }
    
    // Cập nhật vào database
    await NFTCache.findOneAndUpdate(
      { tokenId },
      { $set: updateData },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating NFT metadata:', error);
  }
};

/**
 * Cập nhật metadata của profile
 * @param {string} walletAddress - Địa chỉ ví người dùng
 * @param {object} metadata - Metadata từ IPFS
 */
const updateProfileMetadata = async (walletAddress, metadata) => {
  try {
    const updateData = {
      username: metadata.username,
      bio: metadata.bio || '',
      updatedAt: new Date()
    };
    
    // Cập nhật avatar và cover nếu có
    if (metadata.avatar) {
      updateData.avatarURI = metadata.avatar;
    }
    
    if (metadata.cover) {
      updateData.coverURI = metadata.cover;
    }
    
    // Cập nhật vào database
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: updateData }
    );
  } catch (error) {
    console.error('Error updating profile metadata:', error);
  }
};

module.exports = {
  syncMetadataFromIPFS
};