const crypto = require('crypto');

/**
 * Generate a secure random token (for email verification / password reset)
 * @param {number} bytes - number of random bytes (default 32)
 * @returns {string} hex token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a numeric OTP
 * @param {number} digits - number of digits (default 6)
 * @returns {string} OTP string
 */
const generateOTP = (digits = 6) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  return crypto.randomInt(min, max).toString();
};

/**
 * Hash a token for safe DB storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateSecureToken, generateOTP, hashToken };