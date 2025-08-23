/**
 * Local storage utility functions with error handling
 */

const STORAGE_PREFIX = 'quizora_';

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: `${STORAGE_PREFIX}access_token`,
  REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
  USER_DATA: `${STORAGE_PREFIX}user_data`,
  USER_PREFERENCES: `${STORAGE_PREFIX}user_preferences`,
  THEME: `${STORAGE_PREFIX}theme`,
  LANGUAGE: `${STORAGE_PREFIX}language`,
  REMEMBER_ME: `${STORAGE_PREFIX}remember_me`,
  LAST_LOGIN: `${STORAGE_PREFIX}last_login`,
  SESSION_TIMEOUT: `${STORAGE_PREFIX}session_timeout`,
  DRAFT_FORMS: `${STORAGE_PREFIX}draft_forms`,
  NOTIFICATION_SETTINGS: `${STORAGE_PREFIX}notification_settings`,
};

/**
 * Checks if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Sets an item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} True if successful
 */
export const setItem = (key, value) => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Error storing item in localStorage:', error);
    return false;
  }
};

/**
 * Gets an item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Stored value or default value
 */
export const getItem = (key, defaultValue = null) => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null || item === 'undefined' || item === undefined) {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error('Error retrieving item from localStorage:', error);
    // Clear the corrupted item
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error('Error removing corrupted item:', removeError);
    }
    return defaultValue;
  }
};

/**
 * Removes an item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export const removeItem = (key) => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing item from localStorage:', error);
    return false;
  }
};

/**
 * Clears all items from localStorage
 * @returns {boolean} True if successful
 */
export const clear = () => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Clears only Quizora-specific items from localStorage
 * @returns {boolean} True if successful
 */
export const clearQuizoraData = () => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing Quizora data from localStorage:', error);
    return false;
  }
};

/**
 * Gets the size of localStorage in bytes
 * @returns {number} Size in bytes
 */
export const getStorageSize = () => {
  if (!isStorageAvailable()) return 0;

  let total = 0;
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Error calculating storage size:', error);
  }

  return total;
};

/**
 * Gets all Quizora-specific keys from localStorage
 * @returns {Object} Object with all Quizora data
 */
export const getAllQuizoraData = () => {
  const data = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = getItem(key);
    if (value !== null) {
      data[name] = value;
    }
  });

  return data;
};

/**
 * Checks if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
export const hasItem = (key) => {
  if (!isStorageAvailable()) return false;
  
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Error checking item in localStorage:', error);
    return false;
  }
};

/**
 * Gets all keys from localStorage
 * @returns {Array} Array of all keys
 */
export const getAllKeys = () => {
  if (!isStorageAvailable()) return [];
  
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('Error getting all keys from localStorage:', error);
    return [];
  }
};

/**
 * Sets an item with expiration time
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} expirationMs - Expiration time in milliseconds
 * @returns {boolean} True if successful
 */
export const setItemWithExpiration = (key, value, expirationMs) => {
  const expirationTime = Date.now() + expirationMs;
  const itemWithExpiration = {
    value,
    expiration: expirationTime,
  };
  
  return setItem(key, itemWithExpiration);
};

/**
 * Gets an item with expiration check
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist or is expired
 * @returns {any} Stored value or default value
 */
export const getItemWithExpiration = (key, defaultValue = null) => {
  const item = getItem(key);
  
  if (!item || typeof item !== 'object' || !item.hasOwnProperty('expiration')) {
    return defaultValue;
  }
  
  if (Date.now() > item.expiration) {
    removeItem(key);
    return defaultValue;
  }
  
  return item.value;
};

/**
 * Auth-specific storage utilities
 */
