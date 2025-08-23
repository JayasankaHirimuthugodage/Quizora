import axios from 'axios';
import { API_CONFIG, HTTP_STATUS } from '../../config/api.js';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../../utils/constants.js';

/**
 * API Service class with ES6+ features and clean architecture
 */
class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle common responses
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const { data } = await this.refreshToken(refreshToken);
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.handleAuthFailure();
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle authentication failure
   */
  handleAuthFailure() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Handle API errors with proper formatting
   * @param {Error} error - Axios error object
   * @returns {Object} Formatted error object
   */
  handleError(error) {
    if (!error.response) {
      // Network error
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
        data: null,
      };
    }

    const { status, data } = error.response;
    
    // Get error message from response or use default
    const message = data?.message || this.getDefaultErrorMessage(status);
    
    return {
      message,
      status,
      data: data || null,
      errors: data?.errors || [],
    };
  }

  /**
   * Get default error message based on status code
   * @param {number} status - HTTP status code
   * @returns {string} Error message
   */
  getDefaultErrorMessage(status) {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return ERROR_MESSAGES.TOO_MANY_REQUESTS;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.VALIDATION_ERROR;
    }
  }

  /**
   * Generic GET request
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async get(url, config = {}) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async post(url, data = {}, config = {}) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async put(url, data = {}, config = {}) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async patch(url, data = {}, config = {}) {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async delete(url, config = {}) {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} New tokens
   */
  async refreshToken(refreshToken) {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  /**
   * Set authentication token
   * @param {string} token - Access token
   */
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      delete this.api.defaults.headers.Authorization;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    delete this.api.defaults.headers.Authorization;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Upload file
   * @param {string} url - Upload URL
   * @param {FormData} formData - Form data with file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Response data
   */
  async upload(url, formData, onProgress) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await this.api.post(url, formData, config);
    return response.data;
  }

  /**
   * Download file
   * @param {string} url - Download URL
   * @param {string} filename - File name
   * @returns {Promise} Blob data
   */
  async download(url, filename) {
    const response = await this.api.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return response.data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
