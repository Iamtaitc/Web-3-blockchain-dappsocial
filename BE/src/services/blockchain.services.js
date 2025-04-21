const { ethers } = require("ethers");
const config = require("../configs/config.env");

// ABIs
const DXTokenABI = require("../abis/DXToken.json").abi;
const NFTMediaABI = require("../abis/NFTMedia.json").abi;
const MarketplaceABI = require("../abis/Marketplace.json").abi;
const SubscriptionABI = require("../abis/Subscription.json").abi;

// Contract addresses
const contracts = {
  DXToken: config.CONTRACT_ADDRESSES.DXToken,
  NFTMedia: config.CONTRACT_ADDRESSES.NFTMedia,
  Marketplace: config.CONTRACT_ADDRESSES.Marketplace,
  Subscription: config.CONTRACT_ADDRESSES.Subscription,
};

// Khởi tạo provider
const getProvider = () => {
  return new ethers.JsonRpcProvider(config.RPC_URL);
};

// Lấy contract instances (read-only)
const getContracts = () => {
  const provider = getProvider();

  return {
    dxToken: new ethers.Contract(contracts.DXToken, DXTokenABI, provider),
    nftMedia: new ethers.Contract(contracts.NFTMedia, NFTMediaABI, provider),
    marketplace: new ethers.Contract(
      contracts.Marketplace,
      MarketplaceABI,
      provider
    ),
    subscription: new ethers.Contract(
      contracts.Subscription,
      SubscriptionABI,
      provider
    ),
  };
};

// Lấy contract instances với quyền write
const getSignedContracts = (privateKey) => {
  const provider = getProvider();
  const wallet = new ethers.Wallet(privateKey, provider);

  return {
    dxToken: new ethers.Contract(contracts.DXToken, DXTokenABI, wallet),
    nftMedia: new ethers.Contract(contracts.NFTMedia, NFTMediaABI, wallet),
    marketplace: new ethers.Contract(
      contracts.Marketplace,
      MarketplaceABI,
      wallet
    ),
    subscription: new ethers.Contract(
      contracts.Subscription,
      SubscriptionABI,
      wallet
    ),
    wallet,
  };
};

const approveMarketplace = async (walletPrivateKey, amount) => {
  try {
    const provider = getProvider(); // Thêm dòng này
    const { dxToken, marketplace } = getSignedContracts(walletPrivateKey);

    // Convert amount to wei format
    const amountInWei = ethers.parseEther(amount.toString());

    // Approve marketplace to spend tokens
    const tx = await dxToken.approve(marketplace.target, amountInWei);
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error("Error approving tokens:", error);
    throw error;
  }
};

// Lấy số dư DX token
const getDXBalance = async (address) => {
  try {
    const { dxToken } = getContracts();
    const balance = await dxToken.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting DX balance:", error);
    throw new Error("Failed to get DX token balance");
  }
};

