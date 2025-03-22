// services/secureBlockchainService.js

const { ethers } = require('ethers');
const keyManager = require('./keyManager.services');
const blockchainService = require('./blockchain.service');
const { retryOperation, shouldRetryTransaction } = require('../utils/retry.utils');

/**
 * Thực hiện transaction an toàn với private key được mã hóa
 * @param {string} walletAddress - Địa chỉ ví
 * @param {string} contractName - Tên contract ('dxToken', 'nftMedia',...)
 * @param {string} method - Tên method
 * @param {Array} params - Tham số cho method
 */
async function secureContractTransaction(walletAddress, contractName, method, params) {
  // Lấy private key đã mã hóa
  const privateKey = keyManager.getPrivateKey(walletAddress);
  if (!privateKey) {
    throw new Error('Private key not found for address: ' + walletAddress);
  }
  
  // Lấy contract instance
  const { dxToken, nftMedia, marketplace, subscription } = 
    blockchainService.getSignedContracts(privateKey);
  
  let contract;
  switch (contractName) {
    case 'dxToken':
      contract = dxToken;
      break;
    case 'nftMedia':
      contract = nftMedia;
      break;
    case 'marketplace':
      contract = marketplace;
      break;
    case 'subscription':
      contract = subscription;
      break;
    default:
      throw new Error('Invalid contract name: ' + contractName);
  }
  
  // Thực hiện transaction với retry
  return await retryOperation(
    async () => {
      // Estimate gas
      const estimatedGas = await contract.estimateGas[method](...params);
      const safeGasLimit = estimatedGas.mul(120).div(100);
      
      // Execute transaction
      const tx = await contract[method](...params, { gasLimit: safeGasLimit });
      const receipt = await tx.wait();
      
      return receipt;
    },
    3, // maxRetries
    1000, // delay
    shouldRetryTransaction
  );
}

module.exports = {
  secureContractTransaction
};