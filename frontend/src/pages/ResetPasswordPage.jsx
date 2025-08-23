import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/Auth/AuthLayout';
import { AlertTriangle } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to forgot password page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/forgot-password');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthLayout 
      title="Password Reset Updated"
      subtitle="We've improved our password reset process for better security."
    >
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Password Reset Process Updated
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We've upgraded to a more secure OTP-based password reset system.
          </p>
          <p className="text-xs text-gray-500">
            You'll be redirected to the new password reset page in 5 seconds...
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to New Password Reset
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
