// services/nftService.js
const NFTCache = require("../models/NFTCache.mongoose");
const User = require("../models/User.mongoose");
const blockchainService = require("./blockchain.services");
const ipfsService = require("./ipfs.services");
const notificationService = require("./notification.services");
const { retryOperation } = require("../utils/retry.utils");

class NFTService {
  /**
   * Lấy tất cả NFTs với các filter
   */
  async getAllNFTs(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      // Xây dựng query dựa trên filters
      const query = {};

      if (filters.creator) {
        query.creator = filters.creator.toLowerCase();
      }

      if (filters.owner) {
        query.owner = filters.owner.toLowerCase();
      }

      if (filters.forSale === "true") {
        query.forSale = true;
      }

      if (filters.mediaType) {
        query.mediaType = filters.mediaType;
      }

      // Lấy NFTs
      const nfts = await NFTCache.find(query)
        .sort({ mintedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy tổng số NFTs để phân trang
      const total = await NFTCache.countDocuments(query);

      // Format response
      const formattedNFTs = nfts.map((nft) => ({
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner: nft.owner,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: ipfsService.ipfsUriToGatewayUrl(nft.metadata.image),
        },
        mediaType: nft.mediaType,
        forSale: nft.forSale,
        price: nft.price,
        royaltyPercent: nft.royaltyPercent,
        viewCount: nft.viewCount,
        mintedAt: nft.mintedAt,
      }));

      return {
        nfts: formattedNFTs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting NFTs:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết NFT
   */
  async getNFTById(tokenId) {
    try {
      // Lấy thông tin NFT
      const nft = await NFTCache.findOne({ tokenId });

      if (!nft) {
        throw new Error("NFT không tồn tại");
      }

      // Lấy thông tin creator và owner
      const creator = await User.findOne({ walletAddress: nft.creator });
      const owner = await User.findOne({ walletAddress: nft.owner });

      // Tăng view count
      await NFTCache.updateOne({ tokenId }, { $inc: { viewCount: 1 } });

      // Format response
      const nftResponse = {
        tokenId: nft.tokenId,
        creator: nft.creator,
        creatorDetails: creator
          ? {
              username: creator.username,
              avatarURI: ipfsService.ipfsUriToGatewayUrl(creator.avatarURI),
              isVerified: creator.isVerified,
            }
          : null,
        owner: nft.owner,
        ownerDetails: owner
          ? {
              username: owner.username,
              avatarURI: ipfsService.ipfsUriToGatewayUrl(owner.avatarURI),
              isVerified: owner.isVerified,
            }
          : null,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: ipfsService.ipfsUriToGatewayUrl(nft.metadata.image),
          attributes: nft.metadata.attributes || [],
        },
        mediaType: nft.mediaType,
        forSale: nft.forSale,
        price: nft.price,
        royaltyPercent: nft.royaltyPercent,
        viewCount: nft.viewCount + 1, // Đã tăng view count
        transactions: nft.transactions,
        mintedAt: nft.mintedAt,
      };

      return { nft: nftResponse };
    } catch (error) {
      console.error("Error getting NFT details:", error);
      throw error;
    }
  }

  /**
   * Mint NFT mới
   */
  async mintNFT(data, walletAddress, fileBuffer, mimetype, originalname) {
    try {
      const { name, description, royaltyPercent } = data;

      // Determine media type
      const mediaType = mimetype.startsWith("image/")
        ? "image"
        : mimetype.startsWith("video/")
          ? "video"
          : "audio";

      // Upload file lên IPFS
      const filename = `${Date.now()}-${originalname}`;
      const imageCID = await ipfsService.uploadFile(fileBuffer, filename);
      console.log(`Media uploaded to IPFS with CID: ${imageCID}`);

      // Tạo metadata
      const metadata = {
        name,
        description,
        image: `ipfs://${imageCID}`,
        attributes: [
          { trait_type: "Creator", value: walletAddress },
          { trait_type: "Media Type", value: mediaType },
        ],
        created_at: new Date().toISOString(),
      };

      // Upload metadata lên IPFS
      const metadataCID = await ipfsService.uploadJSON(metadata);
      console.log(`Metadata uploaded to IPFS with CID: ${metadataCID}`);

      const tokenURI = `ipfs://${metadataCID}`;

      // Mint NFT trên blockchain
      const royaltyPercentValue = parseFloat(royaltyPercent);

      const mintResult = await retryOperation(async () => {
        return await blockchainService.mintNFT(
          process.env.PRIVATE_KEY,
          tokenURI,
          mediaType,
          royaltyPercentValue
        );
      }, 3);

      // Lưu thông tin vào database
      const newNFT = new NFTCache({
        tokenId: mintResult.tokenId,
        creator: walletAddress.toLowerCase(),
        owner: walletAddress.toLowerCase(),
        tokenURI,
        metadata: {
          name,
          description,
          image: `ipfs://${imageCID}`,
          attributes: metadata.attributes,
        },
        mediaType,
        forSale: false,
        royaltyPercent: royaltyPercentValue,
        mintedAt: new Date(),
        transactions: [
          {
            type: "mint",
            from: "0x0000000000000000000000000000000000000000",
            to: walletAddress.toLowerCase(),
            timestamp: new Date(),
            txHash: mintResult.transactionHash,
          },
        ],
      });

      await newNFT.save();

      // Cập nhật NFT count của user
      await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { $inc: { "socialStats.nftCount": 1 } }
      );

      return {
        tokenId: mintResult.tokenId,
        name,
        description,
        imageUrl: ipfsService.ipfsUriToGatewayUrl(`ipfs://${imageCID}`),
        mediaType,
        royaltyPercent: royaltyPercentValue,
        txHash: mintResult.transactionHash,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  /**
   * Đăng bán NFT
   */
  async listNFTForSale(tokenId, price, walletAddress) {
    try {
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error("Giá không hợp lệ");
      }

      // Kiểm tra NFT có tồn tại không
      const nft = await NFTCache.findOne({ tokenId });

      if (!nft) {
        throw new Error("NFT không tồn tại");
      }

      // Kiểm tra người dùng có phải là chủ sở hữu không
      if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error("Bạn không phải là chủ sở hữu của NFT này");
      }

      // Kiểm tra NFT đã đăng bán chưa
      if (nft.forSale) {
        throw new Error("NFT đã được đăng bán");
      }

      // Đăng bán NFT trên blockchain
      const listingResult = await retryOperation(async () => {
        return await blockchainService.listNFTForSale(
          process.env.PRIVATE_KEY,
          tokenId,
          price
        );
      }, 3);

      // Cập nhật thông tin trong database
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
        }
      );

      return {
        tokenId,
        price,
        txHash: listingResult.transactionHash,
      };
    } catch (error) {
      console.error("Error listing NFT for sale:", error);
      throw error;
    }
  }

