// services/keyManager.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Khóa mã hóa từ biến môi trường
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters');
}

// Đường dẫn file lưu key đã mã hóa
const KEY_FILE_PATH = path.join(__dirname, '../secure/keys.enc');

/**
 * Mã hóa private key
 * @param {string} privateKey - Private key cần mã hóa
 * @returns {string} Private key đã mã hóa
 */
function encryptPrivateKey(privateKey) {
  // Tạo IV (Initialization Vector)
  const iv = crypto.randomBytes(16);
  
  // Tạo cipher
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), 
    iv
  );
  
  // Mã hóa private key
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Kết hợp IV và encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Giải mã private key
 * @param {string} encryptedKey - Private key đã mã hóa
 * @returns {string} Private key gốc
 */
function decryptPrivateKey(encryptedKey) {
  // Tách IV và encrypted data
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  // Tạo decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), 
    iv
  );
  
  // Giải mã private key
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Lưu private key đã mã hóa
 * @param {string} walletAddress - Địa chỉ ví
 * @param {string} privateKey - Private key
 */
function savePrivateKey(walletAddress, privateKey) {
  // Đảm bảo thư mục tồn tại
  const dir = path.dirname(KEY_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Đọc file hiện tại nếu có
  let keys = {};
  if (fs.existsSync(KEY_FILE_PATH)) {
    const content = fs.readFileSync(KEY_FILE_PATH, 'utf8');
    keys = JSON.parse(content);
  }
  
  // Mã hóa và lưu key
  keys[walletAddress.toLowerCase()] = encryptPrivateKey(privateKey);
  
  // Ghi file
  fs.writeFileSync(KEY_FILE_PATH, JSON.stringify(keys), 'utf8');
}

/**
 * Lấy private key
 * @param {string} walletAddress - Địa chỉ ví
 * @returns {string|null} Private key hoặc null nếu không tìm thấy
 */
function getPrivateKey(walletAddress) {
  // Kiểm tra file tồn tại
  if (!fs.existsSync(KEY_FILE_PATH)) {
    return null;
  }
  
  // Đọc file
  const content = fs.readFileSync(KEY_FILE_PATH, 'utf8');
  const keys = JSON.parse(content);
  
  // Lấy key
  const encryptedKey = keys[walletAddress.toLowerCase()];
  if (!encryptedKey) {
    return null;
  }
  
  // Giải mã và trả về
  return decryptPrivateKey(encryptedKey);
}

module.exports = {
  savePrivateKey,
  getPrivateKey
};