// Mint NFT
const mintNFT = async (privateKey, tokenURI, mediaType, royaltyPercent) => {
  try {
    const { nftMedia, wallet } = getSignedContracts(privateKey);
    const userAddress = wallet.address;

    // Convert royalty từ số thập phân (2.5) thành basis points (250)
    const royaltyBasisPoints = Math.floor(royaltyPercent * 100);

    console.log(
      `Minting NFT with URI: ${tokenURI}, mediaType: ${mediaType}, royalty: ${royaltyBasisPoints} basis points`
    );

    // Mint NFT
    const tx = await nftMedia.mintNFT(tokenURI, mediaType, royaltyBasisPoints);
    console.log(`Transaction hash: ${tx.hash}`);

    // Đợi transaction hoàn thành
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Phân tích transaction logs để tìm sự kiện NFTCreated
    // Trong ethers.js v6, cần thêm logic để phân tích logs
    let tokenId = null;
    let creator = null;

    // Duyệt qua tất cả logs
    for (const log of receipt.logs) {
      try {
        // Kiểm tra xem log có phải từ contract của chúng ta không
        if (log.address.toLowerCase() === nftMedia.target.toLowerCase()) {
          // Cố gắng decode log với ABI của sự kiện NFTCreated
          const parsedLog = nftMedia.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          // Kiểm tra xem log có phải là sự kiện NFTCreated không
          if (parsedLog && parsedLog.name === "NFTCreated") {
            tokenId = parsedLog.args[0]; // tokenId
            creator = parsedLog.args[1]; // creator
            // Không cần lấy tokenURI vì đã có
            break;
          }
        }
      } catch (error) {
        // Bỏ qua lỗi khi parsing log không thành công
        continue;
      }
    }

    // Nếu không tìm thấy tokenId từ event, sử dụng phương pháp thay thế
    if (!tokenId) {
      console.warn(
        "Could not extract tokenId from event, using alternative method"
      );

      // Lấy balance của người dùng
      const balance = await nftMedia.balanceOf(userAddress);

      // Kiểm tra xem người dùng có NFT không
      if (balance <= 0) {
        throw new Error("NFT minting seems to have failed, user has no NFTs");
      }

      // Lấy tokenId của NFT mới nhất của người dùng
      for (let i = 0; i < balance; i++) {
        // tokenOfOwnerByIndex có thể không có sẵn nếu contract không implement ERC721Enumerable
        try {
          const id = await nftMedia.tokenOfOwnerByIndex(
            userAddress,
            balance - 1 - i
          );
          // Kiểm tra xem token này có tokenURI trùng khớp không
          const uri = await nftMedia.tokenURI(id);
          if (uri === tokenURI) {
            tokenId = id;
            creator = userAddress; // Người mint là creator
            break;
          }
        } catch (error) {
          console.warn(
            "Contract may not support tokenOfOwnerByIndex:",
            error.message
          );
          // Phương pháp cuối cùng: truy vấn transaction cho các sự kiện Transfer
          tokenId = await findTokenIdFromTransferEvents(
            nftMedia,
            receipt,
            userAddress
          );
          if (tokenId) {
            creator = userAddress;
          }
          break;
        }
      }
    }

    if (!tokenId) {
      throw new Error("Could not determine the token ID of the minted NFT");
    }

    // Convert tokenId từ BigInt sang string nếu cần
    const tokenIdStr = tokenId.toString();

    // Lấy thông tin NFT
    let nftInfo;
    try {
      nftInfo = await nftMedia.nfts(tokenId);
    } catch (error) {
      console.warn("Could not get NFT info:", error.message);
      // Nếu không lấy được info, vẫn trả về thông tin cơ bản
      nftInfo = {
        creator: creator || userAddress,
      };
    }

    return {
      tokenId: tokenIdStr,
      creator: nftInfo.creator || creator || userAddress,
      tokenURI: tokenURI,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
};

// Hàm hỗ trợ để tìm tokenId từ sự kiện Transfer
async function findTokenIdFromTransferEvents(
  nftContract,
  receipt,
  userAddress
) {
  try {
    // Trong ERC721, khi mint sẽ có sự kiện Transfer từ address(0) đến người nhận
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    for (const log of receipt.logs) {
      try {
        if (log.address.toLowerCase() === nftContract.target.toLowerCase()) {
          const transferEvent = nftContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (transferEvent && transferEvent.name === "Transfer") {
            const [from, to, id] = transferEvent.args;

            // Kiểm tra xem đây có phải là mint operation không (from = address(0))
            if (
              from.toLowerCase() === zeroAddress.toLowerCase() &&
              to.toLowerCase() === userAddress.toLowerCase()
            ) {
              return id;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding tokenId from Transfer events:", error);
    return null;
  }
}

// Mint reward tokens to a user
const mintReward = async (privateKey, recipientAddress, amount) => {
  try {
    // Validate inputs
    if (!privateKey || typeof privateKey !== "string") {
      throw new Error("Invalid private key");
    }

    if (!ethers.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error("Invalid amount");
    }

    // Get signed contract instance with admin wallet
    const { dxToken, wallet } = getSignedContracts(privateKey);

    // Convert amount to proper format (with decimals)
    const tokenAmount = ethers.parseEther(amount);

    // Check admin balance to ensure they have enough tokens to distribute
    const adminBalance = await dxToken.balanceOf(wallet.address);
    if (adminBalance < tokenAmount) {
      throw new Error("Insufficient tokens in admin wallet for rewards");
    }

    // Execute the token transfer
    const tx = await dxToken.transfer(recipientAddress, tokenAmount);
    const receipt = await tx.wait();

    console.log(`Reward minted: ${amount} tokens to ${recipientAddress}`);

    return {
      recipientAddress,
      amount: amount,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Error minting reward tokens:", error);
    throw new Error(`Failed to mint reward tokens: ${error.message}`);
  }
};

// Lấy thông tin NFT
const getNFTInfo = async (tokenId) => {
  try {
    const { nftMedia } = getContracts();

    const nft = await nftMedia.nfts(tokenId);
    const owner = await nftMedia.ownerOf(tokenId);
    const tokenURI = await nftMedia.tokenURI(tokenId);

    return {
      tokenId,
      creator: nft.creator,
      owner,
      tokenURI,
      mediaType: nft.mediaType,
      royaltyPercent: nft.royaltyPercent / 100, // Chuyển đổi BigInt sang number
    };
  } catch (error) {
    console.error("Error getting NFT info:", error);
    throw new Error("Failed to get NFT information");
  }
};

// Đăng bán NFT
const listNFTForSale = async (privateKey, tokenId, price) => {
  try {
    const { marketplace, nftMedia } = getSignedContracts(privateKey);

    // Approve marketplace trước
    const approveTx = await nftMedia.approve(contracts.Marketplace, tokenId);
    await approveTx.wait();

    // List NFT
    const listTx = await marketplace.listNFT(
      tokenId,
      ethers.parseEther(price.toString())
    );
    const receipt = await listTx.wait();

    // Xử lý events cho ethers.js v6
    let nftListedEvent = null;

    // Duyệt qua logs để tìm event NFTListed
    for (const log of receipt.logs) {
      try {
        const parsedLog = marketplace.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog && parsedLog.name === "NFTListed") {
          nftListedEvent = parsedLog;
          break;
        }
      } catch (e) {
        // Bỏ qua logs không phân tích được
        continue;
      }
    }

    if (!nftListedEvent) {
      throw new Error(
        "Không tìm thấy sự kiện NFTListed trong transaction receipt"
      );
    }

    // Truy cập đối số event
    return {
      tokenId: nftListedEvent.args[0].toString(), // tokenId
      seller: nftListedEvent.args[1], // seller
      price: ethers.formatEther(nftListedEvent.args[2]), // price
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error listing NFT for sale:", error);
    throw new Error(`Không thể list NFT để bán: ${error.message}`);
  }
};

// Hủy đăng bán NFT - Chức năng mới được thêm vào
const unlistNFT = async (privateKey, tokenId) => {
  try {
    const { marketplace } = getSignedContracts(privateKey);

    // Thực hiện hủy đăng bán NFT trên blockchain
    const unlistTx = await marketplace.unlistNFT(tokenId);
    const receipt = await unlistTx.wait();

    // Xử lý events cho ethers.js v6
    let nftUnlistedEvent = null;

    // Duyệt qua logs để tìm event NFTUnlisted hoặc ListingCancelled
    for (const log of receipt.logs) {
      try {
        const parsedLog = marketplace.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        // Tên event có thể là NFTUnlisted hoặc ListingCancelled tùy thuộc vào contract implementation
        if (
          parsedLog &&
          (parsedLog.name === "NFTUnlisted" ||
            parsedLog.name === "ListingCancelled")
        ) {
          nftUnlistedEvent = parsedLog;
          break;
        }
      } catch (e) {
        // Bỏ qua logs không phân tích được
        continue;
      }
    }

    if (!nftUnlistedEvent) {
      // Nếu không tìm thấy event cụ thể, vẫn trả về thông tin cơ bản
      console.warn(
        "Không tìm thấy sự kiện hủy đăng bán trong transaction receipt"
      );
      return {
        tokenId: tokenId.toString(),
        transactionHash: receipt.hash,
      };
    }

    // Trả về thông tin từ event nếu có
    return {
      tokenId: tokenId.toString(),
      seller: nftUnlistedEvent.args[1] || nftUnlistedEvent.args.seller || "",
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error unlisting NFT:", error);
    throw new Error(`Không thể hủy đăng bán NFT: ${error.message}`);
  }
};

// Mua NFT
const buyNFT = async (privateKey, tokenId) => {
  try {
    const { marketplace } = getSignedContracts(privateKey);

    // Gọi hàm buyNFT trên smart contract
    const tx = await marketplace.buyNFT(tokenId);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Blockchain error buying NFT:", error);
    throw error;
  }
};

const verifyTransaction = async (txHash, buyer, tokenId) => {
  try {
    const provider = getProvider();
    
    // Lấy transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    // Kiểm tra transaction có tồn tại và thành công
    if (!receipt || receipt.status !== 1) {
      return false;
    }
    
    const { marketplace } = getContracts();
    
    // Tìm event NFTSold trong logs
    for (const log of receipt.logs) {
      try {
        // Chỉ check các log từ marketplace contract
        if (log.address.toLowerCase() === marketplace.target.toLowerCase()) {
          const parsedLog = marketplace.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          
          if (parsedLog && parsedLog.name === "NFTSold") {
            // Kiểm tra tokenId trong event
            const eventTokenId = parsedLog.args[0];
            if (eventTokenId.toString() === tokenId.toString()) {
              // Kiểm tra buyer trong event nếu cần
              const buyer = parsedLog.args[2];
              return true;
            }
          }
        }
      } catch (e) {
        // Bỏ qua lỗi khi parse log, tiếp tục kiểm tra log tiếp theo
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return false;
  }
};

// Mua subscription
const purchaseSubscription = async (privateKey, level, months) => {
  try {
    const { subscription, dxToken } = getSignedContracts(privateKey);

    // Lấy giá subscription
    let fee;
    if (level === 1) fee = await subscription.feeStandard();
    else if (level === 2) fee = await subscription.feePlus();
    else if (level === 5) fee = await subscription.feePro();
    else if (level === 10) fee = await subscription.feeElite();

    // Tính tổng phí
    const totalFee = fee * BigInt(months);

    // Approve token transfer
    const approveTx = await dxToken.approve(contracts.Subscription, totalFee);
    await approveTx.wait();

    // Mua subscription
    const purchaseTx = await subscription.purchaseSubscription(level, months);
    const receipt = await purchaseTx.wait();

    // Xử lý events cho ethers.js v6
    let subscriptionEvent = null;

    // Duyệt qua logs để tìm event SubscriptionPurchased
    for (const log of receipt.logs) {
      try {
        const parsedLog = subscription.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog && parsedLog.name === "SubscriptionPurchased") {
          subscriptionEvent = parsedLog;
          break;
        }
      } catch (e) {
        // Bỏ qua logs không phân tích được
        continue;
      }
    }

    if (!subscriptionEvent) {
      throw new Error(
        "Không tìm thấy sự kiện SubscriptionPurchased trong transaction receipt"
      );
    }

    // Truy cập đối số event
    return {
      user: subscriptionEvent.args[0], // user
      level: Number(subscriptionEvent.args[1]), // level
      months,
      expiration: new Date(Number(subscriptionEvent.args[2]) * 1000), // expiration
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error purchasing subscription:", error);
    throw new Error(`Không thể mua subscription: ${error.message}`);
  }
};

// Lấy thông tin subscription
const getSubscriptionInfo = async (address) => {
  try {
    const { subscription } = getContracts();

    const [level, expiration] = await subscription.getSubscription(address);

    // Chuyển đổi sang số JavaScript
    const levelNum = Number(level);
    const expirationNum = Number(expiration);

    return {
      level: levelNum,
      expiration: expirationNum > 0 ? new Date(expirationNum * 1000) : null,
      isActive: expirationNum > Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error("Error getting subscription info:", error);
    throw new Error("Failed to get subscription information");
  }
};

module.exports = {
  getProvider,
  getContracts,
  getSignedContracts,
  getDXBalance,
  mintNFT,
  getNFTInfo,
  listNFTForSale,
  unlistNFT, // Xuất chức năng mới được thêm vào
  buyNFT,
  purchaseSubscription,
  getSubscriptionInfo,
  mintReward,
  approveMarketplace,
  verifyTransaction,
};
