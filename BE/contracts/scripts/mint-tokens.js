const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  const amount = process.env.AMOUNT || "1000";
  let recipient = process.env.RECIPIENT || "";
  
  if (!recipient) {
    throw new Error("Please provide a RECIPIENT environment variable");
  }
  
  // Check if the recipient might be a private key instead of an address
  if (recipient.length === 64 || (recipient.startsWith("0x") && recipient.length === 66)) {
    console.log("Warning: The provided recipient appears to be a private key, not an address.");
    console.log("Attempting to derive the address from the private key...");
    
    // Remove 0x prefix if present
    if (recipient.startsWith("0x")) {
      recipient = recipient.substring(2);
    }
    
    try {
      // Create a wallet from the private key to get the address
      const wallet = new ethers.Wallet(recipient);
      recipient = wallet.address;
      console.log(`Derived address: ${recipient}`);
    } catch (error) {
      console.error("Failed to derive address from the provided value. Please provide a valid Ethereum address.");
      process.exit(1);
    }
  }
  
  console.log(`Minting ${amount} DX tokens to ${recipient}...`);
  
  // Read contract address from file
  const contractAddresses = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../contract-addresses.json"), "utf8")
  );
  
  // Get the token contract address
  const tokenAddress = contractAddresses.DXToken;
  console.log(`DXToken contract address: ${tokenAddress}`);
  
  // Get the contract factory and attach to the deployed contract
  const DXToken = await ethers.getContractFactory("DXToken");
  const dxToken = DXToken.attach(tokenAddress);
  
  // Parse the amount
  const parsedAmount = ethers.parseEther(amount);
  console.log(`Amount in wei: ${parsedAmount}`);
  
  try {
    // Call the mint function directly
    const tx = await dxToken.mint(recipient, parsedAmount);
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log(`Successfully minted ${amount} DX tokens to ${recipient}`);
    
    // Check balance
    const balance = await dxToken.balanceOf(recipient);
    console.log(`New balance: ${ethers.formatEther(balance)} DX`);
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Minting failed:", error);
    process.exit(1);
  });
  