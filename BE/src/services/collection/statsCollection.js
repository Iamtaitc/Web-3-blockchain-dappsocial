const { Collection, NFTCache } = require("../../models/index");
const mongoose = require("mongoose");

/**
 * Cập nhật thông tin thống kê của bộ sưu tập
 * @param {String} collectionId - ID bộ sưu tập
 * @returns {Object} Kết quả cập nhật
 */
const updateCollectionStats = async (collectionId) => {
  try {
    // Tính toán floor price (giá sàn)
    const floorPrice = await NFTCache.find({
      collectionId,
      forSale: true,
    })
      .sort({ price: 1 })
      .limit(1)
      .then((nfts) => (nfts.length > 0 ? nfts[0].price : "0"));

    // Tính tổng volume giao dịch
    const volume = await NFTCache.aggregate([
      { $match: { collectionId: mongoose.Types.ObjectId(collectionId) } },
      { $unwind: "$transactions" },
      { $match: { "transactions.type": "sale" } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: { $toDouble: "$transactions.price" } },
        },
      },
    ]).then((result) =>
      result.length > 0 ? result[0].totalVolume.toString() : "0"
    );

    // Cập nhật thông tin bộ sưu tập
    await Collection.findByIdAndUpdate(collectionId, {
      $set: {
        floorPrice,
        volume,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      status: 200,
      message: "Thống kê bộ sưu tập đã được cập nhật",
      data: {
        floorPrice,
        volume,
      },
    };
  } catch (error) {
    console.error("Error updating collection stats:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi cập nhật thống kê bộ sưu tập",
      error: error.message,
    };
  }
};

module.exports = {
  updateCollectionStats,
};