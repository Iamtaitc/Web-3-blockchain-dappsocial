const { Collection, User } = require("../../models/index");
const { formatCollectionResponse, createPaginationObject } = require("./utils");

/**
 * Tìm kiếm bộ sưu tập
 * @param {String} query - Từ khóa tìm kiếm
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Giới hạn kết quả
 * @returns {Object} Kết quả tìm kiếm
 */
const searchCollections = async (query, page, limit) => {
  try {
    const skip = (page - 1) * limit;

    // Tìm kiếm collections
    const collections = await Collection.find({
      isPublic: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ nftCount: -1 })
      .skip(skip)
      .limit(limit);

    // Đếm tổng số kết quả
    const total = await Collection.countDocuments({
      isPublic: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    // Lấy thông tin creators
    const creatorAddresses = [...new Set(collections.map((c) => c.creator))];
    const creators = await User.find({
      walletAddress: { $in: creatorAddresses },
    }).select("walletAddress username avatarURI isVerified");

    const creatorsMap = {};
    creators.forEach((creator) => {
      creatorsMap[creator.walletAddress] = creator;
    });

    // Format collections
    const formattedCollections = collections.map((collection) => {
      const creator = creatorsMap[collection.creator];
      return formatCollectionResponse(collection, creator);
    });

    return {
      success: true,
      status: 200,
      message: "Tìm kiếm bộ sưu tập thành công",
      data: {
        collections: formattedCollections,
        pagination: createPaginationObject(total, page, limit),
      },
    };
  } catch (error) {
    console.error("Error searching collections:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi tìm kiếm bộ sưu tập",
      error: error.message,
    };
  }
};

/**
 * Lấy danh mục bộ sưu tập
 * @returns {Object} Danh sách danh mục
 */
const getCategories = async () => {
  try {
    // Lấy số lượng bộ sưu tập theo từng danh mục
    const categories = await Collection.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Danh sách các danh mục cố định (để đảm bảo luôn có các danh mục chính)
    const defaultCategories = [
      "art",
      "photography",
      "gaming",
      "music",
      "sports",
      "virtual worlds",
      "collectibles",
      "other",
    ];

    // Kết hợp danh mục từ database và danh mục mặc định
    const existingCategories = new Set(categories.map((c) => c._id));

    // Thêm các danh mục mặc định nếu chưa có
    const formattedCategories = [...categories];

    for (const category of defaultCategories) {
      if (!existingCategories.has(category)) {
        formattedCategories.push({
          _id: category,
          count: 0,
        });
      }
    }

    // Sắp xếp theo số lượng
    formattedCategories.sort((a, b) => b.count - a.count);

    return {
      success: true,
      status: 200,
      message: "Lấy danh mục bộ sưu tập thành công",
      data: formattedCategories.map((category) => ({
        name: category._id,
        count: category.count,
      })),
    };
  } catch (error) {
    console.error("Error getting categories:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi lấy danh mục bộ sưu tập",
      error: error.message,
    };
  }
};

module.exports = {
  searchCollections,
  getCategories,
};