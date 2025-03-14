require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Lấy biến môi trường
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://arbitrum-sepolia.drpc.org";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;

// Kiểm tra private key
if (!PRIVATE_KEY) {
  console.warn("⚠️  No PRIVATE_KEY found in .env file, deployment will not work!");
}
task("balance", "Kiểm tra số dư của một tài khoản")
  .addParam("account", "Địa chỉ ví Ethereum")
  .setAction(async (taskArgs, hre) => {
    const provider = hre.ethers.provider;
    const balance = await provider.getBalance(taskArgs.account);
    console.log(`Balance của ${taskArgs.account}: ${hre.ethers.formatEther(balance)} ETH`);
  });
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Mạng local
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Arbitrum Sepolia testnet
    arbitrum_sepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 421614,
    }
  },
  etherscan: {
    apiKey: {
      // Arbitrum Sepolia
      arbitrumSepolia: ARBISCAN_API_KEY,
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  }
};
