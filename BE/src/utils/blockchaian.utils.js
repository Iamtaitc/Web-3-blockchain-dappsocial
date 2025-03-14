const ethers = require('ethers');
const { getContracts } = require('../services/blockchain.services');

/**
 * Chuyển đổi số lượng token từ wei sang ether
 * @param {string|number|BigNumber} amount - Số lượng token ở dạng wei
 * @returns {string} Số lượng token ở dạng ether
 */
const formatTokenAmount = (amount) => {
  try {
    return ethers.utils.formatEther(amount);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Chuyển đổi số lượng token từ ether sang wei
 * @param {string|number} amount - Số lượng token ở dạng ether
 * @returns {BigNumber} Số lượng token ở dạng wei
 */
const parseTokenAmount = (amount) => {
  try {
    return ethers.utils.parseEther(amount.toString());
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return ethers.BigNumber.from(0);
  }
};

/**
 * Kiểm tra balance của DX token
 * @param {string} address - Địa chỉ ví cần kiểm tra
 * @returns {Promise<string>} Số lượng token (dạng ether)
 */
const checkDXBalance = async (address) => {
  try {
    const { dxToken } = getContracts();
    const balance = await dxToken.balanceOf(address);
    return formatTokenAmount(balance);
  } catch (error) {
    console.error('Error checking DX balance:', error);
    return '0';
  }
};

module.exports = {
  formatTokenAmount,
  parseTokenAmount,
  checkDXBalance
};