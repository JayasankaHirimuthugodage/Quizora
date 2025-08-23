import crypto from 'crypto';

/**
 * Generate a random token
 * @param {number} length - Token length (default: 32)
 * @returns {string} Random hex token
 */
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Random password
 */
export const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * Safely compare two strings to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
export const safeCompare = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Sanitize user input by removing potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Format user name for display
 * @param {string} name - User name
 * @returns {string} Formatted name
 */
export const formatUserName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if email domain is allowed
 * @param {string} email - Email address
 * @param {Array} allowedDomains - Array of allowed domains
 * @returns {boolean} True if domain is allowed
 */
export const isEmailDomainAllowed = (email, allowedDomains = []) => {
  if (allowedDomains.length === 0) return true; // No restrictions
  
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(domain);
};

/**
 * Create a delay function for rate limiting
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Remove sensitive data from user object
 * @param {Object} user - User object
 * @returns {Object} User object without sensitive data
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  
  // Remove sensitive fields
  const { 
    password, 
    passwordResetToken, 
    passwordResetExpires,
    loginAttempts,
    lockUntil,
    __v,
    ...sanitizedUser 
  } = userObj;
  
  return sanitizedUser;
};

/**
 * Check if a date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is expired
 */
export const isExpired = (date) => {
  if (!date) return true;
  return new Date() > new Date(date);
};

/**
 * Get time until expiration in human readable format
 * @param {Date} expirationDate - Expiration date
 * @returns {string} Human readable time until expiration
 */
export const getTimeUntilExpiration = (expirationDate) => {
  const now = new Date();
  const expiry = new Date(expirationDate);
  const diff = expiry - now;
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};
