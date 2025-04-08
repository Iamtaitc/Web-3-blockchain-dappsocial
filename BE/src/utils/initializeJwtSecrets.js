const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

/**
 * Quản lý JWT secrets, tạo mới nếu chưa tồn tại hoặc hết hạn
 * @returns {Object} JWT secrets
 */
function initializeJwtSecrets() {
  // Load environment variables from .env file
  dotenv.config();
  
  const envFilePath = path.resolve(process.cwd(), '.env');
  const secretsFilePath = path.resolve(process.cwd(), '.jwt-secrets.json');
  
  let jwtSecrets = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    expiresAt: null
  };

  // Check if secrets file exists
  if (fs.existsSync(secretsFilePath)) {
    try {
      const storedSecrets = JSON.parse(fs.readFileSync(secretsFilePath, 'utf8'));
      
      // Check if secrets are still valid
      if (storedSecrets.expiresAt && new Date(storedSecrets.expiresAt) > new Date()) {
        console.log('JWT secrets are still valid, using existing secrets');
        jwtSecrets = storedSecrets;
        
        // Update process.env with the existing secrets
        process.env.JWT_SECRET = jwtSecrets.JWT_SECRET;
        process.env.JWT_REFRESH_SECRET = jwtSecrets.JWT_REFRESH_SECRET;
        
        return jwtSecrets;
      } else {
        console.log('JWT secrets have expired, generating new ones');
      }
    } catch (error) {
      console.error('Error reading JWT secrets file:', error);
    }
  }

  // Generate new secrets if they don't exist or have expired
  if (!jwtSecrets.JWT_SECRET) {
    jwtSecrets.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  }
  
  if (!jwtSecrets.JWT_REFRESH_SECRET) {
    jwtSecrets.JWT_REFRESH_SECRET = crypto.randomBytes(64).toString('hex');
  }
  
  // Calculate expiration date (7 days by default or from env)
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const daysMatch = refreshExpiresIn.match(/(\d+)d/);
  
  let expirationDays = 7;
  if (daysMatch && daysMatch[1]) {
    expirationDays = parseInt(daysMatch[1], 10);
  }
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);
  jwtSecrets.expiresAt = expiresAt.toISOString();
  
  // Save secrets to file
  fs.writeFileSync(secretsFilePath, JSON.stringify(jwtSecrets, null, 2));
  
  // Update process.env and .env file with new secrets
  process.env.JWT_SECRET = jwtSecrets.JWT_SECRET;
  process.env.JWT_REFRESH_SECRET = jwtSecrets.JWT_REFRESH_SECRET;
  
  // Update .env file if it exists
  if (fs.existsSync(envFilePath)) {
    try {
      let envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Replace or add JWT_SECRET
      if (envContent.includes('JWT_SECRET=')) {
        envContent = envContent.replace(
          /JWT_SECRET=.*/,
          `JWT_SECRET=${jwtSecrets.JWT_SECRET}`
        );
      } else {
        envContent += `\nJWT_SECRET=${jwtSecrets.JWT_SECRET}`;
      }
      
      // Replace or add JWT_REFRESH_SECRET
      if (envContent.includes('JWT_REFRESH_SECRET=')) {
        envContent = envContent.replace(
          /JWT_REFRESH_SECRET=.*/,
          `JWT_REFRESH_SECRET=${jwtSecrets.JWT_REFRESH_SECRET}`
        );
      } else {
        envContent += `\nJWT_REFRESH_SECRET=${jwtSecrets.JWT_REFRESH_SECRET}`;
      }
      
      fs.writeFileSync(envFilePath, envContent);
      console.log('JWT secrets generated and saved to .env file');
    } catch (error) {
      console.error('Error updating .env file:', error);
    }
  }
  
  console.log('JWT secrets initialized successfully');
  return jwtSecrets;
}

module.exports = initializeJwtSecrets;