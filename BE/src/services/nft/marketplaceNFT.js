const NFTCache = require("../../models/NFTCache.mongoose");
const blockchainService = require("../blockchain.services");
const notificationService = require("../notification.services");
const { retryOperation } = require("../../utils/retry.utils");

/**
 * Đăng bán NFT
 * @param {String} tokenId - ID của NFT
 * @param {String} price - Giá bán (in ETH)
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
    const nft = await NFTCache.findOne({ tokenId });
    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      };
    }
    if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 404,
        message: "Bạn không phải là chủ sở hữu của NFT này",
      };
    }
    if (nft.forSale) {
      return {
        success: false,
        status: 404,
        message: "NFT đã được đăng bán",
      };
    }
    const listingResult = await retryOperation(async () => {
      return await blockchainService.listNFTForSale(
        process.env.PRIVATE_KEY,
        tokenId,
        price
      );
    }, 3);
    await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          forSale: true,
          price,
          priceInETH: true, // Thêm flag để đánh dấu là giá bằng ETH
          lastUpdated: new Date(),
        },
        $push: {
          transactions: {
            type: "list",
            from: walletAddress.toLowerCase(),
            to: walletAddress.toLowerCase(),
            price,
            currency: "ETH", // Thêm loại tiền tệ
            timestamp: new Date(),
            txHash: listingResult.transactionHash,
          },
        },
      },
      { new: true }
    );

    // Tạo thông báo về việc đăng bán NFT
    await notificationService.createNotification({
      type: "nft_listed",
      userId: nft.creator, // Gửi thông báo cho người tạo NFT nếu khác với người bán
      data: {
        tokenId,
        price,
        currency: "ETH",
        seller: walletAddress,
        nftName: nft.name || `NFT #${tokenId}`,
        imageUrl: nft.imageUrl || null,
      },
    });

    return {
      tokenId,
      price,
      currency: "ETH",
      success: true,
      status: 200,
      message: "NFT đã được đăng bán thành công",
      transactionHash: listingResult.transactionHash,
    };
  } catch (error) {
    console.error("Error listing NFT for sale:", error);
    return {
      success: false,
      status: 500,
      message: `Không thể đăng bán NFT: ${error.message}`,
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
    const nft = await NFTCache.findOne({ tokenId });
    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      };
    }

    if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        status: 403,
        message: "Bạn không phải là chủ sở hữu của NFT này",
      };
    }

    if (!nft.forSale) {
      return {
        success: false,
        status: 400,
        message: "NFT hiện không được đăng bán",
      };
    }

    const unlistResult = await retryOperation(async () => {
      return await blockchainService.unlistNFT(
        process.env.PRIVATE_KEY,
        tokenId
      );
    }, 3);

    await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          forSale: false,
          price: null,
          priceInETH: false,
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
      success: true,
      status: 200,
      message: "Đã hủy đăng bán NFT thành công",
      transactionHash: unlistResult.transactionHash,
    };
  } catch (error) {
    console.error("Error unlisting NFT:", error);
    return {
      success: false,
      status: 500,
      message: `Không thể hủy đăng bán NFT: ${error.message}`,
    };
  }
};

/**
 * Lấy thông tin đăng bán của NFT
 * @param {String} tokenId - ID của NFT
 * @returns {Object} Thông tin đăng bán
 */
