const { Post } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const NFTService = require("../nft/index");
const axios = require("axios");

/**
 * Chuyển đổi media từ bài viết thành NFT
 * @param {String} postId - ID bài đăng
 * @param {Number} mediaIndex - Chỉ số của media trong bài đăng
 * @param {String} userAddress - Địa chỉ ví của người dùng
 * @param {Object} nftMetadata - Metadata của NFT
 * @returns {Object} Kết quả tạo NFT
 */
const createNFTFromPostMedia = async (postId, mediaIndex, userAddress, nftMetadata) => {
  try {
    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findById(postId);
    if (!post || post.status !== "active") {
      return { 
        success: false, 
        status: 404, 
        message: "Post not found" 
      };
    }

    // Kiểm tra media có tồn tại không
    if (!post.media || !post.media[mediaIndex]) {
      return { 
        success: false, 
        status: 404, 
        message: "Media not found in post" 
      };
    }

    // Kiểm tra người dùng có phải là tác giả của bài viết không
    if (post.author.toLowerCase() !== userAddress.toLowerCase()) {
      return { 
        success: false, 
        status: 403, 
        message: "Only the post author can create NFT from this media" 
      };
    }

    // Lấy thông tin media
    const media = post.media[mediaIndex];
    const mediaUri = media.uri; // ipfs://CID
    const mimetype = media.mimeType;
    const originalname =
      media.filename || `media-${mediaIndex}.${mimetype.split("/")[1]}`;

    // Lấy CID từ URI
    const ipfsCid = IPFSService.parseIPFSUri(mediaUri);
    
    // Tạo gateway URL để tải file
    const ipfsGatewayUrl = IPFSService.formatIPFSUrl(mediaUri);

    // Tải file từ IPFS gateway
    const response = await axios.get(ipfsGatewayUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);

    // Tạo NFT
    const nftResult = await NFTService.mintNFT(
      nftMetadata,
      userAddress,
      fileBuffer,
      mimetype,
      originalname
    );

    // Cập nhật bài viết với thông tin NFT
    await Post.findByIdAndUpdate(postId, {
      $push: {
        nfts: {
          tokenId: nftResult.tokenId,
          mediaIndex,
          mintedAt: new Date()
        }
      }
    });

    return {
      success: true,
      status: 201,
      message: "NFT created successfully from post media",
      data: {
        tokenId: nftResult.tokenId,
        name: nftResult.name,
        description: nftResult.description,
        imageUrl: ipfsGatewayUrl,
        mediaType: nftResult.mediaType,
        royaltyPercent: nftResult.royaltyPercent,
        txHash: nftResult.txHash,
        postId: post._id
      }
    };
  } catch (error) {
    console.error("Error creating NFT from post media:", error);
    return { 
      success: false, 
      status: 500, 
      message: "Error creating NFT", 
      error: error.message 
    };
  }
};

/**
 * Đăng bán NFT đã tạo từ bài viết
 * @param {String} tokenId - ID của NFT
 * @param {String} price - Giá bán
 * @param {String} userAddress - Địa chỉ ví của người bán
 * @param {String} postId - ID bài đăng
 * @returns {Object} Kết quả đăng bán
 */
const listNFTFromPost = async (tokenId, price, userAddress, postId) => {
  try {
    // Kiểm tra NFT có tồn tại không
    const nftResult = await NFTService.listNFTForSale(
      tokenId,
      price,
      userAddress
    );

    // Nếu có lỗi từ listNFTForSale
    if (!nftResult.success) {
      return nftResult;
    }

    // Cập nhật thông tin NFT trong bài viết
    await Post.updateOne(
      { _id: postId, "nfts.tokenId": tokenId },
      {
        $set: {
          "nfts.$.forSale": true,
          "nfts.$.price": price,
          "nfts.$.listedAt": new Date(),
        },
      }
    );

    return {
      success: true,
      status: 200,
      message: "NFT listed for sale successfully",
      data: {
        tokenId: nftResult.tokenId,
        price: nftResult.price,
        txHash: nftResult.txHash,
        postId,
      },
    };
  } catch (error) {
    console.error("Error listing NFT for sale:", error);
    return {
      success: false,
      status: 500,
      message: "Error listing NFT for sale",
      error: error.message,
    };
  }
};

module.exports = {
  createNFTFromPostMedia,
  listNFTFromPost,
};