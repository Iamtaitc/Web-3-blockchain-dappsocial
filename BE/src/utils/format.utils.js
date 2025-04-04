const { User } = require('../models/index');
const IPFSService = require('../services/ipfs.services');

/**
 * Lớp tiện ích xử lý định dạng dữ liệu
 */
class FormatUtils {

  /**
   * Tạo đối tượng phân trang
   * @param {Number} totalItems - Tổng số item
   * @param {Number} currentPage - Trang hiện tại
   * @param {Number} pageSize - Kích thước trang
   * @returns {Object} Đối tượng phân trang
   */
  createPagination(totalItems, currentPage, pageSize) {
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return {
      total: totalItems,
      page: currentPage,
      limit: pageSize,
      pages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }

  /**
   * Định dạng dữ liệu user cơ bản
   * @param {Object} user - Đối tượng user
   * @returns {Object} Dữ liệu user đã định dạng
   */
  formatUserBasicData(user) {
    if (!user) return null;
    
    return {
      walletAddress: user.walletAddress,
      username: user.username,
      ensName: user.ensName,
      avatarURI: user.avatarURI ? IPFSService.formatIPFSUrl(user.avatarURI) : null,
      isVerified: user.isVerified
    };
  }

  /**
   * Định dạng dữ liệu user đầy đủ
   * @param {Object} user - Đối tượng user
   * @returns {Object} Dữ liệu user đã định dạng
   */
  formatUserData(user) {
    if (!user) return null;
    
    return {
      walletAddress: user.walletAddress,
      username: user.username,
      ensName: user.ensName,
      avatarURI: user.avatarURI ? IPFSService.formatIPFSUrl(user.avatarURI) : null,
      bio: user.bio,
      isVerified: user.isVerified,
      followerCount: user.followerCount
    };
  }

  /**
   * Định dạng danh sách user với trạng thái follow
   * @param {Array} users - Danh sách user
   * @param {Object} currentUser - User hiện tại
   * @returns {Array} Danh sách user đã định dạng
   */
  formatUserListWithFollow(users, currentUser) {
    if (!users || !users.length) return [];
    
    return users.map(user => {
      let isFollowing = false;
      
      if (currentUser) {
        isFollowing = currentUser.following && 
          currentUser.following.includes(user.walletAddress.toLowerCase());
      }
      
      return {
        walletAddress: user.walletAddress,
        username: user.username,
        ensName: user.ensName,
        avatarURI: user.avatarURI ? IPFSService.formatIPFSUrl(user.avatarURI) : null,
        bio: user.bio,
        isVerified: user.isVerified,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        subscriptionLevel: user.subscription?.level || 1,
        isFollowing,
        createdAt: user.createdAt
      };
    });
  }

  /**
   * Định dạng dữ liệu NFT
   * @param {Object} nft - Đối tượng NFT
   * @returns {Object} Dữ liệu NFT đã định dạng
   */
  formatNFTData(nft) {
    if (!nft) return null;
    
    return {
      tokenId: nft.tokenId,
      creator: nft.creator,
      owner: nft.owner,
      metadata: {
        name: nft.metadata.name,
        description: nft.metadata.description,
        image: nft.metadata.image ? IPFSService.formatIPFSUrl(nft.metadata.image) : null
      },
      mediaType: nft.mediaType,
      forSale: nft.forSale,
      price: nft.price,
      royaltyPercent: nft.royaltyPercent,
      mintedAt: nft.mintedAt
    };
  }

  /**
   * Định dạng danh sách NFT với thông tin creator và owner
   * @param {Array} nfts - Danh sách NFT
   * @returns {Array} Danh sách NFT đã định dạng
   */
  async formatNFTsWithUserDetails(nfts) {
    if (!nfts || !nfts.length) return [];
    
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
    
    return nfts.map(nft => {
      const creator = usersMap[nft.creator];
      const owner = usersMap[nft.owner];
      
      return {
        tokenId: nft.tokenId,
        creator: nft.creator,
        creatorDetails: creator ? formatUserBasicData(creator) : null,
        owner: nft.owner,
        ownerDetails: owner ? formatUserBasicData(owner) : null,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: nft.metadata.image ? IPFSService.formatIPFSUrl(nft.metadata.image) : null
        },
        mediaType: nft.mediaType,
        forSale: nft.forSale,
        price: nft.price,
        royaltyPercent: nft.royaltyPercent,
        trendScore: nft.trendScore,
        mintedAt: nft.mintedAt
      };
    });
  }

