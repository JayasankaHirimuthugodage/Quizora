import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component that requires authentication
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Render protected content if authenticated
  return children;
};

/**
 * PublicRoute component that redirects authenticated users
 */
export const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render public content if not authenticated
  return children;
};

/**
 * RoleBasedRoute component that requires specific roles
 */
export const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/dashboard',
  fallbackComponent = null 
}) => {
  const { isAuthenticated, isLoading, isInitialized, user, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.length === 0 || hasAnyRole(allowedRoles);

  if (!hasRequiredRole) {
    // Show fallback component or redirect
    if (fallbackComponent) {
      return fallbackComponent;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Required role{allowedRoles.length > 1 ? 's' : ''}: {allowedRoles.join(', ')}.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your current role: {user?.role || 'Unknown'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-3"
          >
            Go Back
          </button>
          <Navigate to={redirectTo} replace />
        </div>
      </div>
    );
  }

  // Render protected content if user has required role
  return children;
};

/**
 * AdminRoute component - shorthand for admin-only routes
 */
export const AdminRoute = ({ children, ...props }) => {
  return (
    <RoleBasedRoute allowedRoles={['admin']} {...props}>
      {children}
    </RoleBasedRoute>
  );
};

/**
 * TeacherRoute component - shorthand for teacher and admin routes
 */
export const TeacherRoute = ({ children, ...props }) => {
  return (
    <RoleBasedRoute allowedRoles={['teacher', 'admin']} {...props}>
      {children}
    </RoleBasedRoute>
  );
};

/**
 * StudentRoute component - shorthand for student, teacher, and admin routes
 */
export const StudentRoute = ({ children, ...props }) => {
  return (
    <RoleBasedRoute allowedRoles={['student', 'teacher', 'admin']} {...props}>
      {children}
    </RoleBasedRoute>
  );
};

export default ProtectedRoute;
