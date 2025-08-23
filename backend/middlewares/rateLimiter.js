import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, RATE_LIMITS } from '../utils/constants.js';

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options) => {
  return rateLimit({
    ...options,
    handler: (req, res) => {
      const response = errorResponse(
        options.message || 'Too many requests',
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
      res.status(response.statusCode).json(response);
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// Login rate limiter
export const loginRateLimit = createRateLimiter(RATE_LIMITS.LOGIN);

// Password reset rate limiter
export const passwordResetRateLimit = createRateLimiter(RATE_LIMITS.PASSWORD_RESET);

// General API rate limiter
export const generalRateLimit = createRateLimiter(RATE_LIMITS.GENERAL);

// Strict rate limiter for sensitive operations
export const strictRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many requests for this sensitive operation, please try again later'
});

/**
 * Custom rate limiter that tracks by user ID instead of IP
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
export const createUserRateLimiter = (options) => {
  const store = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next(); // Skip if user not authenticated
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean old entries
    if (store.has(userId)) {
      const userRequests = store.get(userId).filter(time => time > windowStart);
      store.set(userId, userRequests);
    }

    const userRequests = store.get(userId) || [];
    
    if (userRequests.length >= options.max) {
      // Calculate time until next request is allowed
      const oldestRequest = Math.min(...userRequests);
      const timeUntilReset = Math.ceil((oldestRequest + options.windowMs - now) / 1000);
      
      // Format time remaining message
      const formatTime = (seconds) => {
        if (seconds < 60) {
          return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (remainingSeconds === 0) {
          return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
      };

      const message = options.messageWithTime 
        ? options.messageWithTime.replace('{time}', formatTime(timeUntilReset))
        : `${options.message || 'Too many requests'}. Please wait ${formatTime(timeUntilReset)} before trying again.`;

      const response = errorResponse(
        message,
        HTTP_STATUS.TOO_MANY_REQUESTS,
        null,
        { retryAfter: timeUntilReset }
      );
      return res.status(response.statusCode).json(response);
    }

    userRequests.push(now);
    store.set(userId, userRequests);
    
    next();
  };
};

// User-based rate limiters
export const userLoginRateLimit = createUserRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per user per 15 minutes
  message: 'Too many login attempts for this account'
});

export const userPasswordChangeRateLimit = createUserRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password changes per user per hour
  message: 'Too many password change attempts'
});

// OTP request rate limiter (3 OTP requests per 5 minutes)
export const otpRequestRateLimit = createUserRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  message: 'Too many OTP requests',
  messageWithTime: 'You can request another OTP in {time}'
});

// OTP verification rate limiter (10 attempts per 15 minutes - more generous)
export const otpVerificationRateLimit = createUserRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 OTP verification attempts per 15 minutes
  message: 'Too many OTP verification attempts',
  messageWithTime: 'Too many failed attempts. Please wait {time} before trying again'
});