  /**
   * Định dạng posts với thông tin author
   * @param {Array} posts - Danh sách post
   * @param {Object} currentUser - User hiện tại
   * @returns {Array} Danh sách post đã định dạng
   */
  async formatPostsWithAuthor(posts, currentUser) {
    if (!posts || !posts.length) return [];
    
    return Promise.all(posts.map(async (post) => {
      const author = await User.findOne({ walletAddress: post.author });
      
      // Kiểm tra xem người dùng đã like/save bài đăng chưa
      let isLiked = false;
      let isSaved = false;
      
      if (currentUser) {
        const userAddress = currentUser.address.toLowerCase();
        isLiked = post.likedBy.some(like => like.walletAddress === userAddress);
        isSaved = post.savedBy.some(save => save.walletAddress === userAddress);
      }
      
      return {
        _id: post._id,
        author: post.author,
        authorDetails: author ? formatUserBasicData(author) : null,
        content: post.content,
        contentURI: post.contentURI,
        media: post.media.map(media => ({
          ...media,
          uri: IPFSService.formatIPFSUrl(media.uri)
        })),
        tags: post.tags,
        stats: post.stats,
        isLiked,
        isSaved,
        createdAt: post.createdAt
      };
    }));
  }

  /**
   * Định dạng danh sách post với thông tin author và tương tác
   * @param {Array} posts - Danh sách post
   * @param {Object} currentUser - User hiện tại
   * @returns {Array} Danh sách post đã định dạng
   */
  async formatPostsWithAuthorAndInteractions(posts, currentUser) {
    if (!posts || !posts.length) return [];
    
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
    return posts.map(post => {
      const author = authorsMap[post.author];
      
      // Kiểm tra xem người dùng đã like/save bài đăng chưa
      let isLiked = false;
      let isSaved = false;
      
      if (currentUser) {
        const userAddress = currentUser.address.toLowerCase();
        isLiked = post.likedBy.some(like => like.walletAddress === userAddress);
        isSaved = post.savedBy.some(save => save.walletAddress === userAddress);
      }
      
      return {
        _id: post._id,
        author: post.author,
        authorDetails: author ? formatUserBasicData(author) : null,
        content: post.content,
        contentURI: post.contentURI,
        media: post.media.map(media => ({
          ...media,
          uri: IPFSService.formatIPFSUrl(media.uri)
        })),
        tags: post.tags,
        stats: post.stats,
        linkedNFT: post.linkedNFT,
        isLiked,
        isSaved,
        createdAt: post.createdAt
      };
    });
  }

  /**
   * Định dạng comments với thông tin author
   * @param {Array} comments - Danh sách comment
   * @returns {Array} Danh sách comment đã định dạng
   */
  async formatCommentsWithAuthor(comments) {
    if (!comments || !comments.length) return [];
    
    return Promise.all(comments.map(async (comment) => {
      const author = await User.findOne({ walletAddress: comment.author });
      const post = await Post.findOne({ _id: comment.postId });
      
      return {
        _id: comment._id,
        postId: comment.postId,
        postTitle: post ? (post.content.slice(0, 50) + (post.content.length > 50 ? '...' : '')) : null,
        author: comment.author,
        authorDetails: author ? formatUserBasicData(author) : null,
        content: comment.content,
        depth: comment.depth,
        stats: comment.stats,
        createdAt: comment.createdAt
      };
    }));
  }
}

module.exports = new FormatUtils();