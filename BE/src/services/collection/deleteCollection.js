const { Collection, NFTCache } = require("../../models/index");
const mongoose = require("mongoose");

/**
 * Xóa bộ sưu tập
 * @param {String} collectionId - ID bộ sưu tập
 * @param {String} walletAddress - Địa chỉ ví của người xóa
 * @returns {Object} Kết quả xóa bộ sưu tập
 */
const deleteCollection = async (collectionId, walletAddress) => {
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
        message: "Bạn không có quyền xóa bộ sưu tập này",
      };
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

    return {
      success: true,
      status: 200,
      message: "Bộ sưu tập đã được xóa thành công",
      data: {
        collectionId,
      },
    };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi xóa bộ sưu tập",
      error: error.message,
    };
  }
};

module.exports = {
  deleteCollection,
};