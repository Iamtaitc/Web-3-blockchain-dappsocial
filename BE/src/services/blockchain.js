const { ethers } = require('ethers');
const config = require('../config');

// ABIs
const DXTokenABI = require('../abis/DXToken.json').abi;
const NFTMediaABI = require('../abis/NFTMedia.json').abi;
const MarketplaceABI = require('../abis/Marketplace.json').abi;
const SubscriptionABI = require('../abis/Subscription.json').abi;

// Contract addresses
const contracts = {
  DXToken: config.CONTRACT_ADDRESSES.DXToken,
  NFTMedia: config.CONTRACT_ADDRESSES.NFTMedia,
  Marketplace: config.CONTRACT_ADDRESSES.Marketplace,
  Subscription: config.CONTRACT_ADDRESSES.Subscription
};

// Khởi tạo provider
const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(config.RPC_URL);
};

// Lấy contract instances (read-only)
const getContracts = () => {
  const provider = getProvider();
  
  return {
    dxToken: new ethers.Contract(contracts.DXToken, DXTokenABI, provider),
    nftMedia: new ethers.Contract(contracts.NFTMedia, NFTMediaABI, provider),
    marketplace: new ethers.Contract(contracts.Marketplace, MarketplaceABI, provider),
    subscription: new ethers.Contract(contracts.Subscription, SubscriptionABI, provider)
  };
};

// Lấy contract instances với quyền write
const getSignedContracts = (privateKey) => {
  const provider = getProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  
  return {
    dxToken: new ethers.Contract(contracts.DXToken, DXTokenABI, wallet),
    nftMedia: new ethers.Contract(contracts.NFTMedia, NFTMediaABI, wallet),
    marketplace: new ethers.Contract(contracts.Marketplace, MarketplaceABI, wallet),
    subscription: new ethers.Contract(contracts.Subscription, SubscriptionABI, wallet),
    wallet
  };
};

// Lấy số dư DX token
const getDXBalance = async (address) => {
  try {
    const { dxToken } = getContracts();
    const balance = await dxToken.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting DX balance:', error);
    throw new Error('Failed to get DX token balance');
  }
};

// Mint NFT
const mintNFT = async (privateKey, tokenURI, mediaType, royaltyPercent) => {
  try {
    const { nftMedia } = getSignedContracts(privateKey);
    
    // Convert royalty từ số thập phân (2.5) thành basis points (250)
    const royaltyBasisPoints = Math.floor(royaltyPercent * 100);
    
    const tx = await nftMedia.mintNFT(tokenURI, mediaType, royaltyBasisPoints);
    const receipt = await tx.wait();
    
    // Lấy thông tin event
    const event = receipt.events.find(e => e.event === 'NFTCreated');
    
    return {
      tokenId: event.args.tokenId.toString(),
      creator: event.args.creator,
      tokenURI: event.args.tokenURI,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw new Error('Failed to mint NFT');
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
      royaltyPercent: nft.royaltyPercent.toNumber() / 100
    };
  } catch (error) {
    console.error('Error getting NFT info:', error);
    throw new Error('Failed to get NFT information');
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
    const listTx = await marketplace.listNFT(tokenId, ethers.utils.parseEther(price.toString()));
    const receipt = await listTx.wait();
    
    // Lấy thông tin event
    const event = receipt.events.find(e => e.event === 'NFTListed');
    
    return {
      tokenId: event.args.tokenId.toString(),
      seller: event.args.seller,
      price: ethers.utils.formatEther(event.args.price),
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error listing NFT for sale:', error);
    throw new Error('Failed to list NFT for sale');
  }
};

// Mua NFT
const buyNFT = async (privateKey, tokenId) => {
  try {
    const { marketplace, dxToken } = getSignedContracts(privateKey);
    
    // Lấy thông tin listing
    const listing = await marketplace.listings(tokenId);
    
    // Approve token transfer
    const approveTx = await dxToken.approve(
      contracts.Marketplace, 
      listing.price
    );
    await approveTx.wait();
    
    // Mua NFT
    const buyTx = await marketplace.buyNFT(tokenId);
    const receipt = await buyTx.wait();
    
    // Lấy thông tin event
    const event = receipt.events.find(e => e.event === 'NFTSold');
    
    return {
      tokenId: event.args.tokenId.toString(),
      seller: event.args.seller,
      buyer: event.args.buyer,
      price: ethers.utils.formatEther(event.args.price),
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error buying NFT:', error);
    throw new Error('Failed to buy NFT');
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
    const totalFee = fee.mul(months);
    
    // Approve token transfer
    const approveTx = await dxToken.approve(contracts.Subscription, totalFee);
    await approveTx.wait();
    
    // Mua subscription
    const purchaseTx = await subscription.purchaseSubscription(level, months);
    const receipt = await purchaseTx.wait();
    
    // Lấy thông tin event
    const event = receipt.events.find(e => e.event === 'SubscriptionPurchased');
    
    return {
      user: event.args.user,
      level: event.args.level.toNumber(),
      months,
      expiration: new Date(event.args.expiration.toNumber() * 1000),
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    throw new Error('Failed to purchase subscription');
  }
};

// Lấy thông tin subscription
const getSubscriptionInfo = async (address) => {
  try {
    const { subscription } = getContracts();
    
    const [level, expiration] = await subscription.getSubscription(address);
    
    return {
      level: level.toNumber(),
      expiration: expiration.toNumber() > 0 ? new Date(expiration.toNumber() * 1000) : null,
      isActive: expiration.toNumber() > Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    throw new Error('Failed to get subscription information');
  }
};

module.exports = {
  getProvider,
  getContracts,
  getDXBalance,
  mintNFT,
  getNFTInfo,
  listNFTForSale,
  buyNFT,
  purchaseSubscription,
  getSubscriptionInfo
};