  /**
   * Hủy đăng bán NFT
   */
  async unlistNFT(tokenId, walletAddress) {
    try {
      // Kiểm tra NFT có tồn tại không
      const nft = await NFTCache.findOne({ tokenId });

      if (!nft) {
        throw new Error("NFT không tồn tại");
      }

      // Kiểm tra người dùng có phải là chủ sở hữu không
      if (nft.owner.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error("Bạn không phải là chủ sở hữu của NFT này");
      }

      // Kiểm tra NFT có đang được đăng bán không
      if (!nft.forSale) {
        throw new Error("NFT không được đăng bán");
      }

      // Hủy đăng bán NFT trên blockchain
      const unlistResult = await retryOperation(async () => {
        return await blockchainService.unlistNFT(
          process.env.PRIVATE_KEY,
          tokenId
        );
      }, 3);

      // Cập nhật thông tin trong database
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
        }
      );

      return {
        tokenId,
        txHash: unlistResult.transactionHash,
      };
    } catch (error) {
      console.error("Error unlisting NFT:", error);
      throw error;
    }
  }

  /**
   * Mua NFT
   */
  async buyNFT(tokenId, walletAddress) {
    try {
      // Kiểm tra NFT có tồn tại không
      const nft = await NFTCache.findOne({ tokenId });

      if (!nft) {
        throw new Error("NFT không tồn tại");
      }

      // Kiểm tra NFT có đang được đăng bán không
      if (!nft.forSale) {
        throw new Error("NFT không được đăng bán");
      }

      // Kiểm tra người dùng không phải là chủ sở hữu
      if (nft.owner.toLowerCase() === walletAddress.toLowerCase()) {
        throw new Error("Bạn không thể mua NFT của chính mình");
      }

      // Kiểm tra balance DX token
      const balance = await blockchainService.getDXBalance(walletAddress);
      if (parseFloat(balance) < parseFloat(nft.price)) {
        throw new Error("Số dư DX token không đủ");
      }

      // Thực hiện mua NFT trên blockchain
      const buyResult = await retryOperation(async () => {
        return await blockchainService.buyNFT(process.env.PRIVATE_KEY, tokenId);
      }, 3);

      // Lưu lại owner cũ để thông báo
      const previousOwner = nft.owner;

      // Cập nhật thông tin trong database
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
        }
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
      throw error;
    }
  }

  /**
   * Lấy danh sách NFT trên marketplace
   */
  async getMarketplaceNFTs(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      // Lọc NFT đang bán
      const query = { forSale: true };

      // Lọc theo giá (min & max)
      if (filters.minPrice) {
        query.price = { $gte: filters.minPrice };
      }

      if (filters.maxPrice) {
        if (query.price) {
          query.price.$lte = filters.maxPrice;
        } else {
          query.price = { $lte: filters.maxPrice };
        }
      }

      // Lọc theo loại media
      if (filters.mediaType) {
        query.mediaType = filters.mediaType;
      }

      // Lấy NFTs
      const nfts = await NFTCache.find(query)
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(limit);

      // Lấy thông tin chi tiết của chủ sở hữu
      const ownerAddresses = [...new Set(nfts.map((nft) => nft.owner))];
      const owners = await User.find({
        walletAddress: { $in: ownerAddresses },
      }).select("walletAddress username avatarURI isVerified");

      const ownersMap = {};
      owners.forEach((owner) => {
        ownersMap[owner.walletAddress] = owner;
      });

      // Format response
      const formattedNFTs = nfts.map((nft) => ({
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner: nft.owner,
        ownerDetails: ownersMap[nft.owner]
          ? {
              username: ownersMap[nft.owner].username,
              avatarURI: ipfsService.ipfsUriToGatewayUrl(
                ownersMap[nft.owner].avatarURI
              ),
              isVerified: ownersMap[nft.owner].isVerified,
            }
          : null,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: ipfsService.ipfsUriToGatewayUrl(nft.metadata.image),
        },
        mediaType: nft.mediaType,
        price: nft.price,
        royaltyPercent: nft.royaltyPercent,
        viewCount: nft.viewCount,
        listedAt:
          nft.transactions.find((tx) => tx.type === "list")?.timestamp ||
          nft.lastUpdated,
      }));

      // Lấy tổng số NFTs để phân trang
      const total = await NFTCache.countDocuments(query);

      return {
        nfts: formattedNFTs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting marketplace NFTs:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách NFT của một creator
   */
  async getCreatorNFTs(address, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      // Kiểm tra creator có tồn tại không
      const creator = await User.findOne({
        walletAddress: address.toLowerCase(),
      });

      if (!creator) {
        throw new Error("Creator không tồn tại");
      }

      // Lấy NFTs của creator
      const nfts = await NFTCache.find({ creator: address.toLowerCase() })
        .sort({ mintedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Format response
      const formattedNFTs = nfts.map((nft) => ({
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner: nft.owner,
        metadata: {
          name: nft.metadata.name,
          description: nft.metadata.description,
          image: ipfsService.ipfsUriToGatewayUrl(nft.metadata.image),
        },
        mediaType: nft.mediaType,
        forSale: nft.forSale,
        price: nft.price,
        royaltyPercent: nft.royaltyPercent,
        viewCount: nft.viewCount,
        mintedAt: nft.mintedAt,
      }));

      // Lấy tổng số NFTs để phân trang
      const total = await NFTCache.countDocuments({
        creator: address.toLowerCase(),
      });

      return {
        creator: {
          walletAddress: creator.walletAddress,
          username: creator.username,
          avatarURI: ipfsService.ipfsUriToGatewayUrl(creator.avatarURI),
          isVerified: creator.isVerified,
        },
        nfts: formattedNFTs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting creator NFTs:", error);
      throw error;
    }
  }
}

module.exports = new NFTService();
