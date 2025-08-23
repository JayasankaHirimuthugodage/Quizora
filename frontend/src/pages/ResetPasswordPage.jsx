import React from 'react';
import AuthLayout from '../components/Auth/AuthLayout';
import ResetPasswordForm from '../components/Auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <AuthLayout 
      title="Create new password"
      subtitle="Your new password must be different from previous used passwords."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
