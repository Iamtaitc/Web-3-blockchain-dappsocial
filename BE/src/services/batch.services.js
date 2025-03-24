// services/batchService.js

const { ethers } = require("ethers");
const blockchainService = require("./blockchain.service");

/**
 * Thực hiện nhiều transactions trong một lần
 * @param {string} privateKey - Private key của sender
 * @param {Array} transactions - Mảng các transactions cần thực hiện
 * @returns {Promise<Array>} Kết quả các transactions
 */
async function batchTransactions(privateKey, transactions) {
  try {
    const provider = blockchainService.getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);

    // Lấy nonce hiện tại
    let nonce = await provider.getTransactionCount(wallet.address);

    // Lấy gas price
    const gasPrice = await provider.getGasPrice();
    const adjustedGasPrice = gasPrice.mul(110).div(100); // +10%

    // Mảng promises các transactions
    const txPromises = [];

    // Thực hiện từng transaction với nonce tăng dần
    for (const tx of transactions) {
      const { contract, method, params, gasLimitMultiplier = 1.2 } = tx;

      // Estimate gas
      const estimatedGas = await contract.estimateGas[method](...params);
      const safeGasLimit = estimatedGas
        .mul(Math.floor(gasLimitMultiplier * 100))
        .div(100);

      // Create transaction
      const transaction = await contract.populateTransaction[method](...params);

      // Add nonce, gasPrice, gasLimit
      transaction.nonce = nonce++;
      transaction.gasPrice = adjustedGasPrice;
      transaction.gasLimit = safeGasLimit;

      // Sign và gửi transaction
      const signedTx = await wallet.signTransaction(transaction);
      txPromises.push(provider.sendTransaction(signedTx));
    }

    // Đợi tất cả transactions hoàn thành
    const txResponses = await Promise.all(txPromises);

    // Đợi tất cả receipts
    const receipts = await Promise.all(
      txResponses.map((response) => response.wait())
    );

    return receipts;
  } catch (error) {
    console.error("Error in batch transactions:", error);
    throw error;
  }
}

module.exports = {
  batchTransactions,
};
