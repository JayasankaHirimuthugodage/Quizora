import { validationResult } from 'express-validator';
import { validationErrorResponse, sendResponse } from '../utils/responseFormatter.js';

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    console.log('Validation Errors:', {
      path: req.path,
      method: req.method,
      errors: validationErrors,
      body: req.body
    });
    return sendResponse(res, validationErrorResponse(validationErrors));
  }
  
  next();
};

/**
 * Custom validation middleware for specific business rules
 */
export const customValidations = {
  /**
   * Validate that email is not already taken (for user creation/update)
   */
  validateUniqueEmail: async (req, res, next) => {
    try {
      const { User } = await import('../models/index.js');
      const { email } = req.body;
      const userId = req.params.id;

      if (!email) {
        return next(); // Skip if no email provided
      }

      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        ...(userId && { _id: { $ne: userId } }) // Exclude current user when updating
      });

      if (existingUser) {
        return sendResponse(res, validationErrorResponse([{
          param: 'email',
          msg: 'Email already exists',
          value: email
        }]));
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Validate password strength for password changes
   */
  validatePasswordStrength: (req, res, next) => {
    // Check for either 'password' or 'newPassword' field
    const password = req.body.password || req.body.newPassword;

    if (!password) {
      return next(); // Skip if no password provided
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push({
        param: req.body.password ? 'password' : 'newPassword',
        msg: `Password must be at least ${minLength} characters long`,
        value: password
      });
    }

    if (!hasUpperCase) {
      errors.push({
        param: req.body.password ? 'password' : 'newPassword',
        msg: 'Password must contain at least one uppercase letter',
        value: password
      });
    }

    if (!hasLowerCase) {
      errors.push({
        param: req.body.password ? 'password' : 'newPassword',
        msg: 'Password must contain at least one lowercase letter',
        value: password
      });
    }

    if (!hasNumbers) {
      errors.push({
        param: req.body.password ? 'password' : 'newPassword',
        msg: 'Password must contain at least one number',
        value: password
      });
    }

    if (!hasSpecialChar) {
      errors.push({
        param: req.body.password ? 'password' : 'newPassword',
        msg: 'Password must contain at least one special character',
        value: password
      });
    }

    if (errors.length > 0) {
      return sendResponse(res, validationErrorResponse(errors));
    }

    next();
  }
};
