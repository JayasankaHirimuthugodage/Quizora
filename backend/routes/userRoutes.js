import express from 'express';
import { UserController } from '../controllers/index.js';
import { mongoIdValidation, userListValidation } from '../utils/validators.js';
import { handleValidationErrors, customValidations } from '../middlewares/validation.js';
import { 
  authenticate, 
  requireAnyRole, 
  requireOwnershipOrAdmin 
} from '../middlewares/index.js';
import { generalRateLimit } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireAnyRole);
router.use(generalRateLimit);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  UserController.getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile',
  customValidations.validateUniqueEmail,
  UserController.updateProfile
);

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data based on role
 * @access  Private
 */
router.get('/dashboard',
  UserController.getDashboard
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Own profile or Admin)
 */
router.get('/:id',
  mongoIdValidation,
  handleValidationErrors,
  requireOwnershipOrAdmin(),
  UserController.getUserById
);

/**
 * @route   GET /api/users
 * @desc    Get users list (limited info for non-admins)
 * @access  Private
 */
router.get('/',
  userListValidation,
  handleValidationErrors,
  UserController.getUsers
);

/**
 * @route   PATCH /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.patch('/preferences',
  UserController.updatePreferences
);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get('/activity',
  UserController.getActivity
);

export default router;
