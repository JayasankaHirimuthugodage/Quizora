import React from 'react';
import AuthLayout from '../components/Auth/AuthLayout';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout 
      title="Sign in to your account"
      subtitle="Welcome back! Please sign in to continue."
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
