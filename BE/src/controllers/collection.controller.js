const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/apiResponse.utils");
const CollectionService = require("../services/collection.services");
const config = require("../configs/config.env");

/**
 * Controller xử lý các chức năng bộ sưu tập NFT
 */
class CollectionController {

  /**
   * Tạo bộ sưu tập NFT mới
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createCollection(req, res) {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(
        res,
        "Dữ liệu không hợp lệ",
        errors.array()
      );
    }

    const { name, description, category, isPublic } = req.body;
    const walletAddress = req.user.address;
    const files = req.files || {};

    const result = await CollectionService.createCollection(
      name,
      description,
      category,
      isPublic,
      walletAddress,
      files
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.created(
      res,
      { collection: result.data },
      "Bộ sưu tập đã được tạo thành công"
    );
  }

  /**
   * Cập nhật thông tin bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateCollection(req, res) {
    const { collectionId } = req.params;
    const { name, description, category, isPublic } = req.body;
    const walletAddress = req.user.address;
    const files = req.files || {};

    const result = await CollectionService.updateCollection(
      collectionId,
      name,
      description,
      category,
      isPublic,
      walletAddress,
      files
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { collection: result.data },
      "Bộ sưu tập đã được cập nhật thành công"
    );
  }

  /**
   * Lấy thông tin của một bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCollection(req, res) {
    const { collectionId } = req.params;
    const currentUser = req.user || null;

    const result = await CollectionService.getCollection(
      collectionId,
      currentUser
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, { collection: result.data });
  }

  /**
   * Lấy tất cả NFTs trong một bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCollectionNFTs(req, res) {
    const { collectionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || "mintedAt";
    const sortOrder = req.query.sortOrder || "desc";
    const forSale = req.query.forSale;
    const currentUser = req.user || null;

    const result = await CollectionService.getCollectionNFTs(
      collectionId,
      page,
      limit,
      sortBy,
      sortOrder,
      forSale,
      currentUser
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      nfts: result.data.nfts,
      pagination: result.data.pagination,
    });
  }

  /**
   * Thêm NFT vào bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addNFTToCollection(req, res) {
    const { collectionId } = req.params;
    const { tokenId } = req.body;
    const walletAddress = req.user.address;

    const result = await CollectionService.addNFTToCollection(
      collectionId,
      tokenId,
      walletAddress
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      {
        tokenId: result.data.tokenId,
        collectionId: result.data.collectionId,
      },
      "NFT đã được thêm vào bộ sưu tập thành công"
    );
  }

  /**
   * Xóa NFT khỏi bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async removeNFTFromCollection(req, res) {
    const { collectionId, tokenId } = req.params;
    const walletAddress = req.user.address;

    const result = await CollectionService.removeNFTFromCollection(
      collectionId,
      tokenId,
      walletAddress
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      {
        tokenId: result.data.tokenId,
        collectionId: result.data.collectionId,
      },
      "NFT đã được xóa khỏi bộ sưu tập thành công"
    );
  }

  /**
   * Xóa bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteCollection(req, res) {
    const { collectionId } = req.params;
    const walletAddress = req.user.address;

    const result = await CollectionService.deleteCollection(
      collectionId,
      walletAddress
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { collectionId: result.data.collectionId },
      "Bộ sưu tập đã được xóa thành công"
    );
  }

  /**
   * Lấy tất cả bộ sưu tập của một người dùng
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserCollections(req, res) {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const currentUser = req.user || null;

    const result = await CollectionService.getUserCollections(
      address,
      page,
      limit,
      currentUser
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      collections: result.data.collections,
      pagination: result.data.pagination,
    });
  }

  /**
   * Lấy danh sách tất cả bộ sưu tập (public)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllCollections(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const sortBy = req.query.sortBy || "updatedAt";
    const sortOrder = req.query.sortOrder || "desc";

    const result = await CollectionService.getAllCollections(
      page,
      limit,
      category,
      sortBy,
      sortOrder
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      collections: result.data.collections,
      categories: result.data.categories,
      pagination: result.data.pagination,
    });
  }

  /**
   * Xem các bộ sưu tập nổi bật
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getFeaturedCollections(req, res) {
    const result = await CollectionService.getFeaturedCollections();

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, { featured: result.data });
  }

  /**
   * Tìm kiếm bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchCollections(req, res) {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!query || query.length < 2) {
      return ApiResponse.badRequest(
        res,
        "Từ khóa tìm kiếm phải có ít nhất 2 ký tự"
      );
    }

    const result = await CollectionService.searchCollections(
      query,
      page,
      limit
    );

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, {
      collections: result.data.collections,
      pagination: result.data.pagination,
    });
  }

  /**
   * Cập nhật thông tin thống kê của bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateCollectionStats(req, res) {
    const { collectionId } = req.params;
    const walletAddress = req.user.address;

    // Kiểm tra nếu người dùng là admin
    const isAdmin = config.ADMIN_ADDRESSES.includes(
      walletAddress.toLowerCase()
    );

    if (!isAdmin) {
      return ApiResponse.forbidden(
        res,
        "Bạn không có quyền thực hiện hành động này"
      );
    }

    const result =
      await CollectionService.updateCollectionStats(collectionId);

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(
      res,
      { stats: result.data },
      "Thống kê bộ sưu tập đã được cập nhật"
    );
  }

  /**
   * Lấy danh mục bộ sưu tập
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCategories(req, res) {
    const result = await CollectionService.getCategories();

    if (!result.success) {
      return ApiResponse.error(
        res,
        result.message,
        result.status,
        result.error
      );
    }

    return ApiResponse.success(res, { categories: result.data });
  }
}

module.exports = new CollectionController();
