import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import AdminUserManagement from './components/admin/AdminUserManagement_fixed';
import { 
  HomePage, 
  LoginPage, 
  ForgotPasswordPage, 
  ResetPasswordPage, 
  DashboardPage 
} from './pages';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with layout */}
          <Route path="/" element={
            <Layout>
              <HomePage />
            </Layout>
          } />
          
          <Route path="/home" element={
            <Layout>
              <HomePage />
            </Layout>
          } />

          {/* Public placeholder pages */}
          <Route path="/about" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">About Quizora</h1>
                  <p className="text-gray-600">Learn more about our interactive learning platform.</p>
                  <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
                </div>
              </div>
            </Layout>
          } />
          
          <Route path="/features" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Features</h1>
                  <p className="text-gray-600">Discover powerful features for educators and students.</p>
                  <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
                </div>
              </div>
            </Layout>
          } />

          {/* Authentication routes (redirect if already logged in) */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />

          {/* Protected routes (require authentication) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">User Profile</h1>
                    <p className="text-gray-600">Manage your profile and settings.</p>
                    <p className="text-sm text-gray-500 mt-4">Coming in Phase 3...</p>
                  </div>
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <Layout>
                <AdminUserManagement />
              </Layout>
            </ProtectedRoute>
          } />

          {/* 404 Not Found */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <a 
                    href="/" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go back home
                  </a>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
