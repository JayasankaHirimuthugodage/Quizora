import React from 'react';
import AuthLayout from '../components/Auth/AuthLayout';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="Enter your email address to receive a password reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
