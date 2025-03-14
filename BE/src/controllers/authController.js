const User = require("../models/User.mongoose");
const {
  generateNonce,
  getSignMessage,
  verifySignature,
  generateTokens,
  refreshToken,
} = require("../middleware/auth");

// Wallet Connect - Step 1: Get nonce
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Generate nonce
    const nonce = await generateNonce(walletAddress);

    // Generate message for signing
    const message = getSignMessage(walletAddress, nonce);

    res.status(200).json({
      message,
      nonce,
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Wallet Connect - Step 2: Verify signature
exports.verifyWalletSignature = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res
        .status(400)
        .json({ error: "Wallet address and signature are required" });
    }

    // Get user nonce
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user || !user.nonce || !user.nonceExpiry) {
      return res
        .status(400)
        .json({ error: "Invalid request, please get a new nonce" });
    }

    // Check if nonce is expired
    if (user.nonceExpiry < new Date()) {
      return res
        .status(400)
        .json({ error: "Nonce expired, please get a new nonce" });
    }

    // Regenerate the message that was signed
    const message = getSignMessage(walletAddress, user.nonce);

    // Verify signature
    const isValid = verifySignature(walletAddress, signature, message);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokens(walletAddress);

    // Clear nonce after successful verification
    user.nonce = null;
    user.nonceExpiry = null;
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        avatarURI: user.avatarURI,
      },
    });
  } catch (error) {
    console.error("Error verifying signature:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Refresh token
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshToken(token);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Remove refresh token from database
    await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Server error" });
  }
};
