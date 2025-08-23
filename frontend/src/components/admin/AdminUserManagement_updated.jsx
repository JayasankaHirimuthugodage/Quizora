import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authStorage } from '../../utils/storage';
import PasswordResetModal from './PasswordResetModal';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import { Key, Edit, Trash2, Plus, Shield, ShieldCheck, ShieldX, RefreshCw, TestTube } from 'lucide-react';

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // API configuration
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const getApiHeaders = () => {
    const token = authStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch users with improved error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = authStorage.getAccessToken();
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('Making API call to:', `${API_BASE}/admin/users`);
      console.log('With token present:', !!token);

      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: getApiHeaders()
      });
      
      console.log('Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response. Please check if you are logged in as admin.');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        setUsers(data.data.users || data.data || []);
      } else {
        setError(data.message || `Server error: ${response.status} - ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.message.includes('JSON') || err.message.includes('Failed to fetch')) {
        setError('Authentication failed or server unreachable. Please login as admin and ensure the server is running.');
      } else {
        setError('Error fetching users: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset with improved error handling
  const handlePasswordReset = async (userId, passwordData = {}) => {
    try {
      setResetLoading(true);
      setError('');
      
      const token = authStorage.getAccessToken();
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(
          data.data?.temporaryPassword 
            ? `Password reset successfully! Temporary password: ${data.data.temporaryPassword}` 
            : 'Password reset successfully! User has been notified via email.'
        );
        setResetModalOpen(false);
        setSelectedUser(null);
        
        // Auto-hide success message after 10 seconds
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        setError(data.message || `Failed to reset password: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Error resetting password: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Open password reset modal
  const openResetModal = (userData) => {
    setSelectedUser(userData);
    setResetModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  // Close password reset modal
  const closeResetModal = () => {
    setResetModalOpen(false);
    setSelectedUser(null);
  };

  // Handle add user
  const handleAddUser = async (userData) => {
    try {
      setAddUserLoading(true);
      setError('');

      console.log('Creating user with data:', userData);

      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Add user response:', data);

      if (response.ok && data.success) {
        setSuccessMessage(`User "${userData.name}" created successfully!`);
        setAddUserModalOpen(false);
        
        // Refresh users list
        await fetchUsers();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || `Failed to create user: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Add user error:', err);
      setError('Error creating user: ' + err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  // Open add user modal
  const openAddUserModal = () => {
    setAddUserModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  // Close add user modal
  const closeAddUserModal = () => {
    setAddUserModalOpen(false);
  };

  // Handle edit user
  const handleEditUser = async (userId, userData) => {
    try {
      setEditUserLoading(true);
      setError('');
      
      console.log('Updating user:', userId, userData);

      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Edit user response:', data);

      if (response.ok && data.success) {
        setSuccessMessage(`User "${userData.name}" updated successfully!`);
        setEditUserModalOpen(false);
        
        // Refresh users list
        await fetchUsers();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || `Failed to update user: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Edit user error:', err);
      setError('Error updating user: ' + err.message);
    } finally {
      setEditUserLoading(false);
    }
  };

  // Open edit user modal
  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setEditUserModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  // Close edit user modal
  const closeEditUserModal = () => {
    setEditUserModalOpen(false);
    setSelectedUser(null);
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      setDeleteUserLoading(true);
      setError('');
      
      console.log('Deleting user:', userId);

      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      });

      const data = await response.json();
      console.log('Delete user response:', data);

      if (response.ok && data.success) {
        setSuccessMessage('User deleted successfully!');
        setDeleteUserModalOpen(false);
        
        // Refresh users list
        await fetchUsers();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || `Failed to delete user: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Error deleting user: ' + err.message);
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // Open delete user modal
  const openDeleteUserModal = (user) => {
    setSelectedUser(user);
    setDeleteUserModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  // Close delete user modal
  const closeDeleteUserModal = () => {
    setDeleteUserModalOpen(false);
    setSelectedUser(null);
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <ShieldCheck size={16} className="text-red-600" />;
      case 'teacher':
      case 'lecturer':
        return <Shield size={16} className="text-purple-600" />;
      case 'student':
      default:
        return <ShieldX size={16} className="text-blue-600" />;
    }
  };

  // Test API connectivity
  const testAPI = async () => {
    const token = authStorage.getAccessToken();
    console.log('=== API Test Starting ===');
    console.log('API Base:', API_BASE);
    console.log('Token present:', !!token);
    console.log('Token preview:', token?.substring(0, 50) + '...');
    
    try {
      // Test health endpoint
      console.log('Testing health endpoint...');
      const healthResponse = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const health = await healthResponse.json();
      console.log('Health check result:', health);
      
      // Test admin endpoint
      console.log('Testing admin endpoint...');
      const adminResponse = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: getApiHeaders()
      });
      
      console.log('Admin response status:', adminResponse.status);
      console.log('Admin response headers:', Object.fromEntries(adminResponse.headers.entries()));
      
      const adminData = await adminResponse.text();
      console.log('Admin response text:', adminData);
      
      try {
        const adminJson = JSON.parse(adminData);
        console.log('Admin response JSON:', adminJson);
      } catch (e) {
        console.log('Response is not JSON');
      }
      
    } catch (error) {
      console.error('API test failed:', error);
    }
    console.log('=== API Test Complete ===');
  };

  // Clear messages
  const clearError = () => setError('');
  const clearSuccess = () => setSuccessMessage('');

  useEffect(() => {
    console.log('AdminUserManagement mounted');
    console.log('User from context:', user);
    console.log('Token from storage:', !!authStorage.getAccessToken());
    console.log('User role:', user?.role);
    
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // Access denied screen with debug info
  if (!user || user.role !== 'admin') {
    const token = authStorage.getAccessToken();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Debug Info:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
              <p><strong>Role:</strong> {user ? user.role : 'N/A'}</p>
              <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
              <p><strong>API Base:</strong> {API_BASE}</p>
            </div>
          </div>
          
          {!user && (
            <a 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block"
            >
              Go to Login
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage student and lecturer accounts</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={testAPI}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <TestTube size={16} />
              <span>Test API</span>
            </button>
            <button 
              onClick={openAddUserModal}
              disabled={loading || addUserLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{addUserLoading ? 'Creating...' : 'Add User'}</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{successMessage}</span>
              <button 
                onClick={clearSuccess}
                className="text-green-500 hover:text-green-700 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Users {users.length > 0 && `(${users.length})`}
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userData) => (
                      <tr key={userData._id || userData.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                            <div className="text-sm text-gray-500">{userData.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(userData.role)}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                              userData.role === 'student' ? 'bg-blue-100 text-blue-800' :
                              userData.role === 'teacher' || userData.role === 'lecturer' ? 'bg-purple-100 text-purple-800' :
                              userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {userData.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            userData.status === 'active' ? 'bg-green-100 text-green-800' : 
                            userData.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userData.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openResetModal(userData)}
                              disabled={resetLoading}
                              className="text-yellow-600 hover:text-yellow-900 disabled:text-yellow-400 flex items-center space-x-1"
                              title="Reset Password"
                            >
                              <Key size={16} />
                              <span className="hidden sm:inline">Reset Password</span>
                            </button>
                            <button
                              onClick={() => openEditUserModal(userData)}
                              disabled={editUserLoading}
                              className="text-blue-600 hover:text-blue-900 disabled:text-blue-400 flex items-center space-x-1"
                              title="Edit User"
                            >
                              <Edit size={16} />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => openDeleteUserModal(userData)}
                              disabled={deleteUserLoading || userData.role === 'admin'}
                              className={`flex items-center space-x-1 ${
                                userData.role === 'admin' 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-900 disabled:text-red-400'
                              }`}
                              title={userData.role === 'admin' ? 'Cannot delete admin users' : 'Delete User'}
                            >
                              <Trash2 size={16} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No users found.</p>
                    <button 
                      onClick={fetchUsers}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Try refreshing
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={resetModalOpen}
        onClose={closeResetModal}
        user={selectedUser}
        onResetPassword={handlePasswordReset}
        isLoading={resetLoading}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={closeAddUserModal}
        onAddUser={handleAddUser}
        isLoading={addUserLoading}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editUserModalOpen}
        onClose={closeEditUserModal}
        user={selectedUser}
        onUpdateUser={handleEditUser}
        isLoading={editUserLoading}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={deleteUserModalOpen}
        onClose={closeDeleteUserModal}
        user={selectedUser}
        onDeleteUser={handleDeleteUser}
        isLoading={deleteUserLoading}
      />
    </div>
  );
};

export default AdminUserManagement;