import { User, USER_ROLES, USER_STATUS } from '../models/index.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { successResponse, errorResponse, sendResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { body, validationResult } from 'express-validator';
import { EmailService } from '../services/index.js';

/**
 * Helper function to generate next Student ID for a given year
 * Format: ST{YEAR}{###} (e.g., ST2024001, ST2024002)
 */
const generateStudentId = async (enrollmentYear) => {
  const yearPrefix = `ST${enrollmentYear}`;
  
  // Find the highest existing student ID for this year
  const lastStudent = await User.findOne({
    studentId: { $regex: `^${yearPrefix}` }
  }).sort({ studentId: -1 });

  let nextNumber = 1;
  if (lastStudent && lastStudent.studentId) {
    // Extract the number part and increment
    const lastNumber = parseInt(lastStudent.studentId.slice(-3));
    nextNumber = lastNumber + 1;
  }

  // Format as 3-digit number with leading zeros
  const numberPart = nextNumber.toString().padStart(3, '0');
  return `${yearPrefix}${numberPart}`;
};

/**
 * Helper function to generate next Employee ID
 * Format: EMP{###} (e.g., EMP001, EMP002)
 */
const generateEmployeeId = async () => {
  // Find the highest existing employee ID
  const lastEmployee = await User.findOne({
    employeeId: { $regex: '^EMP' }
  }).sort({ employeeId: -1 });

  let nextNumber = 1;
  if (lastEmployee && lastEmployee.employeeId) {
    // Extract the number part and increment
    const lastNumber = parseInt(lastEmployee.employeeId.slice(3));
    nextNumber = lastNumber + 1;
  }

  // Format as 3-digit number with leading zeros
  const numberPart = nextNumber.toString().padStart(3, '0');
  return `EMP${numberPart}`;
};

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
      enrollmentYear,
      course,
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

    // Auto-generate IDs and add role-specific fields
    if (role === USER_ROLES.STUDENT) {
      userData.studentId = await generateStudentId(enrollmentYear);
      userData.enrollmentYear = enrollmentYear;
      userData.course = course;
    } else if (role === USER_ROLES.TEACHER) {
      userData.employeeId = await generateEmployeeId();
      userData.department = department;
      userData.subjects = subjects;
    }

    // Store original password before hashing for email
    const originalPassword = password;

    const user = new User(userData);
    await user.save();

    // Send welcome email with credentials (don't fail user creation if email fails)
    let emailSent = false;
    const shouldSendWelcomeEmails = process.env.SEND_WELCOME_EMAILS === 'true';
    
    if (shouldSendWelcomeEmails) {
      try {
        await EmailService.sendWelcomeEmail(
          user.email,
          user.name,
          originalPassword,
          user.role
        );
        emailSent = true;
        console.log(`✅ Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send welcome email to ${user.email}:`, emailError.message);
        
        // Log specific error types for debugging
        if (emailError.message.includes('Invalid login')) {
          console.log('💡 Email Error: Invalid Gmail credentials. Consider using App Password.');
        } else if (emailError.message.includes('connection')) {
          console.log('💡 Email Error: Connection issue. Check SMTP settings.');
        }
        
        // Continue with user creation even if email fails
      }
    } else {
      console.log(`📧 Welcome email skipped for ${user.email} (SEND_WELCOME_EMAILS=false)`);
    }

    const response = successResponse(
      {
        ...user.toJSON(),
        emailSent,
        temporaryPassword: shouldSendWelcomeEmails ? null : originalPassword // Include password in response if email not sent
      }, 
      MESSAGES.USER_CREATED, 
      HTTP_STATUS.CREATED
    );
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
   * Reset user password (Admin only)
   * @route POST /api/admin/users/:id/reset-password
   * @access Private (Admin only)
   */
  static resetUserPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      const response = errorResponse(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return sendResponse(res, response);
    }

    // Prevent admin from resetting their own password through this endpoint
    if (user._id.toString() === req.user._id.toString()) {
      const response = errorResponse('Cannot reset your own password through this endpoint. Use change password instead.', HTTP_STATUS.BAD_REQUEST);
      return sendResponse(res, response);
    }

    // Import UserService dynamically to avoid circular dependency
    const { UserService } = await import('../services/index.js');
    
    const result = await UserService.resetUserPassword(id, newPassword, req.user);

    const response = successResponse({
      message: 'Password reset successfully',
      temporaryPassword: result.temporaryPassword || null
    }, 'User password has been reset successfully');

    sendResponse(res, response);
  });

  /**
   * Update user details (Admin only)
   * @route PUT /api/admin/users/:id
   * @access Private (Admin only)
   */
  static updateUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = errorResponse('Validation failed', HTTP_STATUS.BAD_REQUEST, errors.array());
      return sendResponse(res, response);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate user exists
    const user = await User.findById(id);
    if (!user) {
      const response = errorResponse(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return sendResponse(res, response);
    }

    // Prevent updating another admin's details
    if (user.role === USER_ROLES.ADMIN && req.user._id.toString() !== id) {
      const response = errorResponse('Cannot modify admin accounts', HTTP_STATUS.FORBIDDEN);
      return sendResponse(res, response);
    }

    // If email is being changed, check if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (emailExists) {
        const response = errorResponse('Email already exists', HTTP_STATUS.BAD_REQUEST);
        return sendResponse(res, response);
      }
    }

    // Clean the update data
    const cleanedData = { ...updateData };
    
    // Remove password field if present (use separate endpoint for password changes)
    delete cleanedData.password;
    
    // Handle email normalization
    if (cleanedData.email) {
      cleanedData.email = cleanedData.email.toLowerCase();
    }

    // Remove undefined fields
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === undefined) {
        delete cleanedData[key];
      }
    });

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      cleanedData,
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Exclude password from response
      }
    );

    const response = successResponse({
      user: updatedUser
    }, 'User updated successfully');

    sendResponse(res, response);
  });

  /**
   * Delete user (Admin only)
   * @route DELETE /api/admin/users/:id
   * @access Private (Admin only)
   */
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate user exists
    const user = await User.findById(id);
    if (!user) {
      const response = errorResponse(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return sendResponse(res, response);
    }

    // Prevent deleting admin accounts
    if (user.role === USER_ROLES.ADMIN) {
      const response = errorResponse('Cannot delete admin accounts', HTTP_STATUS.FORBIDDEN);
      return sendResponse(res, response);
    }

    // Prevent self-deletion
    if (req.user._id.toString() === id) {
      const response = errorResponse('Cannot delete your own account', HTTP_STATUS.FORBIDDEN);
      return sendResponse(res, response);
    }

    await User.findByIdAndDelete(id);

    const response = successResponse({
      deletedUserId: id
    }, 'User deleted successfully');

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

/**
 * Validation middleware for password reset
 */
export const validatePasswordReset = [
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

/**
 * Validation middleware for user update
 */
export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role'),

  body('status')
    .optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage('Invalid status'),

  body('enrollmentYear')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 4 })
    .withMessage('Invalid enrollment year'),

  body('course')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Course cannot be empty'),

  body('department')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Department cannot be empty'),

  body('subjects')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return typeof value === 'string' && value.trim().length > 0;
    })
    .withMessage('At least one subject is required'),

  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Invalid phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];
