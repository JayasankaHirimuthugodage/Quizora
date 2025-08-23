import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, Clock, Shield } from 'lucide-react';
import { useAuthForm } from '../../hooks/useAuth';
import { validateForgotPasswordForm, validateVerifyForgotPasswordOtpForm } from '../../utils/validators';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { requestForgotPasswordOtp, verifyForgotPasswordOtp, isLoading, error, clearError } = useAuthForm();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP Sent, 3: OTP + Password, 4: Success
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format OTP input (only digits, max 6)
    if (name === 'otp') {
      const otpValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: otpValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }

    // Clear global error
    if (error) {
      clearError();
    }
  };

  // Step 1: Email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();

    // Validate email
    const validation = validateForgotPasswordForm({ email: formData.email });
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await requestForgotPasswordOtp(formData.email, {
        onSuccess: () => {
          setCurrentStep(2); // Move to OTP sent confirmation
          startResendCooldown();
        },
        onError: (error) => {
          console.error('Request OTP error:', error);
        },
      });

      if (result.success) {
        setCurrentStep(2);
        startResendCooldown();
      }
    } catch (error) {
      console.error('Email submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Proceed to OTP verification
  const handleProceedToOtp = () => {
    setCurrentStep(3);
  };

  // Step 3: OTP + Password submission
  const handleOtpPasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();

    // Validate form
    const validation = validateVerifyForgotPasswordOtpForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyForgotPasswordOtp(formData, {
        onSuccess: () => {
          setCurrentStep(4); // Move to success screen
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Password reset successful. Please sign in with your new password.' 
              } 
            });
          }, 3000);
        },
        onError: (error) => {
          console.error('Verify OTP error:', error);
        },
      });

      if (result.success) {
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setIsSubmitting(true);
    try {
      await requestForgotPasswordOtp(formData.email);
      startResendCooldown();
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep(1);
    setFormData(prev => ({ ...prev, otp: '', password: '', confirmPassword: '' }));
    setValidationErrors({});
    clearError();
  };

  // Step 1: Email Input
  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
        </div>
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Send Reset OTP'
        )}
      </button>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to sign in
        </Link>
      </div>
    </form>
  );

  // Step 2: OTP Sent Confirmation
  const renderOtpSentStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <Mail className="h-6 w-6 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Check your email
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We've sent a 6-digit OTP to <strong>{formData.email}</strong>
        </p>
        <p className="text-xs text-gray-500">
          The code will expire in 5 minutes
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Security Notice</p>
            <p>Never share this OTP with anyone. Our team will never ask for your OTP.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleProceedToOtp}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Enter OTP Code
        </button>
        
        <button
          onClick={handleBackToEmail}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Use different email
        </button>
      </div>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Check your email
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try again
            </button>
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back to Login Link */}
      <div>
        <Link
          to="/login"
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to sign in
        </Link>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              validationErrors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
        </div>
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email[0]}</p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending reset link...
            </div>
          ) : (
            'Send reset link'
          )}
        </button>
      </div>

      {/* Security Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          For security reasons, we'll send the reset link only if an account with this email exists.
        </p>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
