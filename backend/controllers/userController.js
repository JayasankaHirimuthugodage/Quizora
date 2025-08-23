import { UserService } from '../services/index.js';
import { successResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * User controller for user profile operations
 */
export class UserController {
  /**
   * Get current user profile
   * @route GET /api/users/profile
   * @access Private
   */
  static getProfile = asyncHandler(async (req, res) => {
    const user = await UserService.getUserProfile(req.user._id);

    const response = successResponse(
      user,
      'Profile retrieved successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Update current user profile
   * @route PUT /api/users/profile
   * @access Private
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    
    // Users can only update their own name and email
    const updateData = { name, email };
    
    const user = await UserService.updateUser(
      req.user._id,
      updateData,
      req.user
    );

    const response = successResponse(
      user,
      'Profile updated successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Get user by ID (for teachers to view student profiles, etc.)
   * @route GET /api/users/:id
   * @access Private
   */
  static getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    const response = successResponse(
      user,
      'User retrieved successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Get users list (limited info for non-admins)
   * @route GET /api/users
   * @access Private
   */
  static getUsers = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      role,
      search
    } = req.query;

    // Non-admin users get limited filters and info
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50), // Max 50 for non-admins
      role,
      search,
      status: 'active' // Only show active users to non-admins
    };

    const result = await UserService.getUsers(options);

    // Filter sensitive information for non-admin users
    const filteredUsers = result.users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));

    const response = successResponse(
      {
        users: filteredUsers,
        pagination: result.pagination
      },
      'Users retrieved successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Get user dashboard data based on role
   * @route GET /api/users/dashboard
   * @access Private
   */
  static getDashboard = asyncHandler(async (req, res) => {
    const { role } = req.user;

    let dashboardData = {
      user: req.user,
      role
    };

    // Add role-specific dashboard data
    switch (role) {
      case 'student':
        dashboardData = {
          ...dashboardData,
          // Add student-specific data
          enrolledCourses: [], // Placeholder
          recentQuizzes: [], // Placeholder
          achievements: [] // Placeholder
        };
        break;
        
      case 'teacher':
        dashboardData = {
          ...dashboardData,
          // Add teacher-specific data
          courses: [], // Placeholder
          students: [], // Placeholder
          recentActivity: [] // Placeholder
        };
        break;
        
      case 'admin':
        // Redirect to admin dashboard
        const stats = await UserService.getUserStats();
        dashboardData = {
          ...dashboardData,
          stats,
          recentUsers: stats.recentUsers
        };
        break;
    }

    const response = successResponse(
      dashboardData,
      'Dashboard data retrieved successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Update user preferences
   * @route PATCH /api/users/preferences
   * @access Private
   */
  static updatePreferences = asyncHandler(async (req, res) => {
    // This would typically update user preferences in a separate preferences collection
    // For now, we'll just return success
    const { preferences } = req.body;

    // TODO: Implement preferences update logic
    
    const response = successResponse(
      { preferences },
      'Preferences updated successfully'
    );

    sendResponse(res, response);
  });

  /**
   * Get user activity log
   * @route GET /api/users/activity
   * @access Private
   */
  static getActivity = asyncHandler(async (req, res) => {
    // TODO: Implement activity logging and retrieval
    const activity = [
      {
        id: 1,
        action: 'login',
        timestamp: new Date(),
        details: 'User logged in successfully'
      }
    ];

    const response = successResponse(
      activity,
      'Activity retrieved successfully'
    );

    sendResponse(res, response);
  });
}
