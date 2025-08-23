import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API configuration
  const API_BASE = import.meta.env.VITE_API_URL;
  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: apiHeaders
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
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
    let error = '';

    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          error = 'Name must be at least 2 characters long';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;
      case 'studentId':
        if (userRole === 'student') {
          if (!value) {
            error = 'Student ID is required for student accounts';
          } else if (value.length < 3) {
            error = 'Student ID must be at least 3 characters long';
          }
        }
        break;
      case 'employeeId':
        if (userRole === 'lecturer') {
          if (!value) {
            error = 'Employee ID is required for lecturer accounts';
          } else if (value.length < 3) {
            error = 'Employee ID must be at least 3 characters long';
          }
        }
        break;
      case 'course':
        if (userRole === 'student' && !value) {
          error = 'Course is required for student accounts';
        }
        break;
      case 'department':
        if (userRole === 'lecturer' && !value) {
          error = 'Department is required for lecturer accounts';
        }
        break;
      case 'subjects':
        if (userRole === 'lecturer' && (!value || value.length === 0)) {
          error = 'At least one subject is required for lecturer accounts';
        }
        break;
      case 'phoneNumber':
        if (value && !/^[\+]?[\d\s\-\(\)]{7,20}$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'enrollmentYear':
        const currentYear = new Date().getFullYear();
        if (userRole === 'student' && value) {
          if (value < 2000 || value > currentYear + 1) {
            error = 'Please enter a valid enrollment year';
          }
        }
        break;
    }

    return error;
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {};
    Object.keys(newUser).forEach(field => {
      const error = validateField(field, newUser[field], newUser.role);
      if (error) {
        errors[field] = error;
      }
    });
    return errors;
  };

  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field in real-time
    const error = validateField(name, value, newUser.role);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Re-validate role-dependent fields when role changes
    if (name === 'role') {
      const roleDependentFields = ['studentId', 'employeeId', 'course', 'department', 'subjects'];
      const updatedErrors = { ...formErrors };
      
      roleDependentFields.forEach(field => {
        const fieldError = validateField(field, newUser[field], value);
        if (fieldError) {
          updatedErrors[field] = fieldError;
        } else {
          delete updatedErrors[field];
        }
      });
      
      setFormErrors(updatedErrors);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${API_BASE}/admin/users?${queryParams}`, {
        headers: apiHeaders
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/stats`, {
        headers: apiHeaders
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Create new user
  const createUser = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(newUser).forEach(key => {
        allTouched[key] = true;
      });
      setFormTouched(allTouched);
      return;
    }

    try {
      setLoading(true);

      const userData = { ...newUser };
      
      // Clean up phone number (remove spaces, dashes, parentheses)
      if (userData.phoneNumber) {
        userData.phoneNumber = userData.phoneNumber.replace(/[^\d+]/g, '');
        if (userData.phoneNumber === '') {
          delete userData.phoneNumber;
        }
      }
      
      // Convert subjects string to array for lecturers
      if (userData.role === 'lecturer' && typeof userData.subjects === 'string') {
        userData.subjects = userData.subjects.split(',').map(s => s.trim()).filter(s => s);
      }

      // Remove role-specific fields that don't apply
      if (userData.role === 'student') {
        delete userData.employeeId;
        delete userData.department;
        delete userData.subjects;
      } else if (userData.role === 'lecturer') {
        delete userData.studentId;
        delete userData.enrollmentYear;
        delete userData.course;
      } else if (userData.role === 'admin') {
        delete userData.studentId;
        delete userData.enrollmentYear;
        delete userData.course;
        delete userData.employeeId;
        delete userData.department;
        delete userData.subjects;
      }

      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateForm(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'student',
          studentId: '',
          enrollmentYear: new Date().getFullYear(),
          course: '',
          employeeId: '',
          department: '',
          subjects: [],
          phoneNumber: '',
          address: '',
          dateOfBirth: ''
        });
        setFormErrors({});
        setFormTouched({});
        fetchUsers();
        fetchStats();
        alert('User created successfully!');
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Error creating user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: apiHeaders
      });

      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        fetchStats();
        alert('User deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user: ' + err.message);
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        fetchStats();
        alert(`User ${action}d successfully!`);
      } else {
        setError(data.message || `Failed to ${action} user`);
      }
    } catch (err) {
      setError(`Error ${action}ing user: ` + err.message);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [filters, user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
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
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {showCreateForm ? 'Cancel' : 'Create New User'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalStudents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🎓</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lecturers</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalLecturers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">👨‍🏫</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter Users</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search by name, email, student ID, or employee ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            
            {/* Role Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Department Filter */}
            <input
              type="text"
              placeholder="Filter by department..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
            />
            
            {/* Course Filter */}
            <input
              type="text"
              placeholder="Filter by course..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={filters.course}
              onChange={(e) => setFilters({ ...filters, course: e.target.value, page: 1 })}
            />
            
            {/* Enrollment Year Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={filters.enrollmentYear}
              onChange={(e) => setFilters({ ...filters, enrollmentYear: e.target.value, page: 1 })}
            >
              <option value="">All Years</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setFilters({
                role: '',
                status: '',
                search: '',
                department: '',
                course: '',
                enrollmentYear: '',
                page: 1,
                limit: 10
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Create New User</h3>
            <form onSubmit={createUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Basic Fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formTouched.name && formErrors.name 
                        ? 'border-red-500 bg-red-50' 
                        : formTouched.name && !formErrors.name 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300'
                    }`}
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                  {formTouched.name && formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formTouched.email && formErrors.email 
                        ? 'border-red-500 bg-red-50' 
                        : formTouched.email && !formErrors.email 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300'
                    }`}
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                  />
                  {formTouched.email && formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formTouched.password && formErrors.password 
                        ? 'border-red-500 bg-red-50' 
                        : formTouched.password && !formErrors.password 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300'
                    }`}
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                  />
                  {formTouched.password && formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Role *</label>
                  <select
                    name="role"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formTouched.phoneNumber && formErrors.phoneNumber 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    value={newUser.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                  {formTouched.phoneNumber && formErrors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Role-specific fields */}
                {newUser.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Student ID *</label>
                      <input
                        type="text"
                        name="studentId"
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formTouched.studentId && formErrors.studentId 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        value={newUser.studentId}
                        onChange={handleInputChange}
                        placeholder="S12345"
                      />
                      {formTouched.studentId && formErrors.studentId && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.studentId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Course *</label>
                      <input
                        type="text"
                        name="course"
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formTouched.course && formErrors.course 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        value={newUser.course}
                        onChange={handleInputChange}
                        placeholder="Computer Science"
                      />
                      {formTouched.course && formErrors.course && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.course}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Enrollment Year</label>
                      <select
                        name="enrollmentYear"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={newUser.enrollmentYear}
                        onChange={handleInputChange}
                      >
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>
                  </>
                )}

                {newUser.role === 'lecturer' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Employee ID *</label>
                      <input
                        type="text"
                        name="employeeId"
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formTouched.employeeId && formErrors.employeeId 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        value={newUser.employeeId}
                        onChange={handleInputChange}
                        placeholder="EMP001"
                      />
                      {formTouched.employeeId && formErrors.employeeId && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.employeeId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Department *</label>
                      <input
                        type="text"
                        name="department"
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formTouched.department && formErrors.department 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        value={newUser.department}
                        onChange={handleInputChange}
                        placeholder="Computer Science"
                      />
                      {formTouched.department && formErrors.department && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.department}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Subjects *</label>
                      <input
                        type="text"
                        name="subjects"
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formTouched.subjects && formErrors.subjects 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        value={Array.isArray(newUser.subjects) ? newUser.subjects.join(', ') : newUser.subjects}
                        onChange={handleInputChange}
                        placeholder="Math, Physics, Chemistry"
                      />
                      {formTouched.subjects && formErrors.subjects && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.subjects}</p>
                      )}
                      <p className="text-xs text-gray-500">Separate subjects with commas</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Users List</h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department/Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'lecturer' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                          {/* Status Toggle Button */}
                          <button
                            onClick={() => toggleUserStatus(user._id, user.status)}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                              user.status === 'active' 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.status === 'active' ? '🔒' : '🔓'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.studentId || user.employeeId || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.department || user.course || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              alert('Edit functionality will be implemented next');
                            }}
                            title="Edit user"
                          >
                            Edit
                          </button>
                          <button 
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            onClick={() => deleteUser(user._id)}
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </div>
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
  );
};

export default AdminUserManagement;
