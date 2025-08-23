import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthService } from '../services';
import { authStorage } from '../utils/storage';

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        isInitialized: true,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isInitialized: true,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.loading,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create Auth Context
const AuthContext = createContext(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: true } });

        // Clean up any corrupted localStorage data first
        try {
          const { cleanupCorruptedData } = await import('../utils/storage');
          cleanupCorruptedData();
        } catch (cleanupError) {
          console.warn('Could not clean up corrupted data:', cleanupError);
        }

        const token = authStorage.getAccessToken();
        const userData = authStorage.getUserData();

        if (token && userData) {
          // Verify token is still valid by making a request
          try {
            const response = await AuthService.getCurrentUser();
            console.log('getCurrentUser response:', response);
            console.log('User data from response:', response.data);
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user: response.data, token },
            });
          } catch (error) {
            console.error('Token verification failed:', error);
            // Token is invalid, clear storage
            authStorage.clearAuth();
            dispatch({
              type: AUTH_ACTIONS.LOGOUT,
            });
          }
        } else {
          dispatch({
            type: AUTH_ACTIONS.SET_LOADING,
            payload: { loading: false },
          });
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: { user: null },
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: 'Failed to initialize authentication' },
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials, rememberMe = false) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await AuthService.login(credentials);
      console.log('Login response:', response);
      const { user, accessToken, refreshToken } = response.data;
      console.log('Extracted user data:', user);
      console.log('User role:', user?.role);

      // Store tokens and user data
      authStorage.setTokens(accessToken, refreshToken, rememberMe);
      authStorage.setUserData(user);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token: accessToken,
        },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await AuthService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage and state
      authStorage.clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = authStorage.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await AuthService.refreshToken();
      const { accessToken } = response;

      // Update stored token
      const rememberMe = authStorage.isRemembered();
      authStorage.setTokens(accessToken, refreshTokenValue, rememberMe);

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { token: accessToken },
      });

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Force logout if refresh fails
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData) => {
    authStorage.setUserData(userData);
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user: userData },
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await AuthService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      await AuthService.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      return { success: false, error: errorMessage };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is teacher
  const isTeacher = () => hasRole('teacher');

  // Check if user is student
  const isStudent = () => hasRole('student');

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    changePassword,
    
    // Utility functions
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
    isStudent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export auth actions for testing
export { AUTH_ACTIONS };
