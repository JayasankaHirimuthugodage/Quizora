// Export all components
export { default as Layout } from './Layout/Layout.jsx';
export { default as Header } from './Layout/Header.jsx';
export { default as Footer } from './Layout/Footer.jsx';
export { default as ProtectedRoute, PublicRoute, RoleBasedRoute, AdminRoute, TeacherRoute, StudentRoute } from './ProtectedRoute.jsx';

// Auth components
export { default as AuthLayout } from './Auth/AuthLayout.jsx';
export { default as LoginForm } from './Auth/LoginForm.jsx';
export { default as ForgotPasswordForm } from './Auth/ForgotPasswordForm.jsx';
export { default as ResetPasswordForm } from './Auth/ResetPasswordForm.jsx';
