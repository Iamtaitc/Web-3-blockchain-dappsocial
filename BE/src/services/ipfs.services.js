const axios = require("axios");
const FormData = require("form-data");
const { Buffer } = require("buffer");

/**
 * Service xử lý các tác vụ IPFS
 */
class IPFSService {
  constructor() {
    // Cấu hình gateway và endpoints IPFS
    this.ipfsGateway = process.env.IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/";
    // Sử dụng local IPFS node thay vì Infura
    this.ipfsEndpoint = "http://127.0.0.1:5001/api/v0";
  }

  /**
   * Upload file lên IPFS
   * @param {Buffer} buffer - Buffer dữ liệu
   * @param {String} fileName - Tên file
   * @returns {Promise<String>} CID của file sau khi upload
   */
  async uploadFile(buffer, fileName = "file") {
    try {
      const formData = new FormData();
      formData.append("file", buffer, { filename: fileName });
      
      const response = await axios.post(
        `${this.ipfsEndpoint}/add`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      const cid = response.data.Hash;
      console.log(`File uploaded to IPFS with CID: ${cid}`);
      return cid;
    } catch (error) {
      console.error(
        "IPFS upload error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to upload to IPFS");
    }
  }

  /**
   * Upload JSON lên IPFS
   * @param {Object} data - Dữ liệu JSON
   * @returns {Promise<String>} CID của JSON sau khi upload
   */
  async uploadJSON(data) {
    try {
      const jsonBuffer = Buffer.from(JSON.stringify(data));
  
      const formData = new FormData();
      formData.append("file", jsonBuffer, {
        filepath: "data.json", // dùng filepath thay vì filename
      });
  
      const response = await axios.post(
        `${this.ipfsEndpoint}/add`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );
  
      const cid = response.data.Hash;
      console.log(`JSON uploaded to IPFS with CID: ${cid}`);
      return cid;
    } catch (error) {
      console.error(
        "IPFS JSON upload error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to upload JSON to IPFS");
    }
  }

  /**
   * Lấy nội dung từ IPFS
   * @param {String} cid - CID của nội dung cần lấy
   * @returns {Promise<Buffer>} Buffer dữ liệu
   */
  async getFromIPFS(cid) {
    try {
      const response = await axios.get(
        `${this.ipfsEndpoint}/cat?arg=${cid}`,
        {
          responseType: "arraybuffer",
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error(
        "IPFS retrieval error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to retrieve from IPFS");
    }
  }

  /**
   * Tạo metadata cho NFT
   * @param {String} name - Tên NFT
   * @param {String} description - Mô tả NFT
   * @param {String} imageCID - CID của hình ảnh
   * @param {Array} attributes - Thuộc tính của NFT
   * @returns {Object} Metadata của NFT
   */
  createNFTMetadata(name, description, imageCID, attributes = []) {
    return {
      name,
      description,
      image: `ipfs://${imageCID}`,
      attributes,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Tạo metadata cho post
   * @param {String} content - Nội dung post
   * @param {Array} mediaCIDs - CIDs của media
   * @param {Array} tags - Tags của post
   * @param {Array} mentions - Mentions trong post
   * @returns {Object} Metadata của post
   */
  createPostMetadata(content, mediaCIDs = [], tags = [], mentions = []) {
    return {
      content,
      media: mediaCIDs.map((cid) => `ipfs://${cid}`),
      tags,
      mentions,
      created_at: new Date().toISOString(),
      type: "post",
    };
  }

  /**
   * Tạo metadata cho comment
   * @param {String} content - Nội dung comment
   * @param {Array} mediaCIDs - CIDs của media
   * @param {Array} mentions - Mentions trong comment
   * @returns {Object} Metadata của comment
   */
  createCommentMetadata(content, mediaCIDs = [], mentions = []) {
    return {
      content,
      media: mediaCIDs.map((cid) => `ipfs://${cid}`),
      mentions,
      created_at: new Date().toISOString(),
      type: "comment",
    };
  }

  /**
   * Tạo metadata cho profile
   * @param {String} username - Username
   * @param {String} bio - Bio
   * @param {String} avatarCID - CID của avatar
   * @param {String} coverCID - CID của cover
   * @returns {Object} Metadata của profile
   */
  createProfileMetadata(username, bio, avatarCID, coverCID) {
    const metadata = {
      username,
      bio,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: "profile",
    };

    if (avatarCID) {
      metadata.avatar = `ipfs://${avatarCID}`;
    }

    if (coverCID) {
      metadata.cover = `ipfs://${coverCID}`;
    }

    return metadata;
  }

  /**
   * Parse IPFS URI để lấy CID
   * @param {String} uri - IPFS URI
   * @returns {String} CID
   */
  parseIPFSUri(uri) {
    if (!uri) return null;

    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "");
    }

    return uri;
  }

  /**
   * Định dạng URL IPFS từ CID
   * @param {String} cid - CID hoặc URI
   * @returns {String} URL đầy đủ
   */
  formatIPFSUrl(cid) {
    if (!cid) return null;

    // Nếu cid đã là URL đầy đủ, trả về nguyên bản
    if (cid.startsWith("http://") || cid.startsWith("https://")) {
      return cid;
    }

    const formattedCid = this.parseIPFSUri(cid);
    return `${this.ipfsGateway}${formattedCid}`;
  }

  /**
   * Chuẩn hóa IPFS URI
   * @param {String} input - IPFS hash hoặc URL
   * @returns {String} URI chuẩn hóa (ipfs://...)
   */
  normalizeIPFSUri(input) {
    if (!input) return null;

    // Đã là URI chuẩn
    if (input.startsWith("ipfs://")) {
      return input;
    }

    // Trích xuất hash từ URL
    const hash = this.parseIPFSUri(input);

    // Thêm tiền tố 'ipfs://'
    return `ipfs://${hash}`;
  }
}

module.exports = new IPFSService();