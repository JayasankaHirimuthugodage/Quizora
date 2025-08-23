import { HTTP_STATUS } from './constants.js';

/**
 * Format success response with consistent structure
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted response object
 */
export const successResponse = (data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => ({
  success: true,
  message,
  data,
  statusCode,
  timestamp: new Date().toISOString()
});

/**
 * Format error response with consistent structure
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array} errors - Detailed error array
 * @param {Object} meta - Additional metadata
 * @returns {Object} Formatted error response object
 */
export const errorResponse = (message = 'Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = [], meta = {}) => ({
  success: false,
  message,
  errors,
  statusCode,
  timestamp: new Date().toISOString(),
  ...meta
});

/**
 * Format validation error response
 * @param {Array} validationErrors - Array of validation errors
 * @returns {Object} Formatted validation error response
 */
export const validationErrorResponse = (validationErrors = []) => {
  const errors = validationErrors.map(error => ({
    field: error.param || error.path,
    message: error.msg || error.message,
    value: error.value
  }));

  return errorResponse(
    'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  );
};

/**
 * Format paginated response
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return successResponse({
    items: data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  }, message);
};

/**
 * Send response with proper HTTP status code
 * @param {Object} res - Express response object
 * @param {Object} responseData - Response data object
 */
export const sendResponse = (res, responseData) => {
  return res.status(responseData.statusCode).json(responseData);
};
