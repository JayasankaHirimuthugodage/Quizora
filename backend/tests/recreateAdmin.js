import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { User, USER_ROLES } from '../models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const recreateAdmin = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Recreating admin user with correct password...\n');

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@quizora.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
    
    // Delete existing admin user
    const deleteResult = await User.deleteOne({ email: adminEmail });
    console.log(`🗑️  Deleted existing admin: ${deleteResult.deletedCount} user(s)`);
    
    // Create new admin user with proper password
    console.log(`👤 Creating new admin user...`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    const newAdmin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword, // This will be hashed automatically by the pre-save hook
      role: USER_ROLES.ADMIN,
      status: 'active',
      isEmailVerified: true
    });
    
    await newAdmin.save();
    console.log('✅ New admin user created successfully!');
    
    // Verify the password works
    const savedAdmin = await User.findOne({ email: adminEmail }).select('+password');
    const isValid = await bcrypt.compare(adminPassword, savedAdmin.password);
    console.log(`✅ Password verification: ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);
    
    if (isValid) {
      console.log('\n🎉 Admin user is now ready for login!');
      console.log(`Use these credentials to login:`);
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('❌ Password verification failed - something is wrong');
    }
    
  } catch (error) {
    console.error('❌ Recreation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Mongoose connection closed');
  }
};

recreateAdmin();
