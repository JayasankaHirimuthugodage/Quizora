import { body, param, query } from 'express-validator';
import { USER_ROLES } from '../models/index.js';
import { VALIDATION_PATTERNS } from './constants.js';

// Common validation rules
const emailValidation = () => 
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase();

const passwordValidation = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(VALIDATION_PATTERNS.PASSWORD)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

const nameValidation = () =>
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(VALIDATION_PATTERNS.NAME)
    .withMessage('Name can only contain letters and spaces')
    .trim();

const roleValidation = () =>
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`);

// Login validation
export const loginValidation = [
  emailValidation(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User registration validation
export const registerValidation = [
  nameValidation(),
  emailValidation(),
  passwordValidation(),
  roleValidation()
];

// User update validation
export const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(VALIDATION_PATTERNS.NAME)
    .withMessage('Name can only contain letters and spaces')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  roleValidation(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be one of: active, inactive, suspended')
];

// Password reset validation
export const passwordResetValidation = [
  emailValidation()
];

// Reset password validation
export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  passwordValidation(),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Change password validation
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  passwordValidation(),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Query validation for user listing
export const userListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be one of: active, inactive, suspended'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
    .trim()
];

// MongoDB ObjectId validation
export const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];
