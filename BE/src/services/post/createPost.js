const { User, Post } = require("../../models/index");
const IPFSService = require("../ipfs.services");

/**
 * Tìm kiếm thông tin người dùng từ chuỗi mention có @
 * @param {String} mention - Chuỗi mention có thể bắt đầu bằng @, ví dụ: "@username"
 * @returns {Promise<Object>} - Thông tin người dùng bao gồm username và địa chỉ ví
 */
const findUserFromMention = async (mention) => {
  try {
    // Loại bỏ ký tự @ nếu có
    const username = mention.startsWith("@") ? mention.substring(1) : mention;

    // Tìm kiếm user dựa trên username
    const user = await User.findOne({ username });

    if (!user) {
      return null;
    }

    // Trả về thông tin cần thiết
    return {
      username: user.username,
      walletAddress: user.walletAddress,
    };
  } catch (error) {
    console.error("Error finding user from mention:", error);
    return null;
  }
};

/**
 * Xử lý danh sách các mentions và chuyển đổi thành thông tin người dùng
 * @param {Array<String>} mentions - Mảng các chuỗi mention (có thể có hoặc không có @)
 * @returns {Promise<Array<Object>>} - Mảng thông tin người dùng
 */
const processMentions = async (mentions) => {
  if (!mentions || !Array.isArray(mentions) || mentions.length === 0) {
    return [];
  }

  try {
    // Xử lý từng mention và lấy thông tin người dùng
    const usersPromises = mentions.map((mention) =>
      findUserFromMention(mention)
    );

    // Đợi tất cả các promises hoàn thành
    const users = await Promise.all(usersPromises);

    // Lọc bỏ các kết quả null (không tìm thấy user)
    return users.filter((user) => user !== null);
  } catch (error) {
    console.error("Error processing mentions:", error);
    return [];
  }
};

/**
 * Tạo bài đăng mới
 * @param {String} content - Nội dung bài đăng
 * @param {Array} tags - Danh sách tag
 * @param {Array} mentions - Danh sách mention
 * @param {String} address - Địa chỉ ví của người tạo
 * @param {Array} mediaObjects - Danh sách media
 * @returns {Object} Kết quả tạo bài đăng
 */
const createPost = async (content, tags, mentions, address, mediaObjects) => {
  try {
    // Validate input
    if (!content && (!mediaObjects || mediaObjects.length === 0)) {
      return {
        success: false,
        status: 400,
        message: "Post must contain either content or media",
      };
    }

    const user = await User.findOne({ walletAddress: address });
    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    // Xử lý mentions để có thông tin đầy đủ
    const processedMentions = await processMentions(mentions || []);

    // Tạo metadata và upload lên IPFS
    const mediaCIDs = mediaObjects.map((media) =>
      media.uri.replace("ipfs://", "")
    );

    const postMetadata = IPFSService.createPostMetadata(
      content || "",
      mediaCIDs,
      tags || [],
      processedMentions.map((user) => user.username) // Chỉ lưu username trong metadata
    );

    const metadataCID = await IPFSService.uploadJSON(postMetadata);

    // Tạo post với mentions đã xử lý
    const newPost = new Post({
      author: address.toLowerCase(),
      content: content || "",
      contentURI: `ipfs://${metadataCID}`,
      media: mediaObjects,
      tags: tags || [],
      mentions: processedMentions, // Lưu thông tin đầy đủ của mentions
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      viewCount: 0,
      status: "active",
      createdAt: new Date(),
    });

    await newPost.save();

    // Cập nhật postCount của user
    await User.updateOne(
      { walletAddress: address.toLowerCase() },
      { $inc: { "socialStats.postCount": 1 } }
    );

    return {
      success: true,
      status: 201,
      message: "Post created successfully",
      data: {
        id: newPost._id,
        username: user.username,
        author: newPost.author,
        content: newPost.content,
        contentURI: newPost.contentURI,
        media: newPost.media,
        tags: newPost.tags,
        mentions: processedMentions,
        likeCount: newPost.likeCount,
        commentCount: newPost.commentCount,
        saveCount: newPost.saveCount,
        createdAt: newPost.createdAt,
      },
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      status: 500,
      message: "Error creating post",
      error: error.message,
    };
  }
};

module.exports = {
  findUserFromMention,
  processMentions,
  createPost,
};