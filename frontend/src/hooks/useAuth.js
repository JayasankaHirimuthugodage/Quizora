import { useAuth } from '../context/AuthContext';

// Re-export useAuth for convenience
export { useAuth } from '../context/AuthContext';

/**
 * Custom hook for authentication operations with additional utilities
 */
export const useAuthOperations = () => {
  const auth = useAuth();

  /**
   * Handle login with loading state
   */
  const handleLogin = async (credentials, rememberMe = false) => {
    const result = await auth.login(credentials, rememberMe);
    return result;
  };

  /**
   * Handle logout with confirmation
   */
  const handleLogout = async (skipConfirmation = false) => {
    if (!skipConfirmation) {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) return false;
    }
    
    await auth.logout();
    return true;
  };

  /**
   * Check if current user can access admin features
   */
  const canAccessAdmin = () => {
    return auth.isAuthenticated && auth.isAdmin();
  };

  /**
   * Check if current user can access teacher features
   */
  const canAccessTeacher = () => {
    return auth.isAuthenticated && (auth.isTeacher() || auth.isAdmin());
  };

  /**
   * Check if current user can access student features
   */
  const canAccessStudent = () => {
    return auth.isAuthenticated && (auth.isStudent() || auth.isTeacher() || auth.isAdmin());
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (!auth.user) return 'Guest';
    return auth.user.name || auth.user.email || 'User';
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    if (!auth.user?.name) return '??';
    
    const names = auth.user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].slice(0, 2).toUpperCase();
  };

  /**
   * Get user role display name
   */
  const getUserRoleDisplay = () => {
    if (!auth.user?.role) return 'User';
    
    const roleMap = {
      admin: 'Administrator',
      teacher: 'Teacher',
      student: 'Student',
    };
    
    return roleMap[auth.user.role] || auth.user.role;
  };

  /**
   * Check if user profile is complete
   */
  const isProfileComplete = () => {
    if (!auth.user) return false;
    
    const requiredFields = ['name', 'email', 'role'];
    return requiredFields.every(field => auth.user[field]);
  };

  /**
   * Get navigation items based on user role
   */
  const getNavigationItems = () => {
    const items = [
      { path: '/', label: 'Home', roles: ['admin', 'teacher', 'student'] },
    ];

    if (auth.isAuthenticated) {
      items.push({ path: '/dashboard', label: 'Dashboard', roles: ['admin', 'teacher', 'student'] });
      
      if (auth.isAdmin()) {
        items.push(
          { path: '/admin/users', label: 'Manage Users', roles: ['admin'] },
          { path: '/admin/analytics', label: 'Analytics', roles: ['admin'] }
        );
      }
      
      if (auth.isTeacher() || auth.isAdmin()) {
        items.push(
          { path: '/quizzes', label: 'My Quizzes', roles: ['teacher', 'admin'] },
          { path: '/quizzes/create', label: 'Create Quiz', roles: ['teacher', 'admin'] }
        );
      }
      
      if (auth.isStudent() || auth.isTeacher() || auth.isAdmin()) {
        items.push({ path: '/profile', label: 'Profile', roles: ['admin', 'teacher', 'student'] });
      }
    }

    return items.filter(item => 
      item.roles.includes(auth.user?.role) || item.roles.includes('guest')
    );
  };

  /**
   * Format last login time
   */
  const getLastLoginFormatted = () => {
    const lastLogin = auth.user?.lastLogin;
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return {
    ...auth,
    handleLogin,
    handleLogout,
    canAccessAdmin,
    canAccessTeacher,
    canAccessStudent,
    getUserDisplayName,
    getUserInitials,
    getUserRoleDisplay,
    isProfileComplete,
    getNavigationItems,
    getLastLoginFormatted,
  };
};

/**
 * Hook for form authentication with validation
 */
export const useAuthForm = () => {
  const auth = useAuth();

  /**
   * Login form handler with validation
   */
  const loginForm = async (formData, options = {}) => {
    const { email, password, rememberMe = false } = formData;
    const { onSuccess, onError } = options;

    // Basic validation
    if (!email || !password) {
      const error = 'Email and password are required';
      if (onError) onError(error);
      return { success: false, error };
    }

    try {
      const result = await auth.login({ email, password }, rememberMe);
      
      if (result.success) {
        if (onSuccess) onSuccess(result.user);
      } else {
        if (onError) onError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Forgot password form handler
   */
  const forgotPasswordForm = async (email, options = {}) => {
    const { onSuccess, onError } = options;

    if (!email) {
      const error = 'Email is required';
      if (onError) onError(error);
      return { success: false, error };
    }

    try {
      const result = await auth.forgotPassword(email);
      
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email';
      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Reset password form handler
   */
  const resetPasswordForm = async (formData, options = {}) => {
    const { token, password, confirmPassword } = formData;
    const { onSuccess, onError } = options;

    // Validation
    if (!token || !password || !confirmPassword) {
      const error = 'All fields are required';
      if (onError) onError(error);
      return { success: false, error };
    }

    if (password !== confirmPassword) {
      const error = 'Passwords do not match';
      if (onError) onError(error);
      return { success: false, error };
    }

    try {
      const result = await auth.resetPassword(token, password);
      
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to reset password';
      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Change password form handler
   */
  const changePasswordForm = async (formData, options = {}) => {
    const { currentPassword, newPassword, confirmPassword } = formData;
    const { onSuccess, onError } = options;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = 'All fields are required';
      if (onError) onError(error);
      return { success: false, error };
    }

    if (newPassword !== confirmPassword) {
      const error = 'New passwords do not match';
      if (onError) onError(error);
      return { success: false, error };
    }

    if (currentPassword === newPassword) {
      const error = 'New password must be different from current password';
      if (onError) onError(error);
      return { success: false, error };
    }

    try {
      const result = await auth.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to change password';
      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    loginForm,
    forgotPasswordForm,
    resetPasswordForm,
    changePasswordForm,
    isLoading: auth.isLoading,
    error: auth.error,
    clearError: auth.clearError,
  };
};