const getNFTListingInfo = async (tokenId) => {
  try {
    // Lấy thông tin từ cache trước
    const nftCache = await NFTCache.findOne({ tokenId });

    if (!nftCache || !nftCache.forSale) {
      // Truy vấn blockchain để kiểm tra
      const listing = await blockchainService.getNFTListing(tokenId);

      if (!listing || !listing.active) {
        return {
          success: false,
          status: 404,
          message: "NFT không được đăng bán",
        };
      }

      // Cập nhật cache nếu có sự không đồng bộ
      if (nftCache && !nftCache.forSale) {
        await NFTCache.findOneAndUpdate(
          { tokenId },
          {
            $set: {
              forSale: true,
              price: listing.price,
              priceInETH: true,
              lastUpdated: new Date(),
            },
          }
        );
      }

      return {
        tokenId: listing.tokenId,
        seller: listing.seller,
        price: listing.price,
        currency: "ETH",
        active: listing.active,
        success: true,
        status: 200,
      };
    }

    // Trả về thông tin từ cache
    return {
      tokenId: nftCache.tokenId,
      seller: nftCache.owner,
      price: nftCache.price,
      currency: "ETH",
      active: nftCache.forSale,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error getting NFT listing info:", error);
    return {
      success: false,
      status: 500,
      message: `Không thể lấy thông tin đăng bán NFT: ${error.message}`,
    };
  }
};

/**
 * Chuẩn bị thông tin để mua NFT
 * @param {String} tokenId - ID của NFT
 * @param {String} buyerAddress - Địa chỉ ví của người mua
 * @returns {Object} Thông tin cần thiết để thực hiện giao dịch từ frontend
 */
const prepareNFTPurchase = async (tokenId, buyerAddress) => {
  try {
    const nft = await NFTCache.findOne({ tokenId });
    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại",
      };
    }

    if (!nft.forSale) {
      return {
        success: false,
        status: 400,
        message: "NFT này không được đăng bán",
      };
    }

    if (nft.owner.toLowerCase() === buyerAddress.toLowerCase()) {
      return {
        success: false,
        status: 400,
        message: "Bạn đã là chủ sở hữu của NFT này",
      };
    }

    // Lấy thông tin listing từ blockchain để đảm bảo giá mới nhất
    const listing = await blockchainService.getNFTListing(tokenId);

    if (!listing || !listing.active) {
      // Cập nhật cache nếu có sự không đồng bộ
      await NFTCache.findOneAndUpdate(
        { tokenId },
        {
          $set: {
            forSale: false,
            price: null,
            priceInETH: false,
            lastUpdated: new Date(),
          },
        }
      );

      return {
        success: false,
        status: 400,
        message: "NFT này không còn được đăng bán trên blockchain",
      };
    }
    // const buyResult = await blockchainService.buyNFT(
    //   process.env.PRIVATE_KEY,
    //   tokenId
    // );
    // if (!buyResult.transactionHash) {
    //   return {
    //     success: false,
    //     status: 500,
    //     message: "Không thể mua NFT",
    //   };
    // }
    // Trả về thông tin cần thiết để frontend tạo giao dịch
    return {
      success: true,
      status: 200,
      data: {
        tokenId,
        seller: listing.seller,
        price: listing.price,
        contractAddress: blockchainService.getContracts().marketplace.target, // Địa chỉ của marketplace contract
        buyFunctionSignature: "buyNFT(uint256)", // Chữ ký hàm để frontend gọi
        // transactionHash: buyResult.transactionHash,
        // buyer: buyResult.buyer,
        nftInfo: {
          name: nft.name || `NFT #${tokenId}`,
          imageUrl: nft.imageUrl || null,
          description: nft.description || null,
        },
      },
    };
  } catch (error) {
    console.error("Error preparing NFT purchase:", error);
    return {
      success: false,
      status: 500,
      message: `Không thể chuẩn bị thông tin mua NFT: ${error.message}`,
    };
  }
};

/**
 * Xử lý kết quả giao dịch mua NFT từ frontend
 * @param {String} txHash - Hash của giao dịch
 * @param {String} tokenId - ID của NFT
 * @param {String} buyerAddress - Địa chỉ của người mua
 * @returns {Object} Kết quả xử lý giao dịch
 */
const processNFTPurchase = async (txHash, tokenId, buyerAddress) => {
  try {
    // Xác minh giao dịch
    const isValid = await blockchainService.verifyTransaction(
      txHash,
      buyerAddress,
      tokenId
    );

    if (!isValid) {
      return {
        success: false,
        status: 400,
        message: "Giao dịch không hợp lệ hoặc chưa hoàn thành",
      };
    }

    // Lấy thông tin NFT hiện tại
    const nft = await NFTCache.findOne({ tokenId });
    if (!nft) {
      return {
        success: false,
        status: 404,
        message: "NFT không tồn tại trong hệ thống",
      };
    }

    const currentOwner = nft.owner;
    const price = nft.price;

    // Cập nhật thông tin trong cache
    await NFTCache.findOneAndUpdate(
      { tokenId },
      {
        $set: {
          owner: buyerAddress.toLowerCase(),
          forSale: false,
          price: null,
          priceInETH: false,
          lastUpdated: new Date(),
        },
        $push: {
          transactions: {
            type: "purchase",
            from: currentOwner.toLowerCase(),
            to: buyerAddress.toLowerCase(),
            price,
            currency: "ETH",
            timestamp: new Date(),
            txHash,
          },
        },
      },
      { new: true }
    );

    // Gửi thông báo cho người bán
    await notificationService.createNotification({
      type: "nft_sold",
      userId: currentOwner,
      data: {
        tokenId,
        price,
        currency: "ETH",
        buyer: buyerAddress,
        nftName: nft.name || `NFT #${tokenId}`,
        imageUrl: nft.imageUrl || null,
      },
    });

    // Gửi thông báo cho người tạo NFT (nếu có phí royalty)
    if (nft.creator.toLowerCase() !== currentOwner.toLowerCase()) {
      const royaltyAmount =
        (parseFloat(price) * (nft.royaltyPercent || 0)) / 100;
      if (royaltyAmount > 0) {
        await notificationService.createNotification({
          type: "royalty_received",
          userId: nft.creator,
          data: {
            tokenId,
            price,
            royaltyAmount: royaltyAmount.toFixed(6),
            currency: "ETH",
            nftName: nft.name || `NFT #${tokenId}`,
            imageUrl: nft.imageUrl || null,
          },
        });
      }
    }

    return {
      tokenId,
      price,
      currency: "ETH",
      success: true,
      status: 200,
      message: "NFT đã được mua thành công",
      transactionHash: txHash,
    };
  } catch (error) {
    console.error("Error processing NFT purchase:", error);
    return {
      success: false,
      status: 500,
      message: `Không thể xử lý giao dịch mua NFT: ${error.message}`,
    };
  }
};
module.exports = {
  listNFTForSale,
  unlistNFT,
  getNFTListingInfo,
  processNFTPurchase,
  prepareNFTPurchase,
};
