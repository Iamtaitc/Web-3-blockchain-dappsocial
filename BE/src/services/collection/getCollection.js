const { Collection, NFTCache, User } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const {
  formatCollectionResponse,
  formatNFTResponse,
  createPaginationObject,
  createSortOptions
} = require("./utils");

/**
 * Lấy thông tin của một bộ sưu tập
 * @param {String} collectionId - ID bộ sưu tập
 * @param {Object} currentUser - Thông tin người dùng hiện tại
 * @returns {Object} Thông tin bộ sưu tập
 */
const getCollection = async (collectionId, currentUser) => {
  try {
    // Lấy thông tin bộ sưu tập
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return {
        success: false,
        status: 404,
        message: "Bộ sưu tập không tồn tại",
      };
    }

    // Kiểm tra quyền truy cập nếu bộ sưu tập private
    if (!collection.isPublic) {
      // Nếu không đăng nhập hoặc không phải creator
      if (
        !currentUser ||
        currentUser.address.toLowerCase() !== collection.creator.toLowerCase()
      ) {
        return {
          success: false,
          status: 403,
          message: "Bạn không có quyền xem bộ sưu tập này",
        };
      }
    }

    // Lấy thông tin creator
    const creator = await User.findOne({ walletAddress: collection.creator });

    // Lấy NFTs trong bộ sưu tập (giới hạn 8 NFT cho preview)
    const nfts = await NFTCache.find({ collectionId: collection._id })
      .sort({ mintedAt: -1 })
      .limit(8);

    // Format NFTs
    const formattedNFTs = nfts.map((nft) => ({
      tokenId: nft.tokenId,
      name: nft.metadata.name,
      image: nft.metadata.image
        ? IPFSService.formatIPFSUrl(nft.metadata.image)
        : null,
      creator: nft.creator,
      owner: nft.owner,
      forSale: nft.forSale,
      price: nft.price,
    }));

    // Format response
    const response = {
      ...formatCollectionResponse(collection, creator),
      preview: formattedNFTs,
    };

    return {
      success: true,
      status: 200,
      message: "Lấy thông tin bộ sưu tập thành công",
      data: response,
    };
  } catch (error) {
    console.error("Error getting collection:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi lấy thông tin bộ sưu tập",
      error: error.message,
    };
  }
};

/**
 * Lấy tất cả NFTs trong một bộ sưu tập
 * @param {String} collectionId - ID bộ sưu tập
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Giới hạn kết quả
 * @param {String} sortBy - Trường sắp xếp
 * @param {String} sortOrder - Thứ tự sắp xếp
 * @param {String} forSale - Lọc theo trạng thái bán
 * @param {Object} currentUser - Thông tin người dùng hiện tại
 * @returns {Object} Danh sách NFTs
 */
const getCollectionNFTs = async (
  collectionId,
  page,
  limit,
  sortBy,
  sortOrder,
  forSale,
  currentUser
) => {
  try {
    const skip = (page - 1) * limit;

    // Lấy thông tin bộ sưu tập
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return {
        success: false,
        status: 404,
        message: "Bộ sưu tập không tồn tại",
      };
    }

    // Kiểm tra quyền truy cập nếu bộ sưu tập private
    if (!collection.isPublic) {
      // Nếu không đăng nhập hoặc không phải creator
      if (
        !currentUser ||
        currentUser.address.toLowerCase() !== collection.creator.toLowerCase()
      ) {
        return {
          success: false,
          status: 403,
          message: "Bạn không có quyền xem bộ sưu tập này",
        };
      }
    }

    // Sort options
    const sortOptions = createSortOptions(sortBy, sortOrder);

    // Filter options
    const filter = { collectionId: collection._id };

    if (forSale === "true") {
      filter.forSale = true;
    }

    // Lấy NFTs trong bộ sưu tập
    const nfts = await NFTCache.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Đếm tổng số NFTs
    const total = await NFTCache.countDocuments(filter);

    // Format NFTs
    const formattedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        const owner = await User.findOne({ walletAddress: nft.owner });
        return formatNFTResponse(nft, owner);
      })
    );

    return {
      success: true,
      status: 200,
      message: "Lấy danh sách NFT trong bộ sưu tập thành công",
      data: {
        nfts: formattedNFTs,
        pagination: createPaginationObject(total, page, limit),
      },
    };
  } catch (error) {
    console.error("Error getting collection NFTs:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi lấy danh sách NFT trong bộ sưu tập",
      error: error.message,
    };
  }
};