export const authStorage = {
  /**
   * Sets authentication tokens
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   * @param {boolean} rememberMe - Whether to persist tokens
   */
  setTokens: (accessToken, refreshToken, rememberMe = false) => {
    if (rememberMe) {
      // Store tokens directly as strings in localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        setItem(STORAGE_KEYS.REMEMBER_ME, true);
      } catch (error) {
        console.error('Error storing tokens in localStorage:', error);
      }
    } else {
      // Store tokens directly as strings in sessionStorage for current session only
      try {
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      } catch (error) {
        console.error('Error storing tokens in sessionStorage:', error);
      }
    }
  },

  /**
   * Gets access token
   * @returns {string|null} Access token
   */
  getAccessToken: () => {
    // Check localStorage first
    let token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!token) {
      // Check sessionStorage
      try {
        token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      } catch (error) {
        console.error('Error retrieving token from sessionStorage:', error);
      }
    }
    
    return token;
  },

  /**
   * Gets refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken: () => {
    // Check localStorage first
    let token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!token) {
      // Check sessionStorage
      try {
        token = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      } catch (error) {
        console.error('Error retrieving refresh token from sessionStorage:', error);
      }
    }
    
    return token;
  },

  /**
   * Clears all authentication data
   */
  clearAuth: () => {
    removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    removeItem(STORAGE_KEYS.USER_DATA);
    removeItem(STORAGE_KEYS.REMEMBER_ME);
    removeItem(STORAGE_KEYS.LAST_LOGIN);
    removeItem(STORAGE_KEYS.SESSION_TIMEOUT);
    
    // Clear sessionStorage as well
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },

  /**
   * Sets user data
   * @param {Object} userData - User data
   */
  setUserData: (userData) => {
    setItem(STORAGE_KEYS.USER_DATA, userData);
    setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
  },

  /**
   * Gets user data
   * @returns {Object|null} User data
   */
  getUserData: () => {
    return getItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Checks if user is remembered
   * @returns {boolean} True if user chose "Remember Me"
   */
  isRemembered: () => {
    return getItem(STORAGE_KEYS.REMEMBER_ME, false);
  },

  /**
   * Gets last login time
   * @returns {string|null} Last login timestamp
   */
  getLastLogin: () => {
    return getItem(STORAGE_KEYS.LAST_LOGIN);
  },
};

/**
 * User preferences storage utilities
 */
export const preferencesStorage = {
  /**
   * Sets user theme preference
   * @param {string} theme - Theme name ('light', 'dark', 'auto')
   */
  setTheme: (theme) => {
    setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Gets user theme preference
   * @returns {string} Theme name
   */
  getTheme: () => {
    return getItem(STORAGE_KEYS.THEME, 'light');
  },

  /**
   * Sets user language preference
   * @param {string} language - Language code
   */
  setLanguage: (language) => {
    setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  /**
   * Gets user language preference
   * @returns {string} Language code
   */
  getLanguage: () => {
    return getItem(STORAGE_KEYS.LANGUAGE, 'en');
  },

  /**
   * Sets notification settings
   * @param {Object} settings - Notification settings
   */
  setNotificationSettings: (settings) => {
    setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
  },

  /**
   * Gets notification settings
   * @returns {Object} Notification settings
   */
  getNotificationSettings: () => {
    return getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, {
      email: true,
      push: true,
      desktop: false,
      sound: true,
    });
  },

  /**
   * Sets all user preferences
   * @param {Object} preferences - User preferences object
   */
  setPreferences: (preferences) => {
    setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  /**
   * Gets all user preferences
   * @returns {Object} User preferences
   */
  getPreferences: () => {
    return getItem(STORAGE_KEYS.USER_PREFERENCES, {});
  },
};

/**
 * Draft forms storage utilities
 */
export const draftStorage = {
  /**
   * Saves a draft form
   * @param {string} formId - Form identifier
   * @param {Object} formData - Form data
   */
  saveDraft: (formId, formData) => {
    const drafts = getItem(STORAGE_KEYS.DRAFT_FORMS, {});
    drafts[formId] = {
      data: formData,
      timestamp: Date.now(),
    };
    setItem(STORAGE_KEYS.DRAFT_FORMS, drafts);
  },

  /**
   * Gets a draft form
   * @param {string} formId - Form identifier
   * @returns {Object|null} Draft form data
   */
  getDraft: (formId) => {
    const drafts = getItem(STORAGE_KEYS.DRAFT_FORMS, {});
    return drafts[formId] || null;
  },

  /**
   * Removes a draft form
   * @param {string} formId - Form identifier
   */
  removeDraft: (formId) => {
    const drafts = getItem(STORAGE_KEYS.DRAFT_FORMS, {});
    delete drafts[formId];
    setItem(STORAGE_KEYS.DRAFT_FORMS, drafts);
  },

  /**
   * Gets all draft forms
   * @returns {Object} All draft forms
   */
  getAllDrafts: () => {
    return getItem(STORAGE_KEYS.DRAFT_FORMS, {});
  },

  /**
   * Clears all draft forms
   */
  clearDrafts: () => {
    removeItem(STORAGE_KEYS.DRAFT_FORMS);
  },

  /**
   * Clears old drafts (older than specified days)
   * @param {number} daysOld - Number of days
   */
  clearOldDrafts: (daysOld = 7) => {
    const drafts = getItem(STORAGE_KEYS.DRAFT_FORMS, {});
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    Object.keys(drafts).forEach(formId => {
      if (drafts[formId].timestamp < cutoffTime) {
        delete drafts[formId];
      }
    });
    
    setItem(STORAGE_KEYS.DRAFT_FORMS, drafts);
  },
};

/**
 * Cleans up corrupted localStorage entries
 * @returns {boolean} True if successful
 */
export const cleanupCorruptedData = () => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item === 'undefined' || item === 'null') {
        console.log('Removing corrupted item:', key);
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error cleaning up corrupted data:', error);
    return false;
  }
};
