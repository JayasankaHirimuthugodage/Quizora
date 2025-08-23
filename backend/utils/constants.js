// Application constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

export const MESSAGES = {
  // Auth messages
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Invalid credentials',
  LOGOUT_SUCCESS: 'Logout successful',
  ACCOUNT_LOCKED: 'Account is temporarily locked due to too many failed login attempts',
  
  // User management messages
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  
  // Password messages
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PASSWORD_RESET_TOKEN_INVALID: 'Invalid or expired password reset token',
  
  // Validation messages
  VALIDATION_ERROR: 'Validation error',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  
  // Authorization messages
  ACCESS_DENIED: 'Access denied',
  TOKEN_REQUIRED: 'Access token required',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  
  // General messages
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found'
};

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword'
};

export const EMAIL_TEMPLATES = {
  PASSWORD_RESET: 'passwordReset',
  WELCOME: 'welcome',
  ACCOUNT_LOCKED: 'accountLocked'
};

// Rate limiting configurations
export const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later'
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: 'Too many password reset requests, please try again later'
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later'
  }
};

// Validation regex patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/
};

// Session configurations
export const SESSION_CONFIG = {
  TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour before expiry
  MAX_SESSIONS_PER_USER: 5
};
