import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const DeleteUserModal = ({ 
  isOpen, 
  onClose, 
  user,
  onDeleteUser,
  isLoading = false 
}) => {
  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    await onDeleteUser(user._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Delete User
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <strong className="text-gray-900">{user.name}</strong>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Status:</strong> {user.status}
            </p>
            {user.studentId && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Student ID:</strong> {user.studentId}
              </p>
            )}
            {user.employeeId && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Employee ID:</strong> {user.employeeId}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Warning: This action is permanent
                </h4>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>All user data will be permanently deleted</li>
                  <li>User will lose access to their account immediately</li>
                  <li>This action cannot be undone</li>
                  {user.role === 'teacher' && (
                    <li>Any courses or content associated with this teacher may be affected</li>
                  )}
                  {user.role === 'student' && (
                    <li>Student's progress and quiz history will be lost</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
