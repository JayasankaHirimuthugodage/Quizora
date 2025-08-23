/**
 * Standardized response helper functions
 */

/**
 * Success response format
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

/**
 * Error response format
 */
export const errorResponse = (message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Send response to client
 */
export const sendResponse = (res, response) => {
  return res.status(response.statusCode).json(response);
};