/**
 * Lấy tất cả bộ sưu tập của một người dùng
 * @param {String} address - Địa chỉ ví của người dùng
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Giới hạn kết quả
 * @param {Object} currentUser - Thông tin người dùng hiện tại
 * @returns {Object} Danh sách bộ sưu tập
 */
const getUserCollections = async (address, page, limit, currentUser) => {
  try {
    const skip = (page - 1) * limit;

    // Xây dựng filter
    const filter = { creator: address.toLowerCase() };

    // Nếu không phải chủ sở hữu, chỉ hiển thị bộ sưu tập public
    if (
      !currentUser ||
      currentUser.address.toLowerCase() !== address.toLowerCase()
    ) {
      filter.isPublic = true;
    }

    // Lấy bộ sưu tập của user
    const collections = await Collection.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Đếm tổng số bộ sưu tập
    const total = await Collection.countDocuments(filter);

    // Format collections
    const formattedCollections = collections.map((collection) => 
      formatCollectionResponse(collection)
    );

    return {
      success: true,
      status: 200,
      message: "Lấy danh sách bộ sưu tập thành công",
      data: {
        collections: formattedCollections,
        pagination: createPaginationObject(total, page, limit),
      },
    };
  } catch (error) {
    console.error("Error getting user collections:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi lấy danh sách bộ sưu tập của người dùng",
      error: error.message,
    };
  }
};

/**
 * Lấy danh sách tất cả bộ sưu tập (public)
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Giới hạn kết quả
 * @param {String} category - Danh mục cần lọc
 * @param {String} sortBy - Trường sắp xếp
 * @param {String} sortOrder - Thứ tự sắp xếp
 * @returns {Object} Danh sách bộ sưu tập
 */
const getAllCollections = async (page, limit, category, sortBy, sortOrder) => {
  try {
    const skip = (page - 1) * limit;

    // Lọc category nếu có
    const filter = { isPublic: true };
    if (category && category !== "all") {
      filter.category = category;
    }

    // Sort options
    const sortOptions = createSortOptions(sortBy, sortOrder);

    // Lấy collections
    const collections = await Collection.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Đếm tổng số collections
    const total = await Collection.countDocuments(filter);

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

    // Lấy thống kê cho các danh mục
    const categoryStats = await Collection.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      success: true,
      status: 200,
      message: "Lấy danh sách bộ sưu tập thành công",
      data: {
        collections: formattedCollections,
        categories: categoryStats.map((stat) => ({
          category: stat._id,
          count: stat.count,
        })),
        pagination: createPaginationObject(total, page, limit),
      },
    };
  } catch (error) {
    console.error("Error getting all collections:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi lấy danh sách bộ sưu tập",
      error: error.message,
    };
  }
};

/**
 * Xem các bộ sưu tập nổi bật
 * @returns {Object} Bộ sưu tập nổi bật
 */
const getFeaturedCollections = async () => {
  try {
    // Lấy top 6 bộ sưu tập có nhiều NFT nhất
    const topCollections = await Collection.find({
      isPublic: true,
      nftCount: { $gt: 0 },
    })
      .sort({ nftCount: -1, updatedAt: -1 })
      .limit(6);

    // Lấy top 6 bộ sưu tập mới nhất
    const newCollections = await Collection.find({
      isPublic: true,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    // Lấy thông tin creators
    const creatorAddresses = [
      ...new Set([
        ...topCollections.map((c) => c.creator),
        ...newCollections.map((c) => c.creator),
      ]),
    ];

    const creators = await User.find({
      walletAddress: { $in: creatorAddresses },
    }).select("walletAddress username avatarURI isVerified");

    const creatorsMap = {};
    creators.forEach((creator) => {
      creatorsMap[creator.walletAddress] = creator;
    });

    // Format collections
    const formatCollection = (collection) => {
      const creator = creatorsMap[collection.creator];
      return formatCollectionResponse(collection, creator);
    };

    return {
      success: true,
      status: 200,
      message: "Lấy danh sách bộ sưu tập nổi bật thành công",
      data: {
        top: topCollections.map(formatCollection),
        new: newCollections.map(formatCollection),
      },
    };
  } catch (error) {
    console.error("Error getting featured collections:", error);
    return {
      success: false,
      status: 500,
      message: "Lỗi khi lấy danh sách bộ sưu tập nổi bật",
      error: error.message,
    };
  }
};

module.exports = {
  getCollection,
  getCollectionNFTs,
  getUserCollections,
  getAllCollections,
  getFeaturedCollections,
};