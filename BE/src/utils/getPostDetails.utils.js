// utils/postHelpers.js

const { User, Like, SavePost } = require("../models/index");
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
      try {
        const author = await User.findOne({ walletAddress: post.author });

        // Kiểm tra nếu user đã đăng nhập đã like/save bài đăng này chưa
        let isLiked = false;
        let isSaved = false;
        
        if (user && user.walletAddress) {
          console.log("user", user.walletAddress);
          const userWalletAddress = user.walletAddress.toLowerCase();
          
          // Kiểm tra mô hình Like và SavePost có tồn tại không
          console.log("Like model exists:", !!Like);
          console.log("SavePost model exists:", !!SavePost);
          console.log("post._id:", post._id);
          
          // Thêm try-catch cho từng truy vấn để xác định lỗi cụ thể
          try {
            const like = Like ? await Like.findOne({ user: userWalletAddress, postId: post._id }) : null;
            isLiked = !!like;
          } catch (likeError) {
            console.error("Error in Like query:", likeError);
          }
          
          try {
            const saved = SavePost ? await SavePost.findOne({ user: userWalletAddress, postId: post._id }) : null;
            isSaved = !!saved;
          } catch (savedError) {
            console.error("Error in SavePost query:", savedError);
          }
        }

        // Phần còn lại giữ nguyên
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
      } catch (error) {
        console.error("Error processing post:", error);
        return { _id: post._id, error: error.message };
      }
    })
  );

  return postsWithAuthorDetails;
}

module.exports = {
  getPostsWithDetails,
};
