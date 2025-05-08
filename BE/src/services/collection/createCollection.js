const { Collection } = require("../../models/index");
const IPFSService = require("../ipfs.services");
const { formatCollectionResponse } = require("./utils");

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
const createCollection = async (
  name,
  description,
  category,
  isPublic,
  walletAddress,
  files
) => {
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
    const response = formatCollectionResponse(newCollection);

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
};

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
const updateCollection = async (
  collectionId,
  name,
  description,
  category,
  isPublic,
  walletAddress,
  files
) => {
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
    const response = formatCollectionResponse(updatedCollection);

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
};

module.exports = {
  createCollection,
  updateCollection,
};