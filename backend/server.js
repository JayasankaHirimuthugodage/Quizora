import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongooseConnection from './config/db.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { generalRateLimit } from './middlewares/rateLimiter.js';
import { User, USER_ROLES } from './models/index.js';
import { generateRandomPassword } from './utils/helpers.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Quizora API is running successfully! 🚀',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Create default admin user if none exists
 */
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: USER_ROLES.ADMIN });
    
    if (!adminExists) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || generateRandomPassword(12);
      
      const admin = new User({
        name: 'Default Admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@quizora.com',
        password: defaultPassword,
        role: USER_ROLES.ADMIN,
        status: 'active',
        isEmailVerified: true
      });

      await admin.save();
      
      console.log('Default admin user created');
      console.log(` Email: ${admin.email}`);
      console.log(` Password: ${defaultPassword}`);
      console.log(' Please change the default password after first login');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

/**
 * Initialize server
 */
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    await mongooseConnection();
    
    // Create default admin user
    await createDefaultAdmin();
    
    // Start server
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Documentation: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error(' Server initialization failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(' Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(' SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Initialize server
initializeServer();
