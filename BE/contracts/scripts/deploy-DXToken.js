const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Deploying DXToken to ${network.name}...`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`);

  if (deployerBalance < ethers.parseEther("0.01")) {
    console.error("⚠️ Error: Deployer balance too low! Please add more ETH.");
    return;
  }

  try {
    const treasuryAddress = deployer.address;
    const teamAddress = deployer.address;
    const ecosystemFundAddress = deployer.address;
    const rewardsPoolAddress = deployer.address;

    const DXToken = await ethers.getContractFactory("DXToken");
    console.log("Starting DXToken deployment...");

    const dxToken = await DXToken.deploy(
      treasuryAddress,
      teamAddress,
      ecosystemFundAddress,
      rewardsPoolAddress
    );

    console.log(`DXToken transaction hash: ${dxToken.deploymentTransaction().hash}`);

    console.log("Waiting for deployment to complete...");
    await dxToken.waitForDeployment();
    const dxTokenAddress = await dxToken.getAddress();

    console.log(`DXToken deployed to: ${dxTokenAddress}`);

    // Lưu địa chỉ vào file
    const addresses = {
      network: network.name,
      DXToken: dxTokenAddress,
      deployedBy: deployer.address,
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(__dirname, "../contract-addresses-step1.json"),
      JSON.stringify(addresses, null, 2)
    );

    console.log("✅ Contract address saved to contract-addresses-step1.json");
    console.log(`\nTo verify on Arbiscan:\nnpx hardhat verify --network ${network.name} ${dxTokenAddress} "${treasuryAddress}" "${teamAddress}" "${ecosystemFundAddress}" "${rewardsPoolAddress}"`);

  } catch (error) {
    console.error("🚨 Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("🚨 Unexpected error:", error);
    process.exit(1);
  });
