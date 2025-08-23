import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authStorage } from '../../utils/storage';

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API configuration
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  console.log('API_BASE:', API_BASE);
  console.log('Environment variables:', import.meta.env);
  
  const getApiHeaders = () => {
    const token = authStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = authStorage.getAccessToken();
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      console.log('Making API call to:', `${API_BASE}/admin/users`);
      console.log('With headers:', getApiHeaders());

      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: getApiHeaders()
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response. Please check if you are logged in as admin.');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        setUsers(data.data.users || data.data);
      } else {
        setError(data.message || `Server error: ${response.status}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.message.includes('JSON')) {
        setError('Authentication failed. Please login as admin.');
      } else {
        setError('Error fetching users: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug logging
    console.log('User from context:', user);
    console.log('Token from storage:', authStorage.getAccessToken());
    console.log('User role:', user?.role);
    
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    const token = authStorage.getAccessToken();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900">Debug Info:</h3>
            <p className="text-sm text-blue-700">User: {user ? user.email : 'Not logged in'}</p>
            <p className="text-sm text-blue-700">Role: {user ? user.role : 'N/A'}</p>
            <p className="text-sm text-blue-700">Token: {token ? 'Present' : 'Missing'}</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage student and lecturer accounts</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                console.log('Current user:', user);
                console.log('Current token:', authStorage.getAccessToken());
                fetchUsers();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Refresh Users
            </button>
            <button 
              onClick={async () => {
                // Test API call directly
                const token = authStorage.getAccessToken();
                console.log('Testing API call...');
                console.log('Token:', token?.substring(0, 50) + '...');
                
                try {
                  const response = await fetch(`${API_BASE}/health`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });
                  const health = await response.json();
                  console.log('Health check:', health);
                  
                  // Now test admin endpoint
                  const adminResponse = await fetch(`${API_BASE}/admin/users`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  console.log('Admin response status:', adminResponse.status);
                  const adminData = await adminResponse.text();
                  console.log('Admin response text:', adminData);
                  
                } catch (error) {
                  console.error('Direct API test failed:', error);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Test API
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
            
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'lecturer' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
