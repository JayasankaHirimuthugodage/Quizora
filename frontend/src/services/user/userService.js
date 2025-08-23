import apiService from '../api/apiService.js';
import { API_CONFIG } from '../../config/api.js';

/**
 * User service for user management operations
 */
export class UserService {
  /**
   * Get user profile
   * @returns {Promise} User profile data
   */
  static async getProfile() {
    return apiService.get(API_ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Update response
   */
  static async updateProfile(profileData) {
    return apiService.put(API_ENDPOINTS.USERS.PROFILE, profileData);
  }

  /**
   * Get user dashboard data
   * @returns {Promise} Dashboard data
   */
  static async getDashboard() {
    return apiService.get(API_ENDPOINTS.USERS.DASHBOARD);
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} User data
   */
  static async getUserById(userId) {
    return apiService.get(API_ENDPOINTS.USERS.BY_ID(userId));
  }

  /**
   * Get users list
   * @param {Object} params - Query parameters
   * @returns {Promise} Users list
   */
  static async getUsers(params = {}) {
    return apiService.get(API_ENDPOINTS.USERS.LIST, { params });
  }

  /**
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise} Update response
   */
  static async updatePreferences(preferences) {
    return apiService.patch(API_ENDPOINTS.USERS.PREFERENCES, { preferences });
  }

  /**
   * Get user activity
   * @returns {Promise} User activity data
   */
  static async getActivity() {
    return apiService.get(API_ENDPOINTS.USERS.ACTIVITY);
  }
}

/**
 * Admin service for user management operations (admin only)
 */
export class AdminService {
  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  static async createUser(userData) {
    return apiService.post(API_ENDPOINTS.ADMIN.USERS, userData);
  }

  /**
   * Get all users (admin view)
   * @param {Object} params - Query parameters
   * @returns {Promise} Users list with pagination
   */
  static async getUsers(params = {}) {
    return apiService.get(API_ENDPOINTS.ADMIN.USERS, { params });
  }

  /**
   * Get user by ID (admin view)
   * @param {string} userId - User ID
   * @returns {Promise} User data
   */
  static async getUserById(userId) {
    return apiService.get(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Updated user
   */
  static async updateUser(userId, userData) {
    return apiService.put(API_ENDPOINTS.ADMIN.USER_BY_ID(userId), userData);
  }

  /**
   * Delete user (soft delete)
   * @param {string} userId - User ID
   * @returns {Promise} Delete response
   */
  static async deleteUser(userId) {
    return apiService.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
  }

  /**
   * Reset user password
   * @param {string} userId - User ID
   * @param {string} password - New password (optional)
   * @returns {Promise} Reset response
   */
  static async resetUserPassword(userId, password) {
    return apiService.post(API_ENDPOINTS.ADMIN.RESET_USER_PASSWORD(userId), {
      password,
    });
  }

  /**
   * Toggle user status
   * @param {string} userId - User ID
   * @param {string} status - New status
   * @returns {Promise} Update response
   */
  static async toggleUserStatus(userId, status) {
    return apiService.patch(API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(userId), {
      status,
    });
  }

  /**
   * Get user statistics
   * @returns {Promise} Statistics data
   */
  static async getStatistics() {
    return apiService.get(API_ENDPOINTS.ADMIN.STATS);
  }

  /**
   * Update user (Admin only)
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Update response
   */
  static async updateUser(userId, userData) {
    const endpoint = `/api/admin/users/${userId}`;
    return apiService.put(endpoint, userData);
  }

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise} Delete response
   */
  static async deleteUser(userId) {
    const endpoint = `/api/admin/users/${userId}`;
    return apiService.delete(endpoint);
  }

  /**
   * Bulk create users
   * @param {Array} users - Array of user data
   * @returns {Promise} Bulk creation response
   */
  static async bulkCreateUsers(users) {
    return apiService.post(API_ENDPOINTS.ADMIN.BULK_USERS, { users });
  }

  /**
   * Export users data
   * @param {Object} params - Export parameters
   * @returns {Promise} Export response
   */
  static async exportUsers(params = {}) {
    return apiService.get(API_ENDPOINTS.ADMIN.EXPORT_USERS, { params });
  }

  /**
   * Download users CSV
   * @param {Object} params - Export parameters
   * @returns {Promise} Download response
   */
  static async downloadUsersCSV(params = {}) {
    const downloadParams = { ...params, format: 'csv' };
    return apiService.download(
      API_ENDPOINTS.ADMIN.EXPORT_USERS,
      'users.csv',
      { params: downloadParams }
    );
  }

  /**
   * Get admin dashboard data
   * @returns {Promise} Admin dashboard data
   */
  static async getDashboard() {
    return apiService.get(API_ENDPOINTS.ADMIN.DASHBOARD);
  }

  /**
   * Search users
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  static async searchUsers(query, filters = {}) {
    const params = {
      search: query,
      ...filters,
    };
    return this.getUsers(params);
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @param {Object} params - Additional parameters
   * @returns {Promise} Users list
   */
  static async getUsersByRole(role, params = {}) {
    return this.getUsers({ ...params, role });
  }

  /**
   * Get users by status
   * @param {string} status - User status
   * @param {Object} params - Additional parameters
   * @returns {Promise} Users list
   */
  static async getUsersByStatus(status, params = {}) {
    return this.getUsers({ ...params, status });
  }

  /**
   * Activate multiple users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise} Bulk activation response
   */
  static async activateUsers(userIds) {
    const promises = userIds.map(userId =>
      this.toggleUserStatus(userId, 'active')
    );
    return Promise.allSettled(promises);
  }

  /**
   * Deactivate multiple users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise} Bulk deactivation response
   */
  static async deactivateUsers(userIds) {
    const promises = userIds.map(userId =>
      this.toggleUserStatus(userId, 'inactive')
    );
    return Promise.allSettled(promises);
  }

  /**
   * Reset passwords for multiple users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise} Bulk password reset response
   */
  static async bulkResetPasswords(userIds) {
    const promises = userIds.map(userId =>
      this.resetUserPassword(userId)
    );
    return Promise.allSettled(promises);
  }
}
