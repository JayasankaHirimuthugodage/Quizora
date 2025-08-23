import React, { useState, useMemo } from 'react';
import { X, Lock, Eye, EyeOff, Mail, Key, CheckCircle, AlertTriangle, Clock, Check } from 'lucide-react';

const ChangePasswordModal = ({ 
  isOpen, 
  onClose, 
  onChangePassword,
  isLoading = false 
}) => {
  const [step, setStep] = useState(1); // 1: Current Password, 2: OTP Request, 3: OTP + New Password, 4: Success
  const [formData, setFormData] = useState({
    currentPassword: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Password strength checker
  const passwordStrength = useMemo(() => {
    const password = formData.newPassword;
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    const metCount = Object.values(requirements).filter(Boolean).length;
    return { requirements, metCount, total: 5 };
  }, [formData.newPassword]);

  if (!isOpen) return null;

  // Start countdown timer for rate limit
  const startRateLimitCountdown = (seconds) => {
    setRateLimitCountdown(seconds);
    const timer = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start countdown timer for OTP resend
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateCurrentPassword = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    return newErrors;
  };

  const validateOtpAndPassword = () => {
    const newErrors = {};
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must contain only numbers';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    const stepErrors = validateCurrentPassword();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    try {
      // Request OTP
      await onChangePassword('request-otp', { currentPassword: formData.currentPassword });
      setOtpSent(true);
      setStep(2);
      startCountdown();
      setRateLimitCountdown(0); // Clear any rate limit countdown on success
    } catch (error) {
      // Check if it's a rate limiting error
      if (error.message.includes('You can request another OTP in')) {
        const timeMatch = error.message.match(/(\d+)\s+(\w+)/g);
        if (timeMatch) {
          // Extract seconds from the error message
          let totalSeconds = 0;
          timeMatch.forEach(match => {
            const [num, unit] = match.split(' ');
            const value = parseInt(num);
            if (unit.includes('minute')) {
              totalSeconds += value * 60;
            } else if (unit.includes('second')) {
              totalSeconds += value;
            }
          });
          startRateLimitCountdown(totalSeconds);
        }
      }
      setErrors({ currentPassword: error.message || 'Failed to verify current password' });
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || rateLimitCountdown > 0) return;
    
    try {
      await onChangePassword('request-otp', { currentPassword: formData.currentPassword });
      startCountdown();
      setErrors({});
    } catch (error) {
      // Check if it's a rate limiting error
      if (error.message.includes('You can request another OTP in')) {
        const timeMatch = error.message.match(/(\d+)\s+(\w+)/g);
        if (timeMatch) {
          let totalSeconds = 0;
          timeMatch.forEach(match => {
            const [num, unit] = match.split(' ');
            const value = parseInt(num);
            if (unit.includes('minute')) {
              totalSeconds += value * 60;
            } else if (unit.includes('second')) {
              totalSeconds += value;
            }
          });
          startRateLimitCountdown(totalSeconds);
        }
      }
      setErrors({ general: error.message || 'Failed to resend OTP' });
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    const stepErrors = validateOtpAndPassword();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    try {
      await onChangePassword('verify-and-change', {
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setStep(4);
    } catch (error) {
      setAttempts(prev => prev + 1);
      setErrors({ 
        otp: error.message || 'Invalid OTP or failed to change password'
      });
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      currentPassword: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setOtpSent(false);
    setCountdown(0);
    setRateLimitCountdown(0);
    setAttempts(0);
    setShowPasswords({ current: false, new: false, confirm: false });
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Change Password
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full ${
                  step >= stepNum ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Verify</span>
            <span>Request</span>
            <span>Confirm</span>
            <span>Done</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Current Password */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Enter your current password to proceed
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-1" />
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Request Confirmation */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">
                OTP Sent to Your Email
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a 6-digit verification code to your registered email address. 
                The code will expire in 5 minutes.
              </p>
              
              {rateLimitCountdown > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
                    <div className="text-sm text-orange-700">
                      <p className="font-medium">Rate Limit Active</p>
                      <p>Please wait {formatTime(rateLimitCountdown)} before requesting another OTP.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Enter OTP Code
              </button>
            </div>
          )}

          {/* Step 3: OTP + New Password */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Enter OTP and New Password
                </h4>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key size={16} className="inline mr-1" />
                    6-Digit OTP *
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                  )}
                  
                  {/* Resend OTP */}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || rateLimitCountdown > 0}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {rateLimitCountdown > 0 
                        ? `Wait ${formatTime(rateLimitCountdown)} to resend`
                        : countdown > 0 
                        ? `Resend in ${formatTime(countdown)}` 
                        : 'Resend OTP'
                      }
                    </button>
                    {attempts > 0 && (
                      <span className="text-sm text-orange-600">
                        Attempts: {attempts}/10
                      </span>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-1" />
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password (min 8 chars with uppercase, lowercase, number, special char)"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.newPassword && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <Check size={12} className={`mr-2 ${passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-400'}`} />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-xs ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <Check size={12} className={`mr-2 ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-400'}`} />
                          One uppercase letter (A-Z)
                        </div>
                        <div className={`flex items-center text-xs ${passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <Check size={12} className={`mr-2 ${passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-400'}`} />
                          One lowercase letter (a-z)
                        </div>
                        <div className={`flex items-center text-xs ${passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                          <Check size={12} className={`mr-2 ${passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-400'}`} />
                          One number (0-9)
                        </div>
                        <div className={`flex items-center text-xs ${passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                          <Check size={12} className={`mr-2 ${passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-400'}`} />
                          One special character (@$!%*?&)
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Strength:</span>
                          <span>{passwordStrength.metCount}/{passwordStrength.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.metCount <= 2 ? 'bg-red-500' : 
                              passwordStrength.metCount <= 3 ? 'bg-yellow-500' : 
                              passwordStrength.metCount <= 4 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength.metCount / passwordStrength.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-1" />
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Re-enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Password Requirements:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                        <li>Contains at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">
                Password Changed Successfully!
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                Your password has been updated successfully. You can now use your new password to log in.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Done
              </button>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
