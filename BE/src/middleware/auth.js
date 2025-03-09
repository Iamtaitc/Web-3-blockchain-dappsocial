const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const User = require('../models/User');
const crypto = require('crypto');
const config = require('../config');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate authentication nonce
const generateNonce = async (address) => {
  try {
    // Random nonce
    const nonce = crypto.randomBytes(16).toString('hex');
    const nonceExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Save or update nonce
    await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { 
        $set: { 
          nonce,
          nonceExpiry
        }
      },
      { upsert: true }
    );
    
    return nonce;
  } catch (error) {
    console.error('Nonce generation error:', error);
    throw error;
  }
};

// Generate message for signing
const getSignMessage = (address, nonce) => {
  return `Welcome to DeSo Social!\n\nPlease sign this message to authenticate with your wallet.\n\nThis signature will not trigger a blockchain transaction or cost any gas fees.\n\nWallet Address: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
};

// Verify Ethereum signature
const verifySignature = (address, signature, message) => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Generate JWT tokens
const generateTokens = async (address) => {
  try {
    // Fetch or create user
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    
    if (!user) {
      user = await User.create({
        walletAddress: address.toLowerCase(),
        username: `user_${address.substring(2, 8).toLowerCase()}`,
        createdAt: new Date()
      });
    }
    
    // Generate access token
    const accessToken = jwt.sign(
      { 
        address: address.toLowerCase(),
        userId: user._id 
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY || '2h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        address: address.toLowerCase(),
        userId: user._id 
      },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRY || '7d' }
    );
    
    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
};

// Refresh token
const refreshToken = async (token) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    
    // Find user with this refresh token
    const user = await User.findOne({
      walletAddress: decoded.address.toLowerCase(),
      refreshToken: token
    });
    
    if (!user) {
      throw new Error('Invalid refresh token');
    }
    
    // Generate new tokens
    return await generateTokens(decoded.address);
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

module.exports = {
  verifyToken,
  generateNonce,
  getSignMessage,
  verifySignature,
  generateTokens,
  refreshToken
};