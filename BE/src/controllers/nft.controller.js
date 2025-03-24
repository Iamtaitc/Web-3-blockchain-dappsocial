const NFTService = require("../services/nft.services");
const ApiResponse = require("../utils/apiResponse.utils");
const { validationResult } = require("express-validator");

class NFTController {
  async getAllNFTs(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      creator: req.query.creator,
      owner: req.query.owner,
      forSale: req.query.forSale,
      mediaType: req.query.mediaType,
    };
    
    try {
      const result = await NFTService.getAllNFTs(filters, { page, limit });
      return ApiResponse.success(res, result, "Lấy danh sách NFT thành công");
    } catch (error) {
      return ApiResponse.serverError(res, "Lỗi khi lấy danh sách NFT", error.message);
    }
  }

  async getNFTById(req, res) {
    const { tokenId } = req.params;
    try {
      const result = await NFTService.getNFTById(tokenId);
      return ApiResponse.success(res, result, "Lấy thông tin NFT thành công");
    } catch (error) {
      return error.message === "NFT không tồn tại"
        ? ApiResponse.notFound(res, "NFT không tồn tại")
        : ApiResponse.serverError(res, "Lỗi khi lấy thông tin NFT", error.message);
    }
  }

  async mintNFT(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.badRequest(res, "Dữ liệu đầu vào không hợp lệ", errors.array());
    }

    if (!req.file) {
      return ApiResponse.badRequest(res, "Cần có file media");
    }

    try {
      const result = await NFTService.mintNFT(req.body, req.user.address, req.file.buffer, req.file.mimetype, req.file.originalname);
      return ApiResponse.created(res, { message: "NFT minted successfully", nft: result });
    } catch (error) {
      return ApiResponse.serverError(res, "Lỗi khi mint NFT", error.message);
    }
  }

  async listNFTForSale(req, res) {
    try {
      const result = await NFTService.listNFTForSale(req.params.tokenId, req.body.price, req.user.address);
      return ApiResponse.success(res, result, "NFT đã được đăng bán thành công");
    } catch (error) {
      return this.handleNFTError(res, error);
    }
  }

  async unlistNFT(req, res) {
    try {
      const result = await NFTService.unlistNFT(req.params.tokenId, req.user.address);
      return ApiResponse.success(res, result, "Đã hủy đăng bán NFT thành công");
    } catch (error) {
      return this.handleNFTError(res, error);
    }
  }

  async buyNFT(req, res) {
    try {
      const result = await NFTService.buyNFT(req.params.tokenId, req.user.address);
      return ApiResponse.success(res, result, "Mua NFT thành công");
    } catch (error) {
      return this.handleNFTError(res, error);
    }
  }

  async getMarketplaceNFTs(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      mediaType: req.query.mediaType,
    };
    
    try {
      const result = await NFTService.getMarketplaceNFTs(filters, { page, limit });
      return ApiResponse.success(res, result, "Lấy danh sách NFT marketplace thành công");
    } catch (error) {
      return ApiResponse.serverError(res, "Lỗi khi lấy danh sách NFT trên marketplace", error.message);
    }
  }

  async getCreatorNFTs(req, res) {
    try {
      const result = await NFTService.getCreatorNFTs(req.params.address, { page: req.query.page, limit: req.query.limit });
      return ApiResponse.success(res, result, "Lấy danh sách NFT của creator thành công");
    } catch (error) {
      return error.message === "Creator không tồn tại"
        ? ApiResponse.notFound(res, "Creator không tồn tại")
        : ApiResponse.serverError(res, "Lỗi khi lấy danh sách NFT của creator", error.message);
    }
  }

  handleNFTError(res, error) {
    const messages = {
      "NFT không tồn tại": "NFT không tồn tại",
      "Bạn không phải là chủ sở hữu của NFT này": "Bạn không phải là chủ sở hữu của NFT này",
      "NFT đã được đăng bán": "NFT đã được đăng bán",
      "Giá không hợp lệ": "Giá không hợp lệ",
      "NFT không được đăng bán": "NFT không được đăng bán",
      "Bạn không thể mua NFT của chính mình": "Bạn không thể mua NFT của chính mình",
      "Số dư DX token không đủ": "Số dư DX token không đủ",
    };
    return messages[error.message]
      ? ApiResponse.badRequest(res, messages[error.message])
      : ApiResponse.serverError(res, "Lỗi xử lý NFT", error.message);
  }
}

module.exports = new NFTController();
