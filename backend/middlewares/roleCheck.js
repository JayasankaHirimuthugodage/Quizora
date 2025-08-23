import { USER_ROLES } from '../models/index.js';
import { errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';

/**
 * Create middleware to check if user has required role(s)
 * @param {...string} roles - Required roles
 * @returns {Function} Express middleware function
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_REQUIRED,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, errorResponse(
        MESSAGES.ACCESS_DENIED,
        HTTP_STATUS.FORBIDDEN
      ));
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Middleware to check if user is teacher or admin
 */
export const requireTeacherOrAdmin = requireRole(USER_ROLES.TEACHER, USER_ROLES.ADMIN);

/**
 * Middleware to check if user is student, teacher, or admin (any authenticated user)
 */
export const requireAnyRole = requireRole(USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN);

/**
 * Middleware to check if user can access resource (own resource or admin)
 * @param {string} paramName - Parameter name containing the user ID (default: 'id')
 * @returns {Function} Express middleware function
 */
export const requireOwnershipOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return sendResponse(res, errorResponse(
        MESSAGES.TOKEN_REQUIRED,
        HTTP_STATUS.UNAUTHORIZED
      ));
    }

    const resourceUserId = req.params[paramName];
    const currentUserId = req.user._id.toString();
    const isAdmin = req.user.role === USER_ROLES.ADMIN;

    // Allow if user is admin or accessing their own resource
    if (isAdmin || currentUserId === resourceUserId) {
      return next();
    }

    return sendResponse(res, errorResponse(
      MESSAGES.ACCESS_DENIED,
      HTTP_STATUS.FORBIDDEN
    ));
  };
};

/**
 * Middleware to check if user can manage other users (admin only)
 */
export const requireUserManagementPermission = (req, res, next) => {
  if (!req.user) {
    return sendResponse(res, errorResponse(
      MESSAGES.TOKEN_REQUIRED,
      HTTP_STATUS.UNAUTHORIZED
    ));
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return sendResponse(res, errorResponse(
      'Only administrators can manage users',
      HTTP_STATUS.FORBIDDEN
    ));
  }

  next();
};

/**
 * Middleware to prevent self-modification for critical operations
 */
export const preventSelfModification = (req, res, next) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    return sendResponse(res, errorResponse(
      'You cannot perform this action on your own account',
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  next();
};
