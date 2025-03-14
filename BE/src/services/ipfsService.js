const { create } = require("ipfs-http-client");
const { Buffer } = require("buffer");
const config = require("../config");

// Auth cho Infura IPFS
const auth = Buffer.from(
  `${process.env.INFURA_IPFS_PROJECT_ID}:${process.env.INFURA_IPFS_PROJECT_SECRET}`
).toString("base64");

// Kết nối tới IPFS (Infura)
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${auth}`,
  },
});

// Upload file lên IPFS
const uploadFile = async (buffer, fileName = "file") => {
  try {
    const result = await ipfs.add({
      path: fileName,
      content: buffer,
    });

    console.log(`File uploaded to IPFS with CID: ${result.cid}`);
    return result.cid.toString();
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error("Failed to upload to IPFS");
  }
};

// Upload JSON lên IPFS
const uploadJSON = async (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const result = await ipfs.add(jsonString);

    console.log(`JSON uploaded to IPFS with CID: ${result.cid}`);
    return result.cid.toString();
  } catch (error) {
    console.error("IPFS JSON upload error:", error);
    throw new Error("Failed to upload JSON to IPFS");
  }
};

// Get content từ IPFS
const getFromIPFS = async (cid) => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("IPFS retrieval error:", error);
    throw new Error("Failed to retrieve from IPFS");
  }
};

// Tạo metadata cho NFT
const createNFTMetadata = (name, description, imageCID, attributes = []) => {
  return {
    name,
    description,
    image: `ipfs://${imageCID}`,
    attributes,
    created_at: new Date().toISOString(),
  };
};
// Tạo metadata cho bài đăng
const createPostMetadata = (
  content,
  mediaCIDs = [],
  tags = [],
  mentions = []
) => {
  return {
    content,
    media: mediaCIDs.map((cid) => `ipfs://${cid}`),
    tags,
    mentions,
    created_at: new Date().toISOString(),
    type: "post",
  };
};

// Tạo metadata cho comment
const createCommentMetadata = (content, mediaCIDs = [], mentions = []) => {
  return {
    content,
    media: mediaCIDs.map((cid) => `ipfs://${cid}`),
    mentions,
    created_at: new Date().toISOString(),
    type: "comment",
  };
};

// Tạo metadata cho user profile
const createProfileMetadata = (username, bio, avatarCID, coverCID) => {
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
};

// Phân tích IPFS URI
const parseIPFSUri = (uri) => {
  if (!uri) return null;

  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "");
  }

  return uri;
};

// Chuyển đổi CID thành gateway URL
const formatIPFSUrl = (cid) => {
  if (!cid) return null;

  const formattedCid = parseIPFSUri(cid);
  return `https://ipfs.io/ipfs/${formattedCid}`;
};

module.exports = {
  uploadFile,
  uploadJSON,
  getFromIPFS,
  createNFTMetadata,
  createPostMetadata,
  createCommentMetadata,
  createProfileMetadata,
  parseIPFSUri,
  formatIPFSUrl,
};
