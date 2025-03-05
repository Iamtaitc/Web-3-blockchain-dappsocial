require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); 
module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon_testnet: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY] 
    },
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
