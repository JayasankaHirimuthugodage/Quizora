import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_REQUIRED,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_REQUIRED,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_INVALID,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return sendResponse(res, errorResponse(
        'Account is not active',
        HTTP_STATUS.FORBIDDEN
      ));
    }

    // Check if account is locked
    if (user.isLocked) {
      return sendResponse(res, errorResponse(
        MESSAGES.ACCOUNT_LOCKED,
        HTTP_STATUS.FORBIDDEN
      ));
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_INVALID,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    console.error('Authentication error:', error);
    return sendResponse(res, errorResponse(
      MESSAGES.SERVER_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    ));
  }
};

/**
 * Middleware to check if user is authenticated (optional)
 * Does not throw error if not authenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.status === 'active' && !user.isLocked) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
