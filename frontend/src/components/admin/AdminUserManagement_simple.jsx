import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminUserManagement = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage student and lecturer accounts</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p>User Management component is working!</p>
          <p>Current user: {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
