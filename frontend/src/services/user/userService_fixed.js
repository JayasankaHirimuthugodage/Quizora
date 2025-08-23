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
    return apiService.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Update response
   */
  static async updateProfile(profileData) {
    return apiService.put(API_CONFIG.ENDPOINTS.USERS.PROFILE, profileData);
  }

  /**
   * Get user dashboard data
   * @returns {Promise} Dashboard data
   */
  static async getDashboard() {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS.DASHBOARD);
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} User data
   */
  static async getUserById(userId) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`);
  }

  /**
   * Get users list
   * @param {Object} params - Query parameters
   * @returns {Promise} Users list
   */
  static async getUsers(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS.LIST, { params });
  }

  /**
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise} Update response
   */
  static async updatePreferences(preferences) {
    return apiService.patch(API_CONFIG.ENDPOINTS.USERS.PREFERENCES, { preferences });
  }

  /**
   * Get user activity
   * @returns {Promise} User activity data
   */
  static async getActivity() {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS.ACTIVITY);
  }
}

/**
 * Admin service for administrative operations
 */
export class AdminService {
  /**
   * Create new user (admin only)
   * @param {Object} userData - User data
   * @returns {Promise} Created user data
   */
  static async createUser(userData) {
    return apiService.post(API_CONFIG.ENDPOINTS.ADMIN.USERS, userData);
  }

  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise} Users list
   */
  static async getAllUsers(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.USERS, { params });
  }

  /**
   * Get user details (admin only)
   * @param {string} userId - User ID
   * @returns {Promise} User details
   */
  static async getUserDetails(userId) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}`);
  }

  /**
   * Update user (admin only)
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Update response
   */
  static async updateUser(userId, userData) {
    return apiService.put(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}`, userData);
  }

  /**
   * Delete user (admin only)
   * @param {string} userId - User ID
   * @returns {Promise} Delete response
   */
  static async deleteUser(userId) {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}`);
  }

  /**
   * Reset user password (admin only)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise} Reset response
   */
  static async resetUserPassword(userId, newPassword) {
    return apiService.post(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/reset-password`, {
      password: newPassword,
    });
  }

  /**
   * Toggle user status (admin only)
   * @param {string} userId - User ID
   * @param {string} status - New status
   * @returns {Promise} Update response
   */
  static async toggleUserStatus(userId, status) {
    return apiService.patch(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/status`, {
      status,
    });
  }

  /**
   * Get admin statistics
   * @returns {Promise} Statistics data
   */
  static async getStats() {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.STATS);
  }

  /**
   * Bulk create users (admin only)
   * @param {Array} users - Array of user data
   * @returns {Promise} Bulk create response
   */
  static async bulkCreateUsers(users) {
    return apiService.post(API_CONFIG.ENDPOINTS.ADMIN.BULK_USERS, { users });
  }

  /**
   * Export users data (admin only)
   * @param {Object} params - Export parameters
   * @returns {Promise} Export response
   */
  static async exportUsers(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.EXPORT_USERS, { params });
  }

  /**
   * Download users export (admin only)
   * @param {string} format - Export format (csv, xlsx)
   * @returns {Promise} Download response
   */
  static async downloadUsersExport(format = 'csv') {
    return apiService.download(
      API_CONFIG.ENDPOINTS.ADMIN.EXPORT_USERS,
      {
        format,
        responseType: 'blob',
      }
    );
  }

  /**
   * Get admin dashboard data
   * @returns {Promise} Dashboard data
   */
  static async getAdminDashboard() {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
  }

  /**
   * Get user audit logs (admin only)
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Audit logs
   */
  static async getUserAuditLogs(userId, params = {}) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/audit-logs`, { params });
  }

  /**
   * Send notification to user (admin only)
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   * @returns {Promise} Send response
   */
  static async sendNotification(userId, notification) {
    return apiService.post(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/notifications`, notification);
  }

  /**
   * Lock/unlock user account (admin only)
   * @param {string} userId - User ID
   * @param {boolean} locked - Lock status
   * @returns {Promise} Update response
   */
  static async lockUser(userId, locked = true) {
    return apiService.patch(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/lock`, { locked });
  }

  /**
   * Get system logs (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise} System logs
   */
  static async getSystemLogs(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.LOGS, { params });
  }

  /**
   * Update system settings (admin only)
   * @param {Object} settings - System settings
   * @returns {Promise} Update response
   */
  static async updateSystemSettings(settings) {
    return apiService.put(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS, settings);
  }

  /**
   * Get system settings (admin only)
   * @returns {Promise} System settings
   */
  static async getSystemSettings() {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS);
  }

  /**
   * Backup database (admin only)
   * @returns {Promise} Backup response
   */
  static async backupDatabase() {
    return apiService.post(API_CONFIG.ENDPOINTS.ADMIN.BACKUP);
  }

  /**
   * Restore database (admin only)
   * @param {File} backupFile - Backup file
   * @returns {Promise} Restore response
   */
  static async restoreDatabase(backupFile) {
    const formData = new FormData();
    formData.append('backup', backupFile);
    
    return apiService.post(API_CONFIG.ENDPOINTS.ADMIN.RESTORE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Clear cache (admin only)
   * @returns {Promise} Clear response
   */
  static async clearCache() {
    return apiService.post(API_CONFIG.ENDPOINTS.ADMIN.CLEAR_CACHE);
  }

  /**
   * Get security reports (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise} Security reports
   */
  static async getSecurityReports(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.ADMIN.SECURITY_REPORTS, { params });
  }

  /**
   * Force user logout (admin only)
   * @param {string} userId - User ID
   * @returns {Promise} Logout response
   */
  static async forceUserLogout(userId) {
    return apiService.post(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/force-logout`);
  }

  /**
   * Get user sessions (admin only)
   * @param {string} userId - User ID
   * @returns {Promise} User sessions
   */
  static async getUserSessions(userId) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/sessions`);
  }

  /**
   * Revoke user session (admin only)
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @returns {Promise} Revoke response
   */
  static async revokeUserSession(userId, sessionId) {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${userId}/sessions/${sessionId}`);
  }
}

export default UserService;
