import React, { useState } from 'react';
import { X, Lock, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const PasswordResetModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onResetPassword,
  isLoading = false 
}) => {
  const [resetType, setResetType] = useState('generate'); // 'generate' or 'custom'
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (resetType === 'custom') {
      if (!customPassword) {
        newErrors.customPassword = 'Password is required';
      } else if (customPassword.length < 6) {
        newErrors.customPassword = 'Password must be at least 6 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(customPassword)) {
        newErrors.customPassword = 'Password must contain uppercase, lowercase, and number';
      }
    }

    if (!confirmReset) {
      newErrors.confirm = 'Please confirm that you want to reset this user\'s password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit reset
    const passwordData = resetType === 'custom' ? { newPassword: customPassword } : {};
    await onResetPassword(user._id, passwordData);
  };

  const handleClose = () => {
    setResetType('generate');
    setCustomPassword('');
    setShowPassword(false);
    setConfirmReset(false);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Reset User Password</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Target User</h4>
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {user?.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Role:</strong> {user?.role}
            </p>
          </div>

          {/* Reset Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Password Reset Type
            </label>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="resetType"
                  value="generate"
                  checked={resetType === 'generate'}
                  onChange={(e) => setResetType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <Key size={16} className="text-blue-600" />
                    <span className="font-medium">Generate Random Password</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    System will generate a secure password and email it to the user
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="resetType"
                  value="custom"
                  checked={resetType === 'custom'}
                  onChange={(e) => setResetType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <Lock size={16} className="text-green-600" />
                    <span className="font-medium">Set Custom Password</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    You provide the new password for the user
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Password Input */}
          {resetType === 'custom' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={customPassword}
                  onChange={(e) => {
                    setCustomPassword(e.target.value);
                    if (errors.customPassword) {
                      setErrors(prev => ({ ...prev, customPassword: null }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md pr-10 ${
                    errors.customPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.customPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.customPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters with uppercase, lowercase, and number
              </p>
            </div>
          )}

          {/* Confirmation */}
          <div className="mb-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={confirmReset}
                onChange={(e) => {
                  setConfirmReset(e.target.checked);
                  if (errors.confirm) {
                    setErrors(prev => ({ ...prev, confirm: null }));
                  }
                }}
                className="mt-1"
              />
              <div>
                <span className="text-sm text-gray-700">
                  I confirm that I want to reset this user's password
                </span>
                {errors.confirm && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
                )}
              </div>
            </label>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Important Notice</h5>
                <p className="text-sm text-yellow-700">
                  {resetType === 'generate' 
                    ? 'A new password will be generated and emailed to the user. They should change it after logging in.'
                    : 'The user will need to use the new password you set. Make sure to communicate it to them securely.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;
