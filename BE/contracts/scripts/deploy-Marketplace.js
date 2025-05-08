const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`🚀 Deploying Marketplace to ${network.name}...`);

  // 📌 Kiểm tra file `contract-addresses-step2.json`
  const step2Path = path.join(__dirname, "../contract-addresses-step2.json");
  if (!fs.existsSync(step2Path)) {
    throw new Error(
      "❌ contract-addresses-step2.json not found! Please deploy NFTMedia first."
    );
  }

  // 📌 Đọc địa chỉ DXToken và NFTMedia từ bước 2
  const step2Data = JSON.parse(fs.readFileSync(step2Path, "utf-8"));
  const dxTokenAddress = step2Data.DXToken;
  const nftMediaAddress = step2Data.NFTMedia;

  if (!dxTokenAddress || !nftMediaAddress) {
    throw new Error(
      "❌ Missing DXToken or NFTMedia address in contract-addresses-step2.json!"
    );
  }

  console.log(`✅ Using DXToken address: ${dxTokenAddress}`);
  console.log(`✅ Using NFTMedia address: ${nftMediaAddress}`);

  // 📌 Lấy thông tin deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 📌 Kiểm tra số dư ETH
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(
    `💰 Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`
  );

  if (deployerBalance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient ETH balance for deployment!");
  }

  // 📌 Deploy Marketplace
  console.log("🚀 Starting Marketplace deployment...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    nftMediaAddress,
    deployer.address // feeRecipient
  );

  // 📌 Lấy transaction hash
  const deploymentTx = marketplace.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error(
      "❌ Deployment transaction is undefined! Something went wrong."
    );
  }

  console.log(`📜 Marketplace transaction hash: ${deploymentTx.hash}`);

  // 📌 Chờ deployment hoàn tất
  console.log("⏳ Waiting for deployment to complete...");
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log(`✅ Marketplace deployed to: ${marketplaceAddress}`);

  // 📌 Cập nhật file JSON
  const addresses = {
    ...step2Data,
    Marketplace: marketplaceAddress,
    updatedAt: new Date().toISOString(),
  };

  const step3Path = path.join(__dirname, "../contract-addresses-step3.json");
  fs.writeFileSync(step3Path, JSON.stringify(addresses, null, 2));

  console.log("✅ Contract addresses saved to contract-addresses-step3.json");

  // 📌 Gợi ý verify contract
  console.log(
    `\n🔍 To verify on Arbiscan:\nnpx hardhat verify --network ${network.name} ${marketplaceAddress} "${nftMediaAddress}" "${deployer.address}"`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("🚨 Deployment failed:", error);
    process.exit(1);
  });
