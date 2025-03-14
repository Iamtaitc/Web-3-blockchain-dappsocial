const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Deploying NFTMedia to ${network.name}...`);

  // 📌 Kiểm tra xem contract-addresses-step1.json có tồn tại không
  const step1Path = path.join(__dirname, "../contract-addresses-step1.json");
  if (!fs.existsSync(step1Path)) {
    throw new Error("❌ contract-addresses-step1.json not found! Please deploy DXToken first.");
  }

  // 📌 Đọc địa chỉ DXToken từ file JSON
  const step1Data = JSON.parse(fs.readFileSync(step1Path, "utf-8"));
  const dxTokenAddress = step1Data.DXToken;
  if (!dxTokenAddress) {
    throw new Error("❌ DXToken address is missing in contract-addresses-step1.json!");
  }
  
  console.log(`✅ Using DXToken address: ${dxTokenAddress}`);

  // 📌 Lấy thông tin deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 📌 Kiểm tra số dư ETH trước khi deploy
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`);

  if (deployerBalance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient ETH balance for deployment!");
  }

  // 📌 Deploy NFTMedia
  console.log("🚀 Starting NFTMedia deployment...");
  const NFTMedia = await ethers.getContractFactory("NFTMedia");
  const nftMedia = await NFTMedia.deploy();
  
  // 📌 Lấy transaction hash
  const deploymentTx = nftMedia.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("❌ Deployment transaction is undefined! Something went wrong.");
  }
  
  console.log(`📜 NFTMedia transaction hash: ${deploymentTx.hash}`);
  
  // 📌 Chờ deployment hoàn tất
  console.log("⏳ Waiting for deployment to complete...");
  await nftMedia.waitForDeployment();
  const nftMediaAddress = await nftMedia.getAddress();

  console.log(`✅ NFTMedia deployed to: ${nftMediaAddress}`);

  // 📌 Cập nhật file JSON với địa chỉ mới
  const addresses = {
    ...step1Data,
    NFTMedia: nftMediaAddress,
    updatedAt: new Date().toISOString()
  };

  const step2Path = path.join(__dirname, "../contract-addresses-step2.json");
  fs.writeFileSync(step2Path, JSON.stringify(addresses, null, 2));

  console.log("✅ Contract addresses saved to contract-addresses-step2.json");

  // 📌 Gợi ý verify contract
  console.log(`\n🔍 To verify on Arbiscan:\nnpx hardhat verify --network ${network.name} ${nftMediaAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("🚨 Deployment failed:", error);
    process.exit(1);
  });
