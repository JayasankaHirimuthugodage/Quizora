import { User, USER_ROLES, USER_STATUS } from '../models/index.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { successResponse, errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { body, validationResult } from 'express-validator';

/**
 * Admin User Management Controller
 * Handles CRUD operations for user management by admin
 */
export class AdminController {
  /**
   * Get all users with filtering and pagination
   * @route GET /api/admin/users
   * @access Private (Admin only)
   */
  static getAllUsers = asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      search,
      department,
      course,
      enrollmentYear
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role && Object.values(USER_ROLES).includes(role)) {
      filter.role = role;
    }
    
    if (status && Object.values(USER_STATUS).includes(status)) {
      filter.status = status;
    }
    
    if (department) {
      filter.department = new RegExp(department, 'i');
    }
    
    if (course) {
      filter.course = new RegExp(course, 'i');
    }
    
    if (enrollmentYear) {
      filter.enrollmentYear = parseInt(enrollmentYear);
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get users and total count
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password -passwordResetToken')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter)
    ]);

    const response = successResponse({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        hasNextPage: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrevPage: pageNum > 1
      }
    }, 'Users retrieved successfully');

    sendResponse(res, response);
  });

  /**
   * Create a new user (student or lecturer)
   * @route POST /api/admin/users
   * @access Private (Admin only)
   */
  static createUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = errorResponse('Validation failed', HTTP_STATUS.BAD_REQUEST, errors.array());
      return sendResponse(res, response);
    }

    const {
      name,
      email,
      password,
      role,
      studentId,
      enrollmentYear,
      course,
      employeeId,
      department,
      subjects,
      phoneNumber,
      address,
      dateOfBirth
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const response = errorResponse('User with this email already exists', HTTP_STATUS.CONFLICT);
      return sendResponse(res, response);
    }

    // Check for duplicate student/employee ID
    if (role === USER_ROLES.STUDENT && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        const response = errorResponse('Student with this ID already exists', HTTP_STATUS.CONFLICT);
        return sendResponse(res, response);
      }
    }

    if (role === USER_ROLES.TEACHER && employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        const response = errorResponse('Lecturer with this employee ID already exists', HTTP_STATUS.CONFLICT);
        return sendResponse(res, response);
      }
    }

    // Create user object
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      createdBy: req.user._id,
      phoneNumber,
      address,
      dateOfBirth
    };

    // Add role-specific fields
    if (role === USER_ROLES.STUDENT) {
      userData.studentId = studentId;
      userData.enrollmentYear = enrollmentYear;
      userData.course = course;
    } else if (role === USER_ROLES.TEACHER) {
      userData.employeeId = employeeId;
      userData.department = department;
      userData.subjects = subjects;
    }

    const user = new User(userData);
    await user.save();

    const response = successResponse(user.toJSON(), MESSAGES.USER_CREATED, HTTP_STATUS.CREATED);
    sendResponse(res, response);
  });

  /**
   * Get a single user by ID
   * @route GET /api/admin/users/:id
   * @access Private (Admin only)
   */
  static getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken')
      .populate('createdBy', 'name email');

    if (!user) {
      const response = errorResponse(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return sendResponse(res, response);
    }

    const response = successResponse(user, 'User retrieved successfully');
    sendResponse(res, response);
  });

  /**
   * Update a user
   * @route PUT /api/admin/users/:id
   * @access Private (Admin only)
   */
  static updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      const response = errorResponse(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return sendResponse(res, response);
    }

    const updateData = { ...req.body };
    delete updateData.password; // Prevent password updates through this endpoint

    Object.assign(user, updateData);
    await user.save();

    const response = successResponse(user.toJSON(), MESSAGES.USER_UPDATED);
    sendResponse(res, response);
  });

  /**
   * Delete/Deactivate a user
   * @route DELETE /api/admin/users/:id
   * @access Private (Admin only)
   */
  static deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      const response = errorResponse(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return sendResponse(res, response);
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      const response = errorResponse('Cannot delete your own account', HTTP_STATUS.BAD_REQUEST);
      return sendResponse(res, response);
    }

    // Soft delete - set status to inactive
    user.status = USER_STATUS.INACTIVE;
    await user.save();

    const response = successResponse(null, MESSAGES.USER_DELETED);
    sendResponse(res, response);
  });

  /**
   * Get user statistics
   * @route GET /api/admin/users/stats
   * @access Private (Admin only)
   */
  static getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', USER_STATUS.ACTIVE] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();

    const response = successResponse({
      totalUsers,
      roleStats: stats
    }, 'User statistics retrieved successfully');

    sendResponse(res, response);
  });
}

/**
 * Validation middleware for user creation
 */
export const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role')
];
