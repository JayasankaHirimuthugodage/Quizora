import apiService from '../api/apiService.js';
import { API_CONFIG } from '../../config/api.js';
import { STORAGE_KEYS } from '../../utils/constants.js';

/**
 * Authentication service with ES6+ features
 */
export class AuthService {
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login response
   */
  static async login(credentials) {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.data) {
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      this.setUserSession(user, accessToken, refreshToken);
    }
    
    return response;
  }

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  static async logout() {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with local logout even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      this.clearUserSession();
    }
  }

  /**
   * Refresh access token
   * @returns {Promise} New tokens
   */
  static async refreshToken() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    if (response.success && response.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      apiService.setAuthToken(accessToken);
    }

    return response;
  }

  /**
   * Get current user
   * @returns {Promise} Current user data
   */
  static async getCurrentUser() {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
    
    if (response.success && response.data) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    }
    
    return response;
  }

  /**
   * Request forgot password OTP
   * @param {string} email - User email
   * @returns {Promise} Response
   */
  static async requestForgotPasswordOtp(email) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD_OTP, { email });
  }

  /**
   * Verify forgot password OTP and reset password
   * @param {Object} resetData - Reset password data with OTP
   * @returns {Promise} Response
   */
  static async verifyForgotPasswordOtp(resetData) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP, resetData);
  }

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @returns {Promise} Response
   */
  static async changePassword(passwordData) {
    return apiService.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  }

  /**
   * Request OTP for password change (students and teachers only)
   * @param {Object} data - Current password
   * @returns {Promise} Response
   */
  static async requestPasswordChangeOtp(data) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.REQUEST_PASSWORD_CHANGE_OTP, data);
  }

  /**
   * Verify OTP and change password (students and teachers only)
   * @param {Object} data - OTP and new password data
   * @returns {Promise} Response
   */
  static async verifyOtpAndChangePassword(data) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP_AND_CHANGE_PASSWORD, data);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Promise} Validation response
   */
  static async validatePassword(password) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.VALIDATE_PASSWORD, { password });
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise} Check response
   */
  static async checkEmail(email) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL, { email });
  }

  /**
   * Verify reset token
   * @param {string} token - Reset token
   * @returns {Promise} Verification response
   */
  static async verifyResetToken(token) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}/verify`);
  }

  /**
   * Set user session data
   * @param {Object} user - User data
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  static setUserSession(user, accessToken, refreshToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    apiService.setAuthToken(accessToken);
  }

  /**
   * Clear user session data
   */
  static clearUserSession() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    apiService.clearAuth();
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  static getStoredUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  /**
   * Get stored access token
   * @returns {string|null} Access token
   */
  static getStoredToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  static isAuthenticated() {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role check result
   */
  static hasRole(role) {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {Array} roles - Roles to check
   * @returns {boolean} Role check result
   */
  static hasAnyRole(roles) {
    const user = this.getStoredUser();
    return roles.includes(user?.role);
  }

  /**
   * Get user permissions based on role
   * @returns {Object} User permissions
   */
  static getUserPermissions() {
    const user = this.getStoredUser();
    
    if (!user) return {};
    
    const basePermissions = {
      canViewProfile: true,
      canEditProfile: true,
      canChangePassword: true,
    };

    switch (user.role) {
      case 'admin':
        return {
          ...basePermissions,
          canManageUsers: true,
          canCreateUsers: true,
          canDeleteUsers: true,
          canResetPasswords: true,
          canViewStatistics: true,
          canExportData: true,
          canAccessAdminPanel: true,
        };
        
      case 'teacher':
        return {
          ...basePermissions,
          canViewStudents: true,
          canManageCourses: true,
          canCreateQuizzes: true,
          canViewReports: true,
        };
        
      case 'student':
        return {
          ...basePermissions,
          canTakeQuizzes: true,
          canViewGrades: true,
          canJoinCourses: true,
        };
        
      default:
        return basePermissions;
    }
  }
}
