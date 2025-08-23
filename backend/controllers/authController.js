import { AuthService, EmailService } from '../services/index.js';
import { successResponse, errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

/**
 * Authentication controller with ES6+ features
 */
export class AuthController {
  /**
   * User login
   * @route POST /api/auth/login
   * @access Public
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    const response = successResponse(
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      MESSAGES.LOGIN_SUCCESS
    );

    sendResponse(res, response);
  });

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   * @access Public
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST);
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    const response = successResponse(
      tokens,
      'Token refreshed successfully'
    );

    sendResponse(res, response);
  });

  /**
   * User logout
   * @route POST /api/auth/logout
   * @access Private
   */
  static logout = asyncHandler(async (req, res) => {
    await AuthService.logout(req.user._id);

    const response = successResponse(
      null,
      MESSAGES.LOGOUT_SUCCESS
    );

    sendResponse(res, response);
  });

  /**
   * Forgot password - send reset email
   * @route POST /api/auth/forgot-password
   * @access Public
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await AuthService.generatePasswordResetToken(email);

    // If user exists, send reset email
    if (result.user && result.resetToken) {
      try {
        await EmailService.sendPasswordResetEmail(
          result.user.email,
          result.resetToken,
          result.user.name
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't expose email sending failure to client
      }
    }

    // Always return success to prevent email enumeration
    const response = successResponse(
      null,
      MESSAGES.PASSWORD_RESET_SENT
    );

    sendResponse(res, response);
  });

  /**
   * Reset password using token
   * @route POST /api/auth/reset-password
   * @access Public
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    await AuthService.resetPassword(token, password);

    const response = successResponse(
      null,
      MESSAGES.PASSWORD_RESET_SUCCESS
    );

    sendResponse(res, response);
  });

  /**
   * Change password (authenticated user)
   * @route PUT /api/auth/change-password
   * @access Private
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, password } = req.body;

    await AuthService.changePassword(
      req.user._id,
      currentPassword,
      password
    );

    const response = successResponse(
      null,
      'Password changed successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   * @access Private
   */
  static getCurrentUser = asyncHandler(async (req, res) => {
    const response = successResponse(
      req.user,
      'User profile retrieved successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Validate password strength
   * @route POST /api/auth/validate-password
   * @access Public
   */
  static validatePassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
      throw new AppError('Password is required', HTTP_STATUS.BAD_REQUEST);
    }

    const validation = AuthService.validatePasswordStrength(password);

    const response = successResponse(
      validation,
      'Password validation completed'
    );

    sendResponse(res, response);
  });

  /**
   * Check if email exists (for registration validation)
   * @route POST /api/auth/check-email
   * @access Public
   */
  static checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { User } = await import('../models/index.js');
    const user = await User.findOne({ email: email.toLowerCase() });

    const response = successResponse(
      { exists: !!user },
      'Email check completed'
    );

    sendResponse(res, response);
  });

  /**
   * Verify reset token (check if token is valid)
   * @route GET /api/auth/verify-reset-token/:token
   * @access Public
   */
  static verifyResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const { User } = await import('../models/index.js');
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError(
        MESSAGES.PASSWORD_RESET_TOKEN_INVALID,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const response = successResponse(
      { valid: true },
      'Reset token is valid'
    );

    sendResponse(res, response);
  });
}
