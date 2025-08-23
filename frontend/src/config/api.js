// API Configuration with ES6+ features
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password',
      VALIDATE_PASSWORD: '/auth/validate-password',
      CHECK_EMAIL: '/auth/check-email',
      VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_VERIFICATION: '/auth/resend-verification',
      ENABLE_2FA: '/auth/2fa/enable',
      DISABLE_2FA: '/auth/2fa/disable',
      VERIFY_2FA: '/auth/2fa/verify',
      GENERATE_BACKUP_CODES: '/auth/2fa/backup-codes',
      USE_BACKUP_CODE: '/auth/2fa/backup-code',
      REPORT_SUSPICIOUS: '/auth/report-suspicious',
    },
  
  // Admin routes
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    RESET_USER_PASSWORD: (id) => `/admin/users/${id}/reset-password`,
    TOGGLE_USER_STATUS: (id) => `/admin/users/${id}/status`,
    STATS: '/admin/stats',
    BULK_USERS: '/admin/users/bulk',
    EXPORT_USERS: '/admin/users/export',
    DASHBOARD: '/admin/dashboard',
  },
  
  // User routes
  USERS: {
    PROFILE: '/users/profile',
    DASHBOARD: '/users/dashboard',
    BY_ID: (id) => `/users/${id}`,
    PREFERENCES: '/users/preferences',
    ACTIVITY: '/users/activity',
    LIST: '/users',
    UPLOAD_AVATAR: '/users/avatar',
    DELETE_AVATAR: '/users/avatar',
    SESSIONS: '/users/sessions',
    REVOKE_ALL_SESSIONS: '/users/sessions/revoke-all',
    AUTH_LOGS: '/users/auth-logs',
    SECURITY_STATUS: '/users/security',
  },

  // Health check
  HEALTH: '/health',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export default API_CONFIG;
