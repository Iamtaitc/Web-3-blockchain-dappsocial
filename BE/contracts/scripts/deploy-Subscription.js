const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`🚀 Deploying Subscription to ${network.name}...`);

  // 📌 Kiểm tra file `contract-addresses-step3.json`
  const step3Path = path.join(__dirname, "../contract-addresses-step3.json");
  if (!fs.existsSync(step3Path)) {
    throw new Error("❌ contract-addresses-step3.json not found! Please deploy Marketplace first.");
  }

  // 📌 Đọc địa chỉ DXToken từ file JSON
  const step3Data = JSON.parse(fs.readFileSync(step3Path, "utf-8"));
  const dxTokenAddress = step3Data.DXToken;
  if (!dxTokenAddress) {
    throw new Error("❌ DXToken address is missing in contract-addresses-step3.json!");
  }

  console.log(`✅ Using DXToken address: ${dxTokenAddress}`);

  // 📌 Lấy thông tin deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 📌 Kiểm tra số dư ETH trước khi deploy
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`);

  if (deployerBalance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient ETH balance for deployment!");
  }

  // 📌 Deploy Subscription
  console.log("🚀 Starting Subscription deployment...");
  const Subscription = await ethers.getContractFactory("Subscription");
  const subscription = await Subscription.deploy(
    dxTokenAddress,
    deployer.address // feeRecipient
  );

  // 📌 Lấy transaction hash
  const deploymentTx = subscription.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("❌ Deployment transaction is undefined! Something went wrong.");
  }

  console.log(`📜 Subscription transaction hash: ${deploymentTx.hash}`);

  // 📌 Chờ deployment hoàn tất
  console.log("⏳ Waiting for deployment to complete...");
  await subscription.waitForDeployment();
  const subscriptionAddress = await subscription.getAddress();

  console.log(`✅ Subscription deployed to: ${subscriptionAddress}`);

  // 📌 Cập nhật file JSON
  const addresses = {
    ...step3Data,
    Subscription: subscriptionAddress,
    updatedAt: new Date().toISOString()
  };

  // Lưu vào `contract-addresses-final.json`
  const finalPath = path.join(__dirname, "../contract-addresses-final.json");
  fs.writeFileSync(finalPath, JSON.stringify(addresses, null, 2));

  // Lưu vào `contract-addresses.json`
  const mainPath = path.join(__dirname, "../contract-addresses.json");
  fs.writeFileSync(mainPath, JSON.stringify(addresses, null, 2));

  console.log("✅ Contract addresses saved to contract-addresses-final.json and contract-addresses.json");

  // 📌 Gợi ý verify contract
  console.log(`\n🔍 To verify on Arbiscan:\nnpx hardhat verify --network ${network.name} ${subscriptionAddress} "${dxTokenAddress}" "${deployer.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("🚨 Deployment failed:", error);
    process.exit(1);
  });
