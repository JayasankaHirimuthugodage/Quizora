import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { User, USER_ROLES } from '../models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const runAdminTest = async () => {
  try {
    await connectDB();
    
    console.log('Checking admin users in database...\n');

    // Check if any users exist
    const allUsers = await User.find();
    console.log(` Total users in database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\n All users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Email Verified: ${user.isEmailVerified}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('   ---');
      });
    }

    // Check specifically for admin users
    const adminUsers = await User.find({ role: USER_ROLES.ADMIN });
    console.log(`\n Admin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.status}`);
        console.log(`   Email Verified: ${admin.isEmailVerified}`);
      });
    }

    // Check for the specific default admin
    const defaultAdmin = await User.findOne({ 
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@quizora.com' 
    }).select('+password'); // Explicitly include password field
    
    console.log(`\n Default admin (${process.env.DEFAULT_ADMIN_EMAIL || 'admin@quizora.com'}):`);
    if (defaultAdmin) {
      console.log('   Found in database');
      console.log(`   Name: ${defaultAdmin.name}`);
      console.log(`   Role: ${defaultAdmin.role}`);
      console.log(`   Status: ${defaultAdmin.status}`);
      console.log(`   Email Verified: ${defaultAdmin.isEmailVerified}`);
      
      // Check if password exists
      console.log(`   Password exists: ${defaultAdmin.password ? 'YES' : 'NO'}`);
      console.log(`   Password value: ${defaultAdmin.password || 'UNDEFINED/NULL'}`);
      
      if (defaultAdmin.password) {
        // Test password verification only if password exists
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
        const passwordMatch = await bcrypt.compare(defaultPassword, defaultAdmin.password);
        console.log(`   Password matches "${defaultPassword}": ${passwordMatch ? 'YES' : ' NO'}`);
        
        if (!passwordMatch) {
          console.log(` Stored password hash: ${defaultAdmin.password.substring(0, 30)}...`);
        }
      } else {
        console.log(' PASSWORD IS MISSING! This is why login fails.');
        console.log(' The user was created without a password hash.');
      }
    } else {
      console.log(' NOT found in database');
      console.log(' This is why login is failing!');
      
      // Suggest creating the admin user
      console.log('\n Solution: The default admin user needs to be created.');
      console.log('   The server should create it automatically on startup.');
      console.log('   Check if the createDefaultAdmin() function is being called.');
    }

    // Check database collections
    console.log('\n Available collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

  } catch (error) {
    console.error('Admin test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n Mongoose connection closed');
  }
};

runAdminTest();
