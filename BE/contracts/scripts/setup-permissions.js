const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`🚀 Setting up permissions on ${network.name}...`);

  // 📌 Kiểm tra file `contract-addresses-final.json`
  const addressesPath = path.join(__dirname, "../contract-addresses-final.json");
  if (!fs.existsSync(addressesPath)) {
    throw new Error("❌ contract-addresses-final.json not found! Please deploy all contracts first.");
  }

  // 📌 Đọc địa chỉ từ file JSON
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));

  const dxTokenAddress = addresses.DXToken;
  const nftMediaAddress = addresses.NFTMedia;
  const subscriptionAddress = addresses.Subscription;

  if (!dxTokenAddress || !nftMediaAddress || !subscriptionAddress) {
    throw new Error("❌ Missing contract addresses in contract-addresses-final.json!");
  }

  console.log(`✅ DXToken: ${dxTokenAddress}`);
  console.log(`✅ NFTMedia: ${nftMediaAddress}`);
  console.log(`✅ Subscription: ${subscriptionAddress}`);

  // 📌 Lấy thông tin deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);

  // 📌 Kết nối đến DXToken
  const DXToken = await ethers.getContractFactory("DXToken");
  const dxToken = await DXToken.attach(dxTokenAddress);

  // 📌 Kiểm tra MINTER_ROLE có tồn tại không
  let MINTER_ROLE;
  try {
    MINTER_ROLE = await dxToken.MINTER_ROLE();
  } catch (error) {
    throw new Error("❌ DXToken contract does not have MINTER_ROLE!");
  }

  console.log("🚀 Granting minter roles...");

  // 📌 Cấp quyền cho NFTMedia
  let tx = await dxToken.grantRole(MINTER_ROLE, nftMediaAddress);
  console.log(`📜 Transaction hash (NFTMedia as minter): ${tx.hash}`);
  await tx.wait(1);
  console.log("✅ NFTMedia granted minter role");

  // 📌 Cấp quyền cho Subscription
  tx = await dxToken.grantRole(MINTER_ROLE, subscriptionAddress);
  console.log(`📜 Transaction hash (Subscription as minter): ${tx.hash}`);
  await tx.wait(1);
  console.log("✅ Subscription granted minter role");

  console.log("🎉 All permissions set up successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("🚨 Setup failed:", error);
    process.exit(1);
  });
