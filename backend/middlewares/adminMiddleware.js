import { USER_ROLES } from '../models/index.js';
import { errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Middleware to check if user has admin role
 */
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    const response = errorResponse('Access denied. Authentication required.', HTTP_STATUS.UNAUTHORIZED);
    return sendResponse(res, response);
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    const response = errorResponse('Access denied. Admin privileges required.', HTTP_STATUS.FORBIDDEN);
    return sendResponse(res, response);
  }

  next();
};
