const ethers = require('ethers');

/**
 * Kiểm tra địa chỉ Ethereum có hợp lệ không
 * @param {string} address - Địa chỉ Ethereum cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
const isValidEthereumAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * Chuẩn hóa địa chỉ Ethereum (lowercase)
 * @param {string} address - Địa chỉ Ethereum
 * @returns {string} Địa chỉ chuẩn hóa
 */
const normalizeAddress = (address) => {
  if (!address) return null;
  return address.toLowerCase();
};

/**
 * Rút gọn địa chỉ Ethereum để hiển thị
 * @param {string} address - Địa chỉ Ethereum
 * @param {number} prefixLength - Số ký tự ở đầu (mặc định: 6)
 * @param {number} suffixLength - Số ký tự ở cuối (mặc định: 4)
 * @returns {string} Địa chỉ đã rút gọn
 */
const shortenAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!address) return '';
  if (address.length < prefixLength + suffixLength) return address;
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
};

module.exports = {
  isValidEthereumAddress,
  normalizeAddress,
  shortenAddress
};