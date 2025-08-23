import { VALIDATION_MESSAGES } from './constants.js';

/**
 * Form validation utilities with ES6+ features
 */

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex (at least 8 chars, 1 upper, 1 lower, 1 number, 1 special)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Name validation regex (only letters and spaces)
const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;

/**
 * Validation rules object
 */
export const validationRules = {
  required: (value) => ({
    isValid: value !== undefined && value !== null && value !== '',
    message: VALIDATION_MESSAGES.REQUIRED,
  }),

  email: (value) => ({
    isValid: EMAIL_REGEX.test(value),
    message: VALIDATION_MESSAGES.EMAIL_INVALID,
  }),

  password: (value) => ({
    isValid: PASSWORD_REGEX.test(value),
    message: VALIDATION_MESSAGES.PASSWORD_PATTERN,
  }),

  passwordMinLength: (value, minLength = 8) => ({
    isValid: value?.length >= minLength,
    message: `Password must be at least ${minLength} characters long`,
  }),

  name: (value) => ({
    isValid: NAME_REGEX.test(value),
    message: VALIDATION_MESSAGES.NAME_INVALID,
  }),

  minLength: (value, minLength) => ({
    isValid: value?.length >= minLength,
    message: `Must be at least ${minLength} characters long`,
  }),

  maxLength: (value, maxLength) => ({
    isValid: value?.length <= maxLength,
    message: `Cannot exceed ${maxLength} characters`,
  }),

  confirmPassword: (password, confirmPassword) => ({
    isValid: password === confirmPassword,
    message: VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH,
  }),

  role: (value, allowedRoles) => ({
    isValid: allowedRoles.includes(value),
    message: `Role must be one of: ${allowedRoles.join(', ')}`,
  }),

  status: (value, allowedStatuses) => ({
    isValid: allowedStatuses.includes(value),
    message: `Status must be one of: ${allowedStatuses.join(', ')}`,
  }),
};

/**
 * Validate a single field with multiple rules
 * @param {any} value - Value to validate
 * @param {Array} rules - Array of validation rules
 * @returns {Object} Validation result
 */
export const validateField = (value, rules = []) => {
  const errors = [];

  for (const rule of rules) {
    const result = typeof rule === 'function' ? rule(value) : rule;
    if (!result.isValid) {
      errors.push(result.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

/**
 * Validate an entire form object
 * @param {Object} formData - Form data object
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} Validation result
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach((fieldName) => {
    const fieldValue = formData[fieldName];
    const fieldRules = validationSchema[fieldName];
    const fieldValidation = validateField(fieldValue, fieldRules);

    if (!fieldValidation.isValid) {
      errors[fieldName] = fieldValidation.errors;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
    firstError: Object.values(errors)[0]?.[0] || null,
  };
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  login: {
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required],
  },

  register: {
    name: [validationRules.required, validationRules.name],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    confirmPassword: [], // Handled separately with password comparison
    role: [], // Handled separately with allowed roles
  },

  forgotPassword: {
    email: [validationRules.required, validationRules.email],
  },

  resetPassword: {
    password: [validationRules.required, validationRules.password],
    confirmPassword: [], // Handled separately
  },

  changePassword: {
    currentPassword: [validationRules.required],
    password: [validationRules.required, validationRules.password],
    confirmPassword: [], // Handled separately
  },

  profile: {
    name: [validationRules.required, validationRules.name],
    email: [validationRules.required, validationRules.email],
  },

  createUser: {
    name: [validationRules.required, validationRules.name],
    email: [validationRules.required, validationRules.email],
    role: [validationRules.required],
  },
};

/**
 * Validate login form
 * @param {Object} formData - Login form data
 * @returns {Object} Validation result
 */
export const validateLoginForm = (formData) => {
  return validateForm(formData, validationSchemas.login);
};

/**
 * Validate registration form
 * @param {Object} formData - Registration form data
 * @param {Array} allowedRoles - Allowed user roles
 * @returns {Object} Validation result
 */
export const validateRegistrationForm = (formData, allowedRoles = []) => {
  const schema = { ...validationSchemas.register };
  
  // Add password confirmation validation
  if (formData.password && formData.confirmPassword) {
    schema.confirmPassword = [
      (value) => validationRules.confirmPassword(formData.password, value),
    ];
  }

  // Add role validation if roles are provided
  if (allowedRoles.length > 0) {
    schema.role = [(value) => validationRules.role(value, allowedRoles)];
  }

  return validateForm(formData, schema);
};

/**
 * Validate forgot password form
 * @param {Object} formData - Forgot password form data
 * @returns {Object} Validation result
 */
export const validateForgotPasswordForm = (formData) => {
  return validateForm(formData, validationSchemas.forgotPassword);
};

/**
 * Validate reset password form
 * @param {Object} formData - Reset password form data
 * @returns {Object} Validation result
 */
export const validateResetPasswordForm = (formData) => {
  const schema = { ...validationSchemas.resetPassword };
  
  // Add password confirmation validation
  if (formData.password && formData.confirmPassword) {
    schema.confirmPassword = [
      (value) => validationRules.confirmPassword(formData.password, value),
    ];
  }

  return validateForm(formData, schema);
};

/**
 * Validate change password form
 * @param {Object} formData - Change password form data
 * @returns {Object} Validation result
 */
export const validateChangePasswordForm = (formData) => {
  const schema = { ...validationSchemas.changePassword };
  
  // Add password confirmation validation
  if (formData.password && formData.confirmPassword) {
    schema.confirmPassword = [
      (value) => validationRules.confirmPassword(formData.password, value),
    ];
  }

  return validateForm(formData, schema);
};

/**
 * Validate profile form
 * @param {Object} formData - Profile form data
 * @returns {Object} Validation result
 */
export const validateProfileForm = (formData) => {
  return validateForm(formData, validationSchemas.profile);
};

/**
 * Validate create user form
 * @param {Object} formData - Create user form data
 * @param {Array} allowedRoles - Allowed user roles
 * @returns {Object} Validation result
 */
export const validateCreateUserForm = (formData, allowedRoles = []) => {
  const schema = { ...validationSchemas.createUser };
  
  // Add role validation
  if (allowedRoles.length > 0) {
    schema.role = [(value) => validationRules.role(value, allowedRoles)];
  }

  return validateForm(formData, schema);
};

/**
 * Real-time field validation hook
 * @param {any} value - Field value
 * @param {Array} rules - Validation rules
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} Validation state
 */
export const useFieldValidation = (value, rules = [], debounceMs = 300) => {
  const [validation, setValidation] = React.useState({
    isValid: true,
    errors: [],
    firstError: null,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== undefined && value !== '') {
        const result = validateField(value, rules);
        setValidation(result);
      } else {
        setValidation({ isValid: true, errors: [], firstError: null });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, rules, debounceMs]);

  return validation;
};
