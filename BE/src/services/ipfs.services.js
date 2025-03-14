const axios = require('axios');
const FormData = require('form-data');
const { Buffer } = require('buffer');
const config = require('../configs/config.env');

// Base URL for Infura IPFS API
const INFURA_IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';

// Auth credentials
const getAuthHeader = () => {
  const auth = Buffer.from(
    `${process.env.INFURA_IPFS_PROJECT_ID}:${process.env.INFURA_IPFS_PROJECT_SECRET}`
  ).toString('base64');
  return `Basic ${auth}`;
};

// Upload file to IPFS
const uploadFile = async (buffer, fileName = 'file') => {
  try {
    const formData = new FormData();
    formData.append('file', buffer, { filename: fileName });

    const response = await axios.post(`${INFURA_IPFS_ENDPOINT}/add`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': getAuthHeader(),
      },
    });

    const cid = response.data.Hash;
    console.log(`File uploaded to IPFS with CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error('IPFS upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload to IPFS');
  }
};

// Upload JSON to IPFS
const uploadJSON = async (data) => {
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(data));
    const formData = new FormData();
    formData.append('file', jsonBuffer);

    const response = await axios.post(`${INFURA_IPFS_ENDPOINT}/add`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': getAuthHeader(),
      },
    });

    const cid = response.data.Hash;
    console.log(`JSON uploaded to IPFS with CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error('IPFS JSON upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload JSON to IPFS');
  }
};

// Get content from IPFS
const getFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`${INFURA_IPFS_ENDPOINT}/cat?arg=${cid}`, {
      headers: {
        'Authorization': getAuthHeader(),
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('IPFS retrieval error:', error.response?.data || error.message);
    throw new Error('Failed to retrieve from IPFS');
  }
};

const createNFTMetadata = (name, description, imageCID, attributes = []) => {
  return {
    name,
    description,
    image: `ipfs://${imageCID}`,
    attributes,
    created_at: new Date().toISOString(),
  };
};

const createPostMetadata = (content, mediaCIDs = [], tags = [], mentions = []) => {
  return {
    content,
    media: mediaCIDs.map((cid) => `ipfs://${cid}`),
    tags,
    mentions,
    created_at: new Date().toISOString(),
    type: 'post',
  };
};

const createCommentMetadata = (content, mediaCIDs = [], mentions = []) => {
  return {
    content,
    media: mediaCIDs.map((cid) => `ipfs://${cid}`),
    mentions,
    created_at: new Date().toISOString(),
    type: 'comment',
  };
};

const createProfileMetadata = (username, bio, avatarCID, coverCID) => {
  const metadata = {
    username,
    bio,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'profile',
  };

  if (avatarCID) {
    metadata.avatar = `ipfs://${avatarCID}`;
  }

  if (coverCID) {
    metadata.cover = `ipfs://${coverCID}`;
  }

  return metadata;
};

const parseIPFSUri = (uri) => {
  if (!uri) return null;

  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', '');
  }

  return uri;
};

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