import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateRandomToken, isExpired } from '../utils/helpers.js';
import { AppError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, MESSAGES, TOKEN_TYPES } from '../utils/constants.js';

/**
 * Authentication service class with ES6+ features
 */
export class AuthService {
  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Token expiration time
   * @returns {string} JWT token
   */
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Generate access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Token pair
   */
  static generateTokenPair(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const accessToken = this.generateToken(payload, process.env.JWT_EXPIRES_IN);
    const refreshToken = this.generateToken(
      { ...payload, type: TOKEN_TYPES.REFRESH },
      process.env.JWT_REFRESH_EXPIRES_IN
    );

    return { accessToken, refreshToken };
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Login result with user and tokens
   */
  static async login(email, password) {
    try {
      // Find user by email and include password for comparison
      const user = await User.findByEmail(email);

      if (!user) {
        throw new AppError(MESSAGES.LOGIN_FAILED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new AppError(MESSAGES.ACCOUNT_LOCKED, HTTP_STATUS.FORBIDDEN);
      }

      // Check if account is active
      if (user.status !== 'active') {
        throw new AppError('Account is not active', HTTP_STATUS.FORBIDDEN);
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw new AppError(MESSAGES.LOGIN_FAILED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date()
      });

      // Generate tokens
      const tokens = this.generateTokenPair(user);

      // Remove password from user object
      user.password = undefined;

      return {
        user,
        ...tokens
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New token pair
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);

      if (decoded.type !== TOKEN_TYPES.REFRESH) {
        throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
      }

      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'active') {
        throw new AppError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED);
      }

      return this.generateTokenPair(user);

    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
      }
      throw error;
    }
  }

  /**
   * Generate password reset token
   * @param {string} email - User email
   * @returns {Object} Reset token and user
   */
  static async generatePasswordResetToken(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if email exists or not for security
        return { success: true };
      }

      // Generate reset token
      const resetToken = generateRandomToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token to user
      await User.findByIdAndUpdate(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      return {
        success: true,
        user,
        resetToken
      };

    } catch (error) {
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Reset password using reset token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Object} Reset result
   */
  static async resetPassword(token, newPassword) {
    try {
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

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      // Reset login attempts
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      return { success: true };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Change result
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if new password is different from current
      const isSamePassword = await user.comparePassword(newPassword);

      if (isSamePassword) {
        throw new AppError(
          'New password must be different from current password',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return { success: true };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Logout user (client-side token invalidation)
   * @param {string} userId - User ID
   * @returns {Object} Logout result
   */
  static async logout(userId) {
    try {
      // For JWT, we can't invalidate tokens server-side without a blacklist
      // This is mainly for logging purposes and client-side cleanup
      return { success: true };
    } catch (error) {
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePasswordStrength(password) {
    const minLength = 8;
    const checks = {
      length: password.length >= minLength,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passed = Object.values(checks).every(check => check);
    
    return {
      isValid: passed,
      checks,
      strength: this.calculatePasswordStrength(password, checks)
    };
  }

  /**
   * Calculate password strength score
   * @param {string} password - Password
   * @param {Object} checks - Password validation checks
   * @returns {string} Strength level
   */
  static calculatePasswordStrength(password, checks) {
    let score = 0;
    
    if (checks.length) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.number) score += 1;
    if (checks.special) score += 1;
    
    if (password.length >= 12) score += 1;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}
