import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import questionRoutes from './routes/questionRoutes.js'; // Updated import
import User from './models/User.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

dotenv.config();

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.resolve('uploads')));

// Rate limiting (optional)
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100 // limit each IP to 100 requests per windowMs
}));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ 
      email: process.env.DEFAULT_ADMIN_EMAIL 
    });
    
    if (!adminExists) {
      const admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Initialize default admin after DB connection
mongoose.connection.once('open', () => {
  createDefaultAdmin();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes); // Updated route

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Quizora API is running', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;