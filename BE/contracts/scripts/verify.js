// scripts/verify.js
const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Starting verification process on ${network.name}...`);

  // Đọc địa chỉ contract từ file contract-addresses.json
  let contractAddresses;
  try {
    contractAddresses = require("../contract-addresses.json");
    console.log(`Loaded contract addresses from chain: ${contractAddresses.network}`);
  } catch (error) {
    console.error("Error loading contract addresses:", error.message);
    console.log("Checking for contract-addresses-final.json...");
    
    try {
      contractAddresses = require("../contract-addresses-final.json");
      console.log(`Loaded contract addresses from contract-addresses-final.json`);
    } catch (innerError) {
      console.error("Could not find contract addresses file. Make sure to deploy contracts first.");
      process.exit(1);
    }
  }

  // Lấy địa chỉ các contract
  const dxTokenAddress = contractAddresses.DXToken;
  const nftMediaAddress = contractAddresses.NFTMedia;
  const marketplaceAddress = contractAddresses.Marketplace;
  const subscriptionAddress = contractAddresses.Subscription;
  const deployerAddress = contractAddresses.deployedBy;

  console.log(`DXToken: ${dxTokenAddress}`);
  console.log(`NFTMedia: ${nftMediaAddress}`);
  console.log(`Marketplace: ${marketplaceAddress}`);
  console.log(`Subscription: ${subscriptionAddress}`);
  console.log(`Deployer: ${deployerAddress}`);

  // Xác minh DXToken
  if (dxTokenAddress) {
    console.log("\n1. Verifying DXToken...");
    try {
      await run("verify:verify", {
        address: dxTokenAddress,
        constructorArguments: [
          deployerAddress, // treasuryAddress
          deployerAddress, // teamAddress
          deployerAddress, // ecosystemFundAddress
          deployerAddress  // rewardsPoolAddress
        ],
        contract: "contracts/DXToken.sol:DXToken"
      });
      console.log("DXToken verified successfully!");
    } catch (error) {
      console.error(`Error verifying DXToken: ${error.message}`);
    }
  }

  // Xác minh NFTMedia
  if (nftMediaAddress) {
    console.log("\n2. Verifying NFTMedia...");
    try {
      await run("verify:verify", {
        address: nftMediaAddress,
        constructorArguments: [],
        contract: "contracts/NFTMedia.sol:NFTMedia"
      });
      console.log("NFTMedia verified successfully!");
    } catch (error) {
      console.error(`Error verifying NFTMedia: ${error.message}`);
    }
  }

  // Xác minh Marketplace
  if (marketplaceAddress) {
    console.log("\n3. Verifying Marketplace...");
    try {
      await run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [
          dxTokenAddress,
          nftMediaAddress,
          deployerAddress // feeRecipient
        ],
        contract: "contracts/Marketplace.sol:Marketplace"
      });
      console.log("Marketplace verified successfully!");
    } catch (error) {
      console.error(`Error verifying Marketplace: ${error.message}`);
    }
  }

  // Xác minh Subscription
  if (subscriptionAddress) {
    console.log("\n4. Verifying Subscription...");
    try {
      await run("verify:verify", {
        address: subscriptionAddress,
        constructorArguments: [
          dxTokenAddress,
          deployerAddress // feeRecipient
        ],
        contract: "contracts/Subscription.sol:Subscription"
      });
      console.log("Subscription verified successfully!");
    } catch (error) {
      console.error(`Error verifying Subscription: ${error.message}`);
    }
  }

  console.log("\nVerification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });