require('dotenv').config();

// Xử lý biến môi trường mặc định
const getEnv = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

const config = {
  // Server Config
  PORT: parseInt(getEnv('PORT', '3003')),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  API_PREFIX: getEnv('API_PREFIX', '/api'),
  
  // MongoDB Config
  MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://localhost:27017/deso_social'),
  MONGODB_URI_TEST: getEnv('MONGODB_URI_TEST', 'mongodb://localhost:27017/deso_social_test'),
  
  // JWT Auth Config
  JWT_SECRET: getEnv('JWT_SECRET',),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET',),
  JWT_EXPIRY: getEnv('JWT_EXPIRY', '2h'),
  JWT_REFRESH_EXPIRY: getEnv('JWT_REFRESH_EXPIRY', '7d'),
  
  // IPFS Config
  IPFS_HOST: getEnv('IPFS_HOST', 'ipfs.infura.io'),
  IPFS_PORT: parseInt(getEnv('IPFS_PORT', '5001')),
  IPFS_PROTOCOL: getEnv('IPFS_PROTOCOL', 'https'),
  IPFS_GATEWAY: getEnv('IPFS_GATEWAY', 'https://ipfs.io/ipfs/'),
  INFURA_IPFS_PROJECT_ID: getEnv('INFURA_IPFS_PROJECT_ID', ''),
  INFURA_IPFS_PROJECT_SECRET: getEnv('INFURA_IPFS_PROJECT_SECRET', ''),
  INFURA_IPFS_AUTH: process.env.INFURA_IPFS_PROJECT_ID ? 
    `Basic ${Buffer.from(`${process.env.INFURA_IPFS_PROJECT_ID}:${process.env.INFURA_IPFS_PROJECT_SECRET}`).toString('base64')}` : '',
  
  // Blockchain Config
  RPC_URL: getEnv('RPC_URL', 'https://sepolia-rollup.arbitrum.io/rpc'),
  CHAIN_ID: parseInt(getEnv('CHAIN_ID', '421614')), // Arbitrum Sepolia
  PRIVATE_KEY: getEnv('PRIVATE_KEY', ''),
  
  // Smart Contract Addresses
  CONTRACT_ADDRESSES: {
    DXToken: getEnv('DXTOKEN_ADDRESS', ''),
    NFTMedia: getEnv('NFTMEDIA_ADDRESS', ''),
    Marketplace: getEnv('MARKETPLACE_ADDRESS', ''),
    Subscription: getEnv('SUBSCRIPTION_ADDRESS', '')
  },
  
  // File Upload Config
  MAX_FILE_SIZE: parseInt(getEnv('MAX_FILE_SIZE', '10485760')), // 10MB
  UPLOAD_DIR: getEnv('UPLOAD_DIR', 'public/uploads'),
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'],
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(getEnv('RATE_LIMIT_MAX', '100'))
  },
  
  // CORS Options
  CORS_OPTIONS: {
    origin: getEnv('CORS_ORIGIN', '*').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_BLOCKCHAIN_EVENTS: getEnv('ENABLE_BLOCKCHAIN_EVENTS', 'false') === 'true',
    ENABLE_SCHEDULED_TASKS: getEnv('ENABLE_SCHEDULED_TASKS', 'false') === 'true',
    ENABLE_NOTIFICATIONS: getEnv('ENABLE_NOTIFICATIONS', 'true') === 'true',
    ENABLE_TRENDING: getEnv('ENABLE_TRENDING', 'true') === 'true'
  },
  
  // Scheduling Config
  CRON: {
    SYNC_NFT_EVENTS: getEnv('CRON_SYNC_NFT_EVENTS', '*/30 * * * *'), // Mỗi 30 phút
    SYNC_SUBSCRIPTION_DATA: getEnv('CRON_SYNC_SUBSCRIPTION_DATA', '0 * * * *'), // Mỗi giờ
    UPDATE_TRENDING: getEnv('CRON_UPDATE_TRENDING', '*/15 * * * *'), // Mỗi 15 phút
    RESET_DAILY_TASKS: getEnv('CRON_RESET_DAILY_TASKS', '0 0 * * *')  // Mỗi ngày lúc 00:00
  },
  
  // Security Config
  ENCRYPTION_KEY: getEnv('ENCRYPTION_KEY', ''),
  
  // Admin Config
  ADMIN_ADDRESSES: getEnv('ADMIN_ADDRESSES', '').split(','),
  
  // AWS S3 Config (nếu sử dụng)
  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY', ''),
  AWS_REGION: getEnv('AWS_REGION', 'us-east-1'),
  AWS_S3_BUCKET: getEnv('AWS_S3_BUCKET', '')
};

// Kiểm tra cấu hình
if (config.NODE_ENV === 'production') {
  // Validate các cấu hình quan trọng trong môi trường production
  const requiredEnvs = [
    'JWT_SECRET', 
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'RPC_URL',
    'DXTOKEN_ADDRESS',
    'NFTMEDIA_ADDRESS',
    'MARKETPLACE_ADDRESS',
    'SUBSCRIPTION_ADDRESS'
  ];
  
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    console.warn(`⚠️  Missing required environment variables in production: ${missingEnvs.join(', ')}`);
  }
}

// Load contract addresses từ file nếu không có trong env
try {
  if (!config.CONTRACT_ADDRESSES.DXToken) {
    const contractAddresses = require('../../contracts/contract-addresses.json');
    config.CONTRACT_ADDRESSES = contractAddresses;
    console.log('Loaded contract addresses from contract-addresses.json');
  }
} catch (error) {
  console.warn('Could not load contract addresses from file:', error.message);
}

module.exports = config;