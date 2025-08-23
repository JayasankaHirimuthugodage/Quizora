import { User, USER_ROLES, USER_STATUS } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { generateRandomPassword, sanitizeUser } from '../utils/helpers.js';
import { EmailService } from './emailService.js';

/**
 * User service class for user management operations
 */
export class UserService {
  /**
   * Create a new user (admin only)
   * @param {Object} userData - User data
   * @param {Object} createdBy - Admin user creating the account
   * @returns {Object} Created user
   */
  static async createUser(userData, createdBy) {
    try {
      const { name, email, role = USER_ROLES.STUDENT, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError(MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      // Generate password if not provided
      const userPassword = password || generateRandomPassword();

      // Create user
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password: userPassword,
        role,
        status: USER_STATUS.ACTIVE,
        createdBy: createdBy._id
      });

      await newUser.save();

      // Send welcome email with credentials
      try {
        await EmailService.sendWelcomeEmail(
          newUser.email,
          newUser.name,
          userPassword,
          newUser.role
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail user creation if email fails
      }

      return sanitizeUser(newUser);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} User data
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return sanitizeUser(user);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user profile (for authenticated user)
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId)
        .populate('createdBy', 'name email')
        .lean();
      
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return sanitizeUser(user);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @param {Object} updatedBy - User performing the update
   * @returns {Object} Updated user
   */
  static async updateUser(userId, updateData, updatedBy) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Check if email is being changed and if it already exists
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          throw new AppError(MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
        }
      }

      // Only admins can change roles and status
      if (updatedBy.role !== USER_ROLES.ADMIN) {
        delete updateData.role;
        delete updateData.status;
      }

      // Update allowed fields
      const allowedUpdates = ['name', 'email', 'role', 'status'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      // Convert email to lowercase if provided
      if (updates.email) {
        updates.email = updates.email.toLowerCase();
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      );

      return sanitizeUser(updatedUser);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   * @param {string} userId - User ID to delete
   * @param {Object} deletedBy - Admin performing the deletion
   * @returns {Object} Deletion result
   */
  static async deleteUser(userId, deletedBy) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Prevent self-deletion
      if (userId === deletedBy._id.toString()) {
        throw new AppError(
          'You cannot delete your own account',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Soft delete by changing status
      await User.findByIdAndUpdate(userId, {
        status: USER_STATUS.INACTIVE
      });

      return { success: true };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get users list with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Paginated users list
   */
  static async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = {};
      
      if (role) {
        query.role = role;
      }
      
      if (status) {
        query.status = status;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute queries
      const [users, totalUsers] = await Promise.all([
        User.find(query)
          .select('-password')
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        User.countDocuments(query)
      ]);

      return {
        users: users.map(sanitizeUser),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNextPage: page < Math.ceil(totalUsers / limit),
          hasPrevPage: page > 1
        }
      };

    } catch (error) {
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Reset user password (admin only)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password (optional, will generate random if not provided)
   * @param {Object} resetBy - Admin performing the reset
   * @returns {Object} Reset result with new password
   */
  static async resetUserPassword(userId, newPassword, resetBy) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Generate password if not provided
      const password = newPassword || generateRandomPassword();

      // Update password and clear any existing reset tokens
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      // Send email with new password
      try {
        await EmailService.sendWelcomeEmail(
          user.email,
          user.name,
          password,
          user.role
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail password reset if email fails
      }

      return {
        success: true,
        tempPassword: password // Return for admin to share with user if email fails
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   * @param {string} userId - User ID
   * @param {string} newStatus - New status
   * @param {Object} updatedBy - Admin performing the action
   * @returns {Object} Updated user
   */
  static async toggleUserStatus(userId, newStatus, updatedBy) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Prevent self-deactivation
      if (userId === updatedBy._id.toString() && newStatus !== USER_STATUS.ACTIVE) {
        throw new AppError(
          'You cannot deactivate your own account',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: newStatus },
        { new: true, runValidators: true }
      );

      return sanitizeUser(updatedUser);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user statistics
   * @returns {Object} User statistics
   */
  static async getUserStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        usersByRole,
        recentUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: USER_STATUS.ACTIVE }),
        User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]),
        User.find()
          .select('name email role createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);

      const roleStats = usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleStats: {
          admins: roleStats[USER_ROLES.ADMIN] || 0,
          teachers: roleStats[USER_ROLES.TEACHER] || 0,
          students: roleStats[USER_ROLES.STUDENT] || 0
        },
        recentUsers: recentUsers.map(sanitizeUser)
      };

    } catch (error) {
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Bulk import users
   * @param {Array} usersData - Array of user data
   * @param {Object} createdBy - Admin creating the users
   * @returns {Object} Import result
   */
  static async bulkCreateUsers(usersData, createdBy) {
    try {
      const results = {
        success: [],
        errors: [],
        total: usersData.length
      };

      for (const userData of usersData) {
        try {
          const user = await this.createUser(userData, createdBy);
          results.success.push({
            email: userData.email,
            user: sanitizeUser(user)
          });
        } catch (error) {
          results.errors.push({
            email: userData.email,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
