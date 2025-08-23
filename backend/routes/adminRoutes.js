import express from 'express';
import { AdminController, validateCreateUser, validatePasswordReset, validateUpdateUser } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/auth.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticate);
router.use(adminMiddleware);

// User management routes
router.get('/users/stats', AdminController.getUserStats);
router.get('/users', AdminController.getAllUsers);
router.post('/users', validateCreateUser, AdminController.createUser);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', validateUpdateUser, handleValidationErrors, AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Password reset route
router.post('/users/:id/reset-password', 
  validatePasswordReset, 
  handleValidationErrors,
  AdminController.resetUserPassword
);

export default router;
