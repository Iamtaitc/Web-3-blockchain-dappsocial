const { Collection, NFTCache } = require("../../models/index");

/**
 * Thêm NFT vào bộ sưu tập
 * @param {String} collectionId - ID bộ sưu tập
 * @param {String} tokenId - Token ID của NFT
 * @param {String} walletAddress - Địa chỉ ví của người thêm
 * @returns {Object} Kết quả thêm NFT
 */
const addNFTToCollection = async (collectionId, tokenId, walletAddress) => {
  try {
    // Kiểm tra bộ sưu tập có tồn tại không
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return {
        success: false,
        status: 404,
        message: "Bộ sưu tập không tồn tại",
      };
    }

    // Kiểm tra quyền sở hữu bộ sưu tập
    if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 403,
        message: "Bạn không có quyền thêm NFT vào bộ sưu tập này",
      };
    }

    // Kiểm tra NFT có tồn tại không
    const nft = await NFTCache.findOne({ tokenId });

    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      };
    }

    // Kiểm tra quyền sở hữu NFT
    if (nft.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 403,
        message: "Bạn chỉ có thể thêm NFT bạn tạo vào bộ sưu tập",
      };
    }

    // Kiểm tra NFT đã nằm trong bộ sưu tập nào chưa
    if (nft.collectionId) {
      // Nếu đã thuộc bộ sưu tập này rồi
      if (nft.collectionId.toString() === collectionId) {
        return {
          success: false,
          status: 400,
          message: "NFT đã nằm trong bộ sưu tập này",
        };
      }

      // Nếu đang thuộc bộ sưu tập khác, cập nhật số lượng của bộ sưu tập cũ
      await Collection.findByIdAndUpdate(nft.collectionId, {
        $inc: { nftCount: -1 },
      });
    }

    // Cập nhật NFT để thêm vào bộ sưu tập
    await NFTCache.findOneAndUpdate(
      { tokenId },
      { $set: { collectionId, updatedAt: new Date() } }
    );

    // Cập nhật số lượng NFT trong bộ sưu tập
    await Collection.findByIdAndUpdate(collectionId, {
      $inc: { nftCount: 1 },
      $set: { updatedAt: new Date() },
    });

    return {
      success: true,
      status: 200,
      message: "NFT đã được thêm vào bộ sưu tập thành công",
      data: {
        tokenId,
        collectionId,
      },
    };
  } catch (error) {
    console.error("Error adding NFT to collection:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi thêm NFT vào bộ sưu tập",
      error: error.message,
    };
  }
};

/**
 * Xóa NFT khỏi bộ sưu tập
 * @param {String} collectionId - ID bộ sưu tập
 * @param {String} tokenId - Token ID của NFT
 * @param {String} walletAddress - Địa chỉ ví của người xóa
 * @returns {Object} Kết quả xóa NFT
 */
const removeNFTFromCollection = async (collectionId, tokenId, walletAddress) => {
  try {
    // Kiểm tra bộ sưu tập có tồn tại không
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return {
        success: false,
        status: 404,
        message: "Bộ sưu tập không tồn tại",
      };
    }

    // Kiểm tra quyền sở hữu bộ sưu tập
    if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 403,
        message: "Bạn không có quyền xóa NFT khỏi bộ sưu tập này",
      };
    }

    // Kiểm tra NFT có tồn tại không và đang thuộc bộ sưu tập này không
    const nft = await NFTCache.findOne({
      tokenId,
      collectionId,
    });

    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại hoặc không thuộc bộ sưu tập này",
      };
    }

    // Xóa NFT khỏi bộ sưu tập
    await NFTCache.findOneAndUpdate(
      { tokenId },
      { $unset: { collectionId: "" }, $set: { updatedAt: new Date() } }
    );

    // Cập nhật số lượng NFT trong bộ sưu tập
    await Collection.findByIdAndUpdate(collectionId, {
      $inc: { nftCount: -1 },
      $set: { updatedAt: new Date() },
    });

    return {
      success: true,
      status: 200,
      message: "NFT đã được xóa khỏi bộ sưu tập thành công",
      data: {
        tokenId,
        collectionId,
      },
    };
  } catch (error) {
    console.error("Error removing NFT from collection:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi xóa NFT khỏi bộ sưu tập",
      error: error.message,
    };
  }
};

module.exports = {
  addNFTToCollection,
  removeNFTFromCollection,
};