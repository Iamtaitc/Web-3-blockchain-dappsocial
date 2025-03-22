// services/cacheService.js

const NodeCache = require('node-cache');
const blockchainCache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // TTL: 60 giây

/**
 * Lấy dữ liệu từ cache hoặc blockchain
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Hàm lấy dữ liệu từ blockchain
 * @param {number} ttl - Thời gian cache (giây)
 */
async function getOrFetchData(key, fetchFunction, ttl = 60) {
  // Kiểm tra dữ liệu có trong cache không
  const cachedData = blockchainCache.get(key);
  if (cachedData !== undefined) {
    return cachedData;
  }
  
  // Nếu không có trong cache, lấy từ blockchain
  const data = await fetchFunction();
  
  // Lưu vào cache
  blockchainCache.set(key, data, ttl);
  
  return data;
}

// Xóa cache theo key
function invalidateCache(key) {
  blockchainCache.del(key);
}

// Xóa tất cả cache
function invalidateAllCache() {
  blockchainCache.flushAll();
}

module.exports = {
  getOrFetchData,
  invalidateCache,
  invalidateAllCache
};