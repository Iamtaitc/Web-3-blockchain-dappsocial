// src/services/CollectionService.js
const { Collection, NFTCache, User } = require("../models/index");
const IPFSService = require("./ipfs.services");
const mongoose = require("mongoose");

/**
 * Service xử lý các chức năng bộ sưu tập NFT
 */
class CollectionService {
  /**
   * Tạo bộ sưu tập NFT mới
   * @param {String} name - Tên bộ sưu tập
   * @param {String} description - Mô tả
   * @param {String} category - Danh mục
   * @param {Boolean} isPublic - Trạng thái công khai
   * @param {String} walletAddress - Địa chỉ ví của người tạo
   * @param {Object} files - Files từ request
   * @returns {Object} Kết quả tạo bộ sưu tập
   */
  async createCollection(
    name,
    description,
    category,
    isPublic,
    walletAddress,
    files
  ) {
    try {
      // Kiểm tra số lượng bộ sưu tập (giới hạn mỗi user tạo 20 bộ sưu tập)
      const collectionsCount = await Collection.countDocuments({
        creator: walletAddress.toLowerCase(),
      });

      if (collectionsCount >= 20) {
        return {
          success: false,
          status: 400,
          message: "Bạn đã đạt giới hạn số lượng bộ sưu tập (20)",
        };
      }

      // Upload hình ảnh lên IPFS nếu có
      let bannerCID = null;
      let thumbnailCID = null;

      if (files) {
        if (files.banner) {
          bannerCID = await IPFSService.uploadFile(
            files.banner.data,
            files.banner.name
          );
        }

        if (files.thumbnail) {
          thumbnailCID = await IPFSService.uploadFile(
            files.thumbnail.data,
            files.thumbnail.name
          );
        }
      }

      // Tạo collection mới
      const newCollection = new Collection({
        name,
        description,
        category: category || "other",
        creator: walletAddress.toLowerCase(),
        isPublic: isPublic !== false, // Mặc định là public
        bannerURI: bannerCID ? `ipfs://${bannerCID}` : null,
        thumbnailURI: thumbnailCID ? `ipfs://${thumbnailCID}` : null,
        nftCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newCollection.save();

      // Format response
      const response = {
        _id: newCollection._id,
        name: newCollection.name,
        description: newCollection.description,
        category: newCollection.category,
        creator: newCollection.creator,
        isPublic: newCollection.isPublic,
        bannerURL: newCollection.bannerURI
          ? IPFSService.formatIPFSUrl(newCollection.bannerURI)
          : null,
        thumbnailURL: newCollection.thumbnailURI
          ? IPFSService.formatIPFSUrl(newCollection.thumbnailURI)
          : null,
        nftCount: 0,
        createdAt: newCollection.createdAt,
      };

      return {
        success: true,
        status: 201,
        message: "Bộ sưu tập đã được tạo thành công",
        data: response,
      };
    } catch (error) {
      console.error("Error creating collection:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi tạo bộ sưu tập",
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật thông tin bộ sưu tập
   * @param {String} collectionId - ID bộ sưu tập
   * @param {String} name - Tên bộ sưu tập
   * @param {String} description - Mô tả
   * @param {String} category - Danh mục
   * @param {Boolean} isPublic - Trạng thái công khai
   * @param {String} walletAddress - Địa chỉ ví của người cập nhật
   * @param {Object} files - Files từ request
   * @returns {Object} Kết quả cập nhật bộ sưu tập
   */
  async updateCollection(
    collectionId,
    name,
    description,
    category,
    isPublic,
    walletAddress,
    files
  ) {
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

      // Kiểm tra quyền sở hữu
      if (collection.creator.toLowerCase() !== walletAddress.toLowerCase()) {
        return {
          success: false,
          status: 403,
          message: "Bạn không có quyền cập nhật bộ sưu tập này",
        };
      }

      // Upload hình ảnh mới nếu có
      let bannerCID = null;
      let thumbnailCID = null;

      if (files) {
        if (files.banner) {
          bannerCID = await IPFSService.uploadFile(
            files.banner.data,
            files.banner.name
          );
        }

        if (files.thumbnail) {
          thumbnailCID = await IPFSService.uploadFile(
            files.thumbnail.data,
            files.thumbnail.name
          );
        }
      }

      // Cập nhật thông tin
      const updateData = {
        updatedAt: new Date(),
      };

      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category) updateData.category = category;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (bannerCID) updateData.bannerURI = `ipfs://${bannerCID}`;
      if (thumbnailCID) updateData.thumbnailURI = `ipfs://${thumbnailCID}`;

      const updatedCollection = await Collection.findByIdAndUpdate(
        collectionId,
        { $set: updateData },
        { new: true }
      );

      // Format response
      const response = {
        _id: updatedCollection._id,
        name: updatedCollection.name,
        description: updatedCollection.description,
        category: updatedCollection.category,
        creator: updatedCollection.creator,
        isPublic: updatedCollection.isPublic,
        bannerURL: updatedCollection.bannerURI
          ? IPFSService.formatIPFSUrl(updatedCollection.bannerURI)
          : null,
        thumbnailURL: updatedCollection.thumbnailURI
          ? IPFSService.formatIPFSUrl(updatedCollection.thumbnailURI)
          : null,
        nftCount: updatedCollection.nftCount,
        createdAt: updatedCollection.createdAt,
        updatedAt: updatedCollection.updatedAt,
      };

      return {
        success: true,
        status: 200,
        message: "Bộ sưu tập đã được cập nhật thành công",
        data: response,
      };
    } catch (error) {
      console.error("Error updating collection:", error);
      return {
        success: false,
        status: 500,
        message: "Lỗi khi cập nhật bộ sưu tập",
        error: error.message,
      };
    }
  }

  /**
   * Lấy thông tin của một bộ sưu tập
   * @param {String} collectionId - ID bộ sưu tập
   * @param {Object} currentUser - Thông tin người dùng hiện tại
   * @returns {Object} Thông tin bộ sưu tập
   */
  async getCollection(collectionId, currentUser) {
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
        _id: collection._id,
        name: collection.name,
        description: collection.description,
        category: collection.category,
        creator: collection.creator,
        creatorDetails: creator
          ? {
              username: creator.username,
              avatarURI: creator.avatarURI
                ? IPFSService.formatIPFSUrl(creator.avatarURI)
                : null,
              isVerified: creator.isVerified,
            }
          : null,
        isPublic: collection.isPublic,
        bannerURL: collection.bannerURI
          ? IPFSService.formatIPFSUrl(collection.bannerURI)
          : null,
        thumbnailURL: collection.thumbnailURI
          ? IPFSService.formatIPFSUrl(collection.thumbnailURI)
          : null,
        nftCount: collection.nftCount,
        preview: formattedNFTs,
        floorPrice: collection.floorPrice || "0",
        volume: collection.volume || "0",
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
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
  }

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
  async getCollectionNFTs(
    collectionId,
    page,
    limit,
    sortBy,
    sortOrder,
    forSale,
    currentUser
  ) {
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
      const sortOptions = {};
      const order = sortOrder === "asc" ? 1 : -1;

      switch (sortBy) {
        case "price":
          sortOptions.price = order;
          break;
        case "name":
          sortOptions["metadata.name"] = order;
          break;
        case "mintedAt":
        default:
          sortOptions.mintedAt = order;
      }

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

          return {
            tokenId: nft.tokenId,
            name: nft.metadata.name,
            description: nft.metadata.description,
            image: nft.metadata.image
              ? IPFSService.formatIPFSUrl(nft.metadata.image)
              : null,
            creator: nft.creator,
            owner: nft.owner,
            ownerDetails: owner
              ? {
                  username: owner.username,
                  avatarURI: owner.avatarURI
                    ? IPFSService.formatIPFSUrl(owner.avatarURI)
                    : null,
                }
              : null,
            forSale: nft.forSale,
            price: nft.price,
            mediaType: nft.mediaType,
            mintedAt: nft.mintedAt,
          };
        })
      );

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách NFT trong bộ sưu tập thành công",
        data: {
          nfts: formattedNFTs,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
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
  }

  /**
   * Thêm NFT vào bộ sưu tập
   * @param {String} collectionId - ID bộ sưu tập
   * @param {String} tokenId - Token ID của NFT
   * @param {String} walletAddress - Địa chỉ ví của người thêm
   * @returns {Object} Kết quả thêm NFT
   */
  async addNFTToCollection(collectionId, tokenId, walletAddress) {
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
  }

  /**
   * Xóa NFT khỏi bộ sưu tập
   * @param {String} collectionId - ID bộ sưu tập
   * @param {String} tokenId - Token ID của NFT
   * @param {String} walletAddress - Địa chỉ ví của người xóa
   * @returns {Object} Kết quả xóa NFT
   */
  async removeNFTFromCollection(collectionId, tokenId, walletAddress) {
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
  }

  /**
   * Xóa bộ sưu tập
   * @param {String} collectionId - ID bộ sưu tập
   * @param {String} walletAddress - Địa chỉ ví của người xóa
   * @returns {Object} Kết quả xóa bộ sưu tập
   */
  async deleteCollection(collectionId, walletAddress) {
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
  }

  /**
   * Lấy tất cả bộ sưu tập của một người dùng
   * @param {String} address - Địa chỉ ví của người dùng
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {Object} currentUser - Thông tin người dùng hiện tại
   * @returns {Object} Danh sách bộ sưu tập
   */
  async getUserCollections(address, page, limit, currentUser) {
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
      const formattedCollections = collections.map((collection) => ({
        _id: collection._id,
        name: collection.name,
        description: collection.description,
        category: collection.category,
        creator: collection.creator,
        isPublic: collection.isPublic,
        bannerURL: collection.bannerURI
          ? IPFSService.formatIPFSUrl(collection.bannerURI)
          : null,
        thumbnailURL: collection.thumbnailURI
          ? IPFSService.formatIPFSUrl(collection.thumbnailURI)
          : null,
        nftCount: collection.nftCount,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      }));

      return {
        success: true,
        status: 200,
        message: "Lấy danh sách bộ sưu tập thành công",
        data: {
          collections: formattedCollections,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
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
  }

  /**
   * Lấy danh sách tất cả bộ sưu tập (public)
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @param {String} category - Danh mục cần lọc
   * @param {String} sortBy - Trường sắp xếp
   * @param {String} sortOrder - Thứ tự sắp xếp
   * @returns {Object} Danh sách bộ sưu tập
   */
  async getAllCollections(page, limit, category, sortBy, sortOrder) {
    try {
      const skip = (page - 1) * limit;

      // Lọc category nếu có
      const filter = { isPublic: true };
      if (category && category !== "all") {
        filter.category = category;
      }

      // Sort options
      const sortOptions = {};
      const order = sortOrder === "asc" ? 1 : -1;

      switch (sortBy) {
        case "nftCount":
          sortOptions.nftCount = order;
          break;
        case "createdAt":
          sortOptions.createdAt = order;
          break;
        case "name":
          sortOptions.name = order;
          break;
        case "updatedAt":
        default:
          sortOptions.updatedAt = order;
      }

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

        return {
          _id: collection._id,
          name_id: collection._id,
          name: collection.name,
          description: collection.description,
          category: collection.category,
          creator: collection.creator,
          creatorDetails: creator
            ? {
                username: creator.username,
                avatarURI: creator.avatarURI
                  ? IPFSService.formatIPFSUrl(creator.avatarURI)
                  : null,
                isVerified: creator.isVerified,
              }
            : null,
          bannerURL: collection.bannerURI
            ? IPFSService.formatIPFSUrl(collection.bannerURI)
            : null,
          thumbnailURL: collection.thumbnailURI
            ? IPFSService.formatIPFSUrl(collection.thumbnailURI)
            : null,
          nftCount: collection.nftCount,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
        };
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
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
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
  }

  /**
   * Xem các bộ sưu tập nổi bật
   * @returns {Object} Bộ sưu tập nổi bật
   */
  async getFeaturedCollections() {
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

        return {
          _id: collection._id,
          name: collection.name,
          description: collection.description,
          category: collection.category,
          creator: collection.creator,
          creatorDetails: creator
            ? {
                username: creator.username,
                avatarURI: creator.avatarURI
                  ? IPFSService.formatIPFSUrl(creator.avatarURI)
                  : null,
                isVerified: creator.isVerified,
              }
            : null,
          bannerURL: collection.bannerURI
            ? IPFSService.formatIPFSUrl(collection.bannerURI)
            : null,
          thumbnailURL: collection.thumbnailURI
            ? IPFSService.formatIPFSUrl(collection.thumbnailURI)
            : null,
          nftCount: collection.nftCount,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
        };
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
  }

  /**
   * Tìm kiếm bộ sưu tập
   * @param {String} query - Từ khóa tìm kiếm
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Giới hạn kết quả
   * @returns {Object} Kết quả tìm kiếm
   */
  async searchCollections(query, page, limit) {
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

        return {
          _id: collection._id,
          name: collection.name,
          description: collection.description,
          category: collection.category,
          creator: collection.creator,
          creatorDetails: creator
            ? {
                username: creator.username,
                avatarURI: creator.avatarURI
                  ? IPFSService.formatIPFSUrl(creator.avatarURI)
                  : null,
                isVerified: creator.isVerified,
              }
            : null,
          bannerURL: collection.bannerURI
            ? IPFSService.formatIPFSUrl(collection.bannerURI)
            : null,
          thumbnailURL: collection.thumbnailURI
            ? IPFSService.formatIPFSUrl(collection.thumbnailURI)
            : null,
          nftCount: collection.nftCount,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
        };
      });

      return {
        success: true,
        status: 200,
        message: "Tìm kiếm bộ sưu tập thành công",
        data: {
          collections: formattedCollections,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
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
  }

  /**
   * Cập nhật thông tin thống kê của bộ sưu tập
   * @param {String} collectionId - ID bộ sưu tập
   * @returns {Object} Kết quả cập nhật
   */
  async updateCollectionStats(collectionId) {
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
  }

  /**
   * Lấy danh mục bộ sưu tập
   * @returns {Object} Danh sách danh mục
   */
  async getCategories() {
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
  }
}

module.exports = new CollectionService();
