const { User, Like, SavePost } = require("../../models/index");
const IPFSService = require("../ipfs.services");

/**
 * Format thông tin người dùng (tác giả hoặc người đề cập)
 * @param {Object} user - Đối tượng user từ database
 * @returns {Object} Thông tin user đã format
 */
const formatUserDetails = (user) => {
  if (!user) return null;
  
  return {
    username: user.username,
    avatarURI: user.avatarURI ? IPFSService.formatIPFSUrl(user.avatarURI) : null,
    isVerified: user.isVerified,
  };
};

/**
 * Format media trong bài viết
 * @param {Array} media - Danh sách media của bài đăng
 * @returns {Array} Danh sách media đã format
 */
const formatPostMedia = (media) => {
  if (!media || !Array.isArray(media)) return [];
  
  return media.map((item) => ({
    ...item,
    uri: IPFSService.formatIPFSUrl(item.uri)
  }));
};

/**
 * Format thông tin bài đăng cơ bản
 * @param {Object} post - Đối tượng bài đăng từ database
 * @param {Object} author - Đối tượng author
 * @param {Boolean} isLiked - Đã like hay chưa
 * @param {Boolean} isSaved - Đã lưu hay chưa
 * @returns {Object} Thông tin bài đăng đã format
 */
const formatPostResponse = (post, author = null, isLiked = false, isSaved = false) => {
  return {
    _id: post._id,
    author: post.author,
    authorDetails: author ? formatUserDetails(author) : null,
    content: post.content,
    contentURI: post.contentURI,
    media: formatPostMedia(post.media),
    tags: post.tags,
    mentions: post.mentions,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    saveCount: post.saveCount,
    viewCount: post.viewCount,
    isLiked,
    isSaved,
    createdAt: post.createdAt,
  };
};

/**
 * Kiểm tra trạng thái like/save của một danh sách bài đăng
 * @param {Array} posts - Danh sách các bài đăng
 * @param {String} userAddress - Địa chỉ ví của người dùng hiện tại
 * @returns {Promise<Object>} Map các trạng thái like/save
 */
const getPostInteractionStatus = async (posts, userAddress) => {
  if (!posts || !posts.length || !userAddress) {
    return { likedMap: new Map(), savedMap: new Map() };
  }
  
  const postIds = posts.map(post => post._id.toString());
  
  // Lấy danh sách bài đăng đã like
  const likedPosts = await Like.find({
    user: userAddress.toLowerCase(),
    postId: { $in: postIds }
  }).select('postId').lean();
  
  // Lấy danh sách bài đăng đã lưu
  const savedPosts = await SavePost.find({
    user: userAddress.toLowerCase(),
    postId: { $in: postIds }
  }).select('postId').lean();
  
  // Tạo Map để truy cập nhanh
  const likedMap = new Map(
    likedPosts.map(like => [like.postId.toString(), true])
  );
  
  const savedMap = new Map(
    savedPosts.map(save => [save.postId.toString(), true])
  );
  
  return { likedMap, savedMap };
};

/**
 * Tạo đối tượng pagination
 * @param {Number} total - Tổng số kết quả
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số kết quả mỗi trang
 * @returns {Object} Thông tin pagination
 */
const createPaginationObject = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

module.exports = {
  formatUserDetails,
  formatPostMedia,
  formatPostResponse,
  getPostInteractionStatus,
  createPaginationObject
};