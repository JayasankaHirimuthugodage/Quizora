import express from 'express';
import { AuthController } from '../controllers/index.js';
import { 
  loginValidation,
  passwordResetValidation,
  resetPasswordValidation,
  verifyOtpValidation,
  changePasswordValidation,
  directChangePasswordValidation,
  passwordChangeOtpRequestValidation,
  otpPasswordChangeValidation
} from '../utils/validators.js';
import { 
  handleValidationErrors,
  customValidations
} from '../middlewares/validation.js';
import { 
  loginRateLimit,
  passwordResetRateLimit,
  userPasswordChangeRateLimit,
  otpRequestRateLimit,
  otpVerificationRateLimit
} from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  loginRateLimit,
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  AuthController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  authenticate,
  AuthController.logout
);

/**
 * @route   POST /api/auth/forgot-password-otp
 * @desc    Send password reset OTP via email
 * @access  Public
 */
router.post('/forgot-password-otp',
  passwordResetRateLimit,
  passwordResetValidation,
  handleValidationErrors,
  AuthController.forgotPasswordOtp
);

/**
 * @route   POST /api/auth/verify-forgot-password-otp
 * @desc    Verify OTP and reset password
 * @access  Public
 */
router.post('/verify-forgot-password-otp',
  otpVerificationRateLimit,
  verifyOtpValidation,
  handleValidationErrors,
  AuthController.verifyForgotPasswordOtp
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.put('/change-password',
  authenticate,
  userPasswordChangeRateLimit,
  directChangePasswordValidation,
  handleValidationErrors,
  customValidations.validatePasswordStrength,
  AuthController.changePassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authenticate,
  AuthController.getCurrentUser
);

/**
 * @route   POST /api/auth/validate-password
 * @desc    Validate password strength
 * @access  Public
 */
router.post('/validate-password',
  AuthController.validatePassword
);

/**
 * @route   POST /api/auth/check-email
 * @desc    Check if email exists
 * @access  Public
 */
router.post('/check-email',
  AuthController.checkEmail
);

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verify password reset token
 * @access  Public
 */
router.get('/verify-reset-token/:token',
  AuthController.verifyResetToken
);

/**
 * @route   POST /api/auth/request-password-change-otp
 * @desc    Request OTP for password change (students and teachers only)
 * @access  Private
 */
router.post('/request-password-change-otp',
  authenticate,
  otpRequestRateLimit,
  passwordChangeOtpRequestValidation,
  handleValidationErrors,
  AuthController.requestPasswordChangeOtp
);

/**
 * @route   POST /api/auth/verify-otp-and-change-password
 * @desc    Verify OTP and change password (students and teachers only)
 * @access  Private
 */
router.post('/verify-otp-and-change-password',
  authenticate,
  otpVerificationRateLimit,
  otpPasswordChangeValidation,
  handleValidationErrors,
  customValidations.validatePasswordStrength,
  AuthController.verifyOtpAndChangePassword
);

export default router;
