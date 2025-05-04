const NFTCache = require("../../models/NFTCache.mongoose");
const blockchainService = require("../blockchain.services");
const notificationService = require("../notification.services");
const { retryOperation } = require("../../utils/retry.utils");

/**
 * Đăng bán NFT
 * @param {String} tokenId - ID của NFT
 * @param {String} price - Giá bán
 * @param {String} walletAddress - Địa chỉ ví của người bán
 * @returns {Object} Kết quả đăng bán
 */
const listNFTForSale = async (tokenId, price, walletAddress) => {
  try {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return {
        success: false,
        status: 404,
        message: "Giá không hợp lệ",
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

    // Kiểm tra người dùng có phải là chủ sở hữu không
    if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 404,
        message: "Bạn không phải là chủ sở hữu của NFT này",
      };
    }

    // Kiểm tra NFT đã đăng bán chưa
    if (nft.forSale) {
      return {
        success: false,
        status: 404,
        message: "NFT đã được đăng bán",
      };
    }

    // Đăng bán NFT trên blockchain
    const listingResult = await retryOperation(async () => {
      return await blockchainService.listNFTForSale(
        process.env.PRIVATE_KEY,
        tokenId,
        price
      );
    }, 3);

    // Cập nhật thông tin trong database - sử dụng mongoose v6 syntax
    await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          forSale: true,
          price,
          lastUpdated: new Date(),
        },
        $push: {
          transactions: {
            type: "list",
            from: walletAddress.toLowerCase(),
            to: walletAddress.toLowerCase(),
            price,
            timestamp: new Date(),
            txHash: listingResult.transactionHash,
          },
        },
      },
      { new: true }
    );

    return {
      tokenId,
      price,
      txHash: listingResult.transactionHash,
    };
  } catch (error) {
    console.error("Error listing NFT for sale:", error);

    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

/**
 * Hủy đăng bán NFT
 * @param {String} tokenId - ID của NFT
 * @param {String} walletAddress - Địa chỉ ví của người bán
 * @returns {Object} Kết quả hủy đăng bán
 */
const unlistNFT = async (tokenId, walletAddress) => {
  try {
    // Kiểm tra NFT có tồn tại không
    const nft = await NFTCache.findOne({ tokenId });

    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      };
    }

    // Kiểm tra người dùng có phải là chủ sở hữu không
    if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 404,
        message: "Bạn không phải là chủ sở hữu của NFT này",
      };
    }

    // Kiểm tra NFT có đang được đăng bán không
    if (!nft.forSale) {
      return {
        success: false,
        status: 404,
        message: "NFT không được đăng bán",
      };
    }

    // Hủy đăng bán NFT trên blockchain
    const unlistResult = await retryOperation(async () => {
      return await blockchainService.unlistNFT(
        process.env.PRIVATE_KEY,
        tokenId
      );
    }, 3);

    // Cập nhật thông tin trong database - sử dụng mongoose v6 syntax
    await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          forSale: false,
          price: "0",
          lastUpdated: new Date(),
        },
        $push: {
          transactions: {
            type: "unlist",
            from: walletAddress.toLowerCase(),
            to: walletAddress.toLowerCase(),
            timestamp: new Date(),
            txHash: unlistResult.transactionHash,
          },
        },
      },
      { new: true }
    );

    return {
      tokenId,
      txHash: unlistResult.transactionHash,
    };
  } catch (error) {
    console.error("Error unlisting NFT:", error);
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

/**
 * Mua NFT
 * @param {String} tokenId - ID của NFT
 * @param {String} walletAddress - Địa chỉ ví của người mua
 * @returns {Object} Kết quả mua NFT
 */
const buyNFT = async (tokenId, walletAddress) => {
  try {
    // Kiểm tra NFT có tồn tại không
    const nft = await NFTCache.findOne({ tokenId });

    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      };
    }

    // Kiểm tra NFT có đang được đăng bán không
    if (!nft.forSale) {
      return {
        success: false,
        status: 404,
        message: "NFT không được đăng bán",
      };
    }

    // Kiểm tra người dùng không phải là chủ sở hữu
    if (nft.owner.toLowerCase() === walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 404,
        message: "Bạn không thể mua NFT của chính mình",
      };
    }

    // Kiểm tra balance DX token
    const balance = await blockchainService.getDXBalance(walletAddress);
    if (parseFloat(balance) < parseFloat(nft.price)) {
      return {
        success: false,
        status: 404,
        message: "Số dư DX token không đủ",
      };
    }

    // THÊM: Phê duyệt cho marketplace sử dụng tokens
    const approveResult = await retryOperation(async () => {
      return await blockchainService.approveMarketplace(
        process.env.PRIVATE_KEY,
        nft.price
      );
    }, 3);

    // Thực hiện mua NFT trên blockchain
    const buyResult = await retryOperation(async () => {
      return await blockchainService.buyNFT(process.env.PRIVATE_KEY, tokenId);
    }, 3);

    // Lưu lại owner cũ để thông báo
    const previousOwner = nft.owner;

    // Cập nhật thông tin trong database - sử dụng mongoose v6 syntax
    await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          owner: walletAddress.toLowerCase(),
          forSale: false,
          price: "0",
          lastUpdated: new Date(),
        },
        $push: {
          transactions: {
            type: "sale",
            from: previousOwner,
            to: walletAddress.toLowerCase(),
            price: nft.price,
            timestamp: new Date(),
            txHash: buyResult.transactionHash,
          },
        },
      },
      { new: true }
    );

    // Tạo thông báo cho người bán
    await notificationService.createNotification({
      recipient: previousOwner,
      type: "sale",
      sender: walletAddress.toLowerCase(),
      content: `NFT "${nft.metadata.name}" đã được bán với giá ${nft.price} DX`,
      targetType: "nft",
      targetId: tokenId,
    });

    return {
      tokenId,
      name: nft.metadata.name,
      previousOwner,
      newOwner: walletAddress.toLowerCase(),
      price: nft.price,
      txHash: buyResult.transactionHash,
    };
  } catch (error) {
    console.error("Error buying NFT:", error);
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

/**
 * Xác nhận hoàn tất giao dịch mua NFT
 * @param {String} tokenId - ID của NFT
 * @param {String} txHash - Hash của giao dịch
 * @param {String} buyer - Địa chỉ ví của người mua
 * @returns {Object} Kết quả xác nhận
 */
const purchaseComplete = async (tokenId, txHash, buyer) => {
  try {
    // Kiểm tra NFT có tồn tại không
    const nft = await NFTCache.findOne({ tokenId });

    if (!nft) {
      throw new Error("NFT không tồn tại");
    }

    // Xác minh giao dịch trên blockchain
    const isValidTx = await blockchainService.verifyTransaction(
      txHash,
      buyer,
      tokenId
    );
    if (!isValidTx) {
      throw new Error("Giao dịch không hợp lệ");
    }

    // Lưu lại owner cũ để thông báo
    const previousOwner = nft.owner;

    // Cập nhật thông tin trong database
    const updatedNFT = await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          owner: buyer.toLowerCase(),
          forSale: false,
          price: "0",
          lastUpdated: new Date(),
        },
        $push: {
          transactions: {
            type: "sale",
            from: previousOwner,
            to: buyer.toLowerCase(),
            price: nft.price,
            timestamp: new Date(),
            txHash: txHash,
          },
        },
      },
      { new: true }
    );

    // Tạo thông báo cho người bán
    await notificationService.createNotification({
      recipient: previousOwner,
      type: "sale",
      sender: buyer.toLowerCase(),
      content: `NFT "${nft.metadata.name}" đã được bán với giá ${nft.price} DX`,
      targetType: "nft",
      targetId: tokenId,
    });

    return {
      tokenId,
      name: nft.metadata.name,
      previousOwner,
      newOwner: buyer.toLowerCase(),
      price: nft.price,
      txHash: txHash,
    };
  } catch (error) {
    console.error("Error processing purchase completion:", error);
    throw error;
  }
};

module.exports = {
  listNFTForSale,
  unlistNFT,
  buyNFT,
  purchaseComplete,
};