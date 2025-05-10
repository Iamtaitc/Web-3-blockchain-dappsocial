const IPFSService = require('../services/ipfs.services');

/**
 * Xử lý các file media được upload
 * @param {Array} files - Các file được upload qua multer
 * @returns {Promise<Array>} Mảng các đối tượng media đã upload
 */
const processMediaFiles = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    // Upload từng file lên IPFS và xây dựng object media
    const mediaPromises = files.map(async (file) => {
      // Xác định loại media
      const mediaType = file.mimetype.startsWith('image/') 
        ? 'image' 
        : file.mimetype.startsWith('video/')
          ? 'video'
          : 'audio';

      // Tạo tên file an toàn
      const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Upload lên IPFS
      const cid = await IPFSService.uploadFile(file.buffer, filename);
      
      // Trả về đối tượng media theo đúng schema
      return {
        uri: `ipfs://${cid}`,
        type: mediaType,       
        mimeType: file.mimetype, 
        size: file.size,
        filename: filename,
        width: file.width || null,
        height: file.height || null,
        duration: file.duration || null
      };
    });

    // Đợi tất cả promises hoàn thành
    return await Promise.all(mediaPromises);
  } catch (error) {
    console.error('Error processing media files:', error);
    throw new Error(`Failed to process media files: ${error.message}`);
  }
};

module.exports = {
  processMediaFiles
};