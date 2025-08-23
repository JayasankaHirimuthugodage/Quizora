// Application Constants with ES6+ features

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'quizora_access_token',
  REFRESH_TOKEN: 'quizora_refresh_token',
  USER_DATA: 'quizora_user_data',
  THEME: 'quizora_theme',
  LANGUAGE: 'quizora_language',
};

// Routes
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    CREATE_USER: '/admin/users/create',
    EDIT_USER: '/admin/users/edit',
    USER_DETAILS: '/admin/users/details',
    STATISTICS: '/admin/statistics',
  },
  
  // Teacher routes
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    COURSES: '/teacher/courses',
    STUDENTS: '/teacher/students',
  },
  
  // Student routes
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    QUIZZES: '/student/quizzes',
  },
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  NAME_INVALID: 'Name can only contain letters and spaces',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters long',
  NAME_MAX_LENGTH: 'Name cannot exceed 50 characters',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Modal Types
export const MODAL_TYPES = {
  CONFIRM: 'confirm',
  INFO: 'info',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  RESET_PASSWORD: 'reset_password',
  BULK_CREATE: 'bulk_create',
};

// Sort Orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Filter Options
export const FILTER_OPTIONS = {
  ROLES: Object.values(USER_ROLES),
  STATUSES: Object.values(USER_STATUS),
  SORT_FIELDS: ['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'],
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email!',
  PASSWORD_RESET_SUCCESS: 'Password reset successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// App Information
export const APP_INFO = {
  NAME: 'Quizora',
  VERSION: '1.0.0',
  DESCRIPTION: 'Secure Quiz Management Platform',
  AUTHOR: 'Quizora Team',
  COPYRIGHT: '© 2025 Quizora. All rights reserved.',
};
