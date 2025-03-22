// utils/retryUtils.js

/**
 * Thực hiện một function với retry nếu có lỗi
 * @param {Function} fn - Function cần thực hiện
 * @param {number} maxRetries - Số lần retry tối đa
 * @param {number} delay - Thời gian delay giữa các lần retry (ms)
 * @param {Function} shouldRetry - Function kiểm tra có nên retry không
 */
async function retryOperation(fn, maxRetries = 3, delay = 1000, shouldRetry = null) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Thực hiện function
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Kiểm tra có nên retry không
        if (shouldRetry && !shouldRetry(error)) {
          throw error;
        }
        
        // Nếu đã hết số lần retry, throw error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Log error và retry
        console.warn(`Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}. Retrying in ${delay}ms...`);
        
        // Delay trước khi retry
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Tăng delay cho lần sau (exponential backoff)
        delay *= 2;
      }
    }
    
    throw lastError;
  }
  
  /**
   * Kiểm tra có nên retry transaction không
   * @param {Error} error - Error từ transaction
   * @returns {boolean} Kết quả
   */
  function shouldRetryTransaction(error) {
    // Retry nếu lỗi liên quan đến network
    if (error.code === 'NETWORK_ERROR' || 
        error.code === 'TIMEOUT' || 
        error.code === 'SERVER_ERROR' ||
        error.message.includes('replacement fee too low') ||
        error.message.includes('nonce has already been used')) {
      return true;
    }
    
    // Không retry nếu lỗi liên quan đến user
    if (error.code === 'INSUFFICIENT_FUNDS' || 
        error.code === 'CALL_EXCEPTION' ||
        error.message.includes('user rejected')) {
      return false;
    }
    
    // Mặc định retry
    return true;
  }
  
  module.exports = {
    retryOperation,
    shouldRetryTransaction
  };