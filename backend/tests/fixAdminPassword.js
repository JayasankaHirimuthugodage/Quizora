import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const fixAdminPassword = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Fixing admin password...\n');

    // Find the admin user
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@quizora.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
    
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log(`👤 Found admin: ${admin.name} (${admin.email})`);
    console.log(`🔐 Current password exists: ${admin.password ? 'YES' : 'NO'}`);
    
    // Hash the password
    console.log(`🔒 Hashing password: "${adminPassword}"`);
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Update the admin user with the hashed password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Admin password updated successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🔐 Hash: ${hashedPassword.substring(0, 30)}...`);
    
    // Verify the password works
    const isValid = await bcrypt.compare(adminPassword, hashedPassword);
    console.log(`✅ Password verification: ${isValid ? 'PASS' : 'FAIL'}`);
    
    console.log('\n🎉 Admin user is now ready for login!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Mongoose connection closed');
  }
};

fixAdminPassword();
