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
   * Forgot password - send OTP via email
   * @route POST /api/auth/forgot-password-otp
   * @access Public
   */
  static forgotPasswordOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await AuthService.generateForgotPasswordOtp(email);

    // If user exists, send OTP email
    if (result.user && result.otp) {
      try {
        await EmailService.sendForgotPasswordOtpEmail(
          result.user.email,
          result.otp,
          result.user.name
        );
      } catch (emailError) {
        console.error('Failed to send forgot password OTP email:', emailError);
        // Don't expose email sending failure to client
      }
    }

    // Always return success to prevent email enumeration
    const response = successResponse(
      null,
      'If your email is registered, you will receive an OTP code shortly'
    );

    sendResponse(res, response);
  });

  /**
   * Verify forgot password OTP and reset password
   * @route POST /api/auth/verify-forgot-password-otp
   * @access Public
   */
  static verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    await AuthService.verifyOtpAndResetPassword(email, otp, password);

    const response = successResponse(
      null,
      'Password reset successfully. Please sign in with your new password.'
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

  /**
   * Request OTP for password change (students and teachers only)
   * @route POST /api/auth/request-password-change-otp
   * @access Private
   */
  static requestPasswordChangeOtp = asyncHandler(async (req, res) => {
    const { currentPassword } = req.body;

    console.log('🔍 OTP Request Debug:', {
      userId: req.user._id,
      userRole: req.user.role,
      hasCurrentPassword: !!currentPassword,
      requestTime: new Date().toISOString()
    });

    // Check if user is admin (admins use simple password change)
    if (req.user.role === 'admin') {
      throw new AppError(
        'Admins should use the regular change password endpoint',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!currentPassword) {
      throw new AppError('Current password is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { User } = await import('../models/index.js');
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    // Generate and save OTP
    const otp = user.generatePasswordChangeOtp();
    await user.save();

    // Send OTP via email
    try {
      await EmailService.sendPasswordChangeOtpEmail(
        user.email,
        otp,
        user.name
      );
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Clear the OTP if email fails
      user.clearPasswordChangeOtp();
      await user.save();
      throw new AppError('Failed to send OTP email. Please try again.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const response = successResponse(
      { message: 'OTP sent to your email address' },
      'OTP sent successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Verify OTP and change password (students and teachers only)
   * @route POST /api/auth/verify-otp-and-change-password
   * @access Private
   */
  static verifyOtpAndChangePassword = asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body;

    console.log('🔍 OTP Verification Debug:', {
      userId: req.user._id,
      userRole: req.user.role,
      hasOtp: !!otp,
      otpLength: otp?.length,
      otpValue: otp,
      hasNewPassword: !!newPassword,
      passwordLength: newPassword?.length,
      requestTime: new Date().toISOString()
    });

    // Check if user is admin
    if (req.user.role === 'admin') {
      throw new AppError(
        'Admins should use the regular change password endpoint',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!otp || !newPassword) {
      throw new AppError('OTP and new password are required', HTTP_STATUS.BAD_REQUEST);
    }

    const { User } = await import('../models/index.js');
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Verify OTP
    const otpVerification = user.verifyPasswordChangeOtp(otp);
    if (!otpVerification.valid) {
      await user.save(); // Save the incremented attempt count
      throw new AppError(otpVerification.message, HTTP_STATUS.BAD_REQUEST);
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new AppError(
        'New password must be different from current password',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.clearPasswordChangeOtp();
    await user.save();

    const response = successResponse(
      null,
      'Password changed successfully'
    );

    sendResponse(res, response);
  });
}
