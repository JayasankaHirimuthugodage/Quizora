import mongoose from 'mongoose';
import { errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return sendResponse(res, errorResponse(
      'Validation failed',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errors
    ));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return sendResponse(res, errorResponse(
      `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
      HTTP_STATUS.CONFLICT,
      [{
        field,
        message: `${field} must be unique`,
        value
      }]
    ));
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendResponse(res, errorResponse(
      'Invalid ID format',
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendResponse(res, errorResponse(
      MESSAGES.TOKEN_INVALID,
      HTTP_STATUS.UNAUTHORIZED
    ));
  }

  if (err.name === 'TokenExpiredError') {
    return sendResponse(res, errorResponse(
      MESSAGES.TOKEN_EXPIRED,
      HTTP_STATUS.UNAUTHORIZED
    ));
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendResponse(res, errorResponse(
      'File size too large',
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendResponse(res, errorResponse(
      'Unexpected file field',
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  // Custom application errors
  if (err.statusCode) {
    return sendResponse(res, errorResponse(
      err.message,
      err.statusCode
    ));
  }

  // Default server error
  return sendResponse(res, errorResponse(
    process.env.NODE_ENV === 'production' 
      ? MESSAGES.SERVER_ERROR 
      : err.message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  ));
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req, res) => {
  sendResponse(res, errorResponse(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  ));
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create and throw an AppError
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @throws {AppError} Application error
 */
export const throwError = (message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  throw new AppError(message, statusCode);
};
