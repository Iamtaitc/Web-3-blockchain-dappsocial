/**
 * Lớp tiện ích xử lý các vấn đề liên quan đến địa chỉ Ethereum
 */
class AddressUtils {
  /**
   * Kiểm tra xem một chuỗi có phải là địa chỉ Ethereum hợp lệ không
   * @param {String} address - Địa chỉ cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  static isValidEthereumAddress(address) {
    if (!address) return false;
    
    // Kiểm tra định dạng của địa chỉ Ethereum
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
  }

  /**
   * Chuẩn hóa địa chỉ Ethereum (chuyển về chữ thường)
   * @param {String} address - Địa chỉ cần chuẩn hóa
   * @returns {String} Địa chỉ đã chuẩn hóa
   */
  static normalizeAddress(address) {
    if (!address) return '';
    
    // Chuyển đổi địa chỉ về chữ thường
    const normalizedAddress = address.toLowerCase();
    
    // Đảm bảo có tiền tố 0x
    return normalizedAddress.startsWith('0x') ? normalizedAddress : `0x${normalizedAddress}`;
  }

  /**
   * Rút gọn địa chỉ để hiển thị (e.g., 0x1234...5678)
   * @param {String} address - Địa chỉ cần rút gọn
   * @param {Number} startChars - Số ký tự giữ lại ở đầu
   * @param {Number} endChars - Số ký tự giữ lại ở cuối
   * @returns {String} Địa chỉ đã rút gọn
   */
  static shortenAddress(address, startChars = 6, endChars = 4) {
    if (!address) return '';
    
    const normalizedAddress = this.normalizeAddress(address);
    
    if (normalizedAddress.length <= startChars + endChars) {
      return normalizedAddress;
    }
    
    return `${normalizedAddress.substring(0, startChars)}...${normalizedAddress.substring(normalizedAddress.length - endChars)}`;
  }

  /**
   * So sánh hai địa chỉ Ethereum
   * @param {String} address1 - Địa chỉ thứ nhất
   * @param {String} address2 - Địa chỉ thứ hai
   * @returns {Boolean} Kết quả so sánh
   */
  static compareAddresses(address1, address2) {
    if (!address1 || !address2) return false;
    
    const normalizedAddress1 = this.normalizeAddress(address1);
    const normalizedAddress2 = this.normalizeAddress(address2);
    
    return normalizedAddress1 === normalizedAddress2;
  }
}

module.exports = AddressUtils;