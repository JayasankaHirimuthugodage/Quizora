import express from 'express';
import { AdminController, validateCreateUser } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/auth.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticate);
router.use(adminMiddleware);

// User management routes
router.get('/users/stats', AdminController.getUserStats);
router.get('/users', AdminController.getAllUsers);
router.post('/users', validateCreateUser, AdminController.createUser);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

export default router;
