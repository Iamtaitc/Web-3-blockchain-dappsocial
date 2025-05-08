const getPostService = require("./getPost");
const createPostService = require("./createPost");
const interactionPostService = require("./interactionPost");
const nftPostService = require("./nftPost");

/**
 * Service xử lý các chức năng liên quan đến bài đăng
 */
class PostService {
  // Get Post methods
  getPostsByUser = getPostService.getPostsByUser;
  getIdPost = getPostService.getIdPost;
  getAllPosts = getPostService.getAllPosts;
  getTrendingPosts = getPostService.getTrendingPosts;

  // Create Post methods
  createPost = createPostService.createPost;
  findUserFromMention = createPostService.findUserFromMention;
  processMentions = createPostService.processMentions;

  // Interaction methods
  likePost = interactionPostService.likePost;
  unlikePostService = interactionPostService.unlikePostService;
  savePostService = interactionPostService.savePostService;
  unsavePostService = interactionPostService.unsavePostService;
  getSavePostsService = interactionPostService.getSavePostsService;

  // NFT from Post methods
  createNFTFromPostMedia = nftPostService.createNFTFromPostMedia;
  listNFTFromPost = nftPostService.listNFTFromPost;
}

module.exports = new PostService();
