import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useAuthOperations } from '../hooks/useAuth';
import { USER_ROLES } from '../utils/constants';

const DashboardPage = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const { getUserDisplayName, getUserRoleDisplay } = useAuthOperations();

  const getDashboardContent = () => {
    if (isAdmin()) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">User Management</h3>
            <p className="text-blue-700 mb-4">Manage users, roles, and permissions</p>
            <Link 
              to="/admin/users"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </Link>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Analytics</h3>
            <p className="text-green-700 mb-4">View system analytics and reports</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              View Analytics
            </button>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">System Settings</h3>
            <p className="text-purple-700 mb-4">Configure system settings</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
              Settings
            </button>
          </div>
        </div>
      );
    }

    if (isTeacher()) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">My Quizzes</h3>
            <p className="text-blue-700 mb-4">Manage and view your created quizzes</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              View Quizzes
            </button>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Create Quiz</h3>
            <p className="text-green-700 mb-4">Create new quizzes with best practices</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              Create Quiz
            </button>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Student Progress</h3>
            <p className="text-orange-700 mb-4">Track student performance and progress</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
              View Progress
            </button>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Reports</h3>
            <p className="text-purple-700 mb-4">Generate and view detailed reports</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
              View Reports
            </button>
          </div>
        </div>
      );
    }

    if (isStudent()) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Available Quizzes</h3>
            <p className="text-blue-700 mb-4">Take quizzes assigned by your teachers</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              View Quizzes
            </button>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">My Progress</h3>
            <p className="text-green-700 mb-4">Track your learning progress and achievements</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              View Progress
            </button>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Recent Results</h3>
            <p className="text-orange-700 mb-4">View your recent quiz results and feedback</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
              View Results
            </button>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Achievements</h3>
            <p className="text-purple-700 mb-4">View your badges and achievements</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
              View Achievements
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Welcome to your dashboard!</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-gray-600 mt-2">
            Role: {getUserRoleDisplay()} • Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'First time'}
          </p>
        </div>

        {/* Dashboard Content */}
        {getDashboardContent()}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
