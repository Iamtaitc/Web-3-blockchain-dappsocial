// utils/postHelpers.js

const { User, Like, SavedPost } = require("../models/index");
const ipfsService = require("../services/ipfs.services");

/**
 * Lấy thông tin chi tiết của danh sách bài đăng kèm thông tin tác giả
 * @param {Array} posts - Danh sách các bài đăng từ database
 * @param {Object} user - Thông tin người dùng hiện tại (nếu đã đăng nhập)
 * @returns {Promise<Array>} Danh sách bài đăng với thông tin chi tiết
 */
async function getPostsWithDetails(posts, user = null) {
  const postsWithAuthorDetails = await Promise.all(
    posts.map(async (post) => {
      const author = await User.findOne({ walletAddress: post.author });

      // Kiểm tra nếu user đã đăng nhập đã like/save bài đăng này chưa
      let isLiked = false;
      let isSaved = false;

      if (user) {
        const address = user.address.toLowerCase();

        // Thực hiện tìm kiếm Like và SavedPost cùng lúc để tối ưu tốc độ
        const [like, saved] = await Promise.all([
          Like.findOne({ user: address, postId: post._id }),
          SavedPost.findOne({ user: address, postId: post._id }),
        ]);

        isLiked = !!like;
        isSaved = !!saved;
      }

      // Đảm bảo luôn return một object hợp lệ
      return {
        _id: post._id,
        author: post.author,
        authorDetails: author
          ? {
              username: author.username,
              avatarURI: author.avatarURI
                ? ipfsService.formatIPFSUrl(author.avatarURI)
                : null,
              isVerified: author.isVerified,
            }
          : null,
        content: post.content,
        contentURI: post.contentURI,
        media: post.media.map((media) => ({
          ...media,
          uri: ipfsService.formatIPFSUrl(media.uri),
        })),
        tags: post.tags,
        mentions: post.mentions,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        saveCount: post.saveCount,
        isLiked,
        isSaved,
        createdAt: post.createdAt,
      };
    })
  );

  return postsWithAuthorDetails;
}

module.exports = {
  getPostsWithDetails,
};
