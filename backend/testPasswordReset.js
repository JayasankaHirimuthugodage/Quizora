// Test script to verify admin password reset functionality
// Run with: node testPasswordReset.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAdminPasswordReset() {
  try {
    console.log('🧪 Testing Admin Password Reset Feature...\n');

    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@quizora.com',
        password: 'Admin123!'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Admin login failed:', loginData.message);
      return;
    }

    const token = loginData.data.accessToken;
    console.log('✅ Admin login successful');

    // Step 2: Get all users
    console.log('\nStep 2: Fetching users...');
    const usersResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const usersData = await usersResponse.json();
    
    if (!usersData.success) {
      console.log('❌ Failed to fetch users:', usersData.message);
      return;
    }

    const users = usersData.data.users || usersData.data;
    console.log(`✅ Found ${users.length} users`);

    // Find a non-admin user to test password reset
    const testUser = users.find(u => u.role !== 'admin');
    
    if (!testUser) {
      console.log('❌ No non-admin users found to test password reset');
      return;
    }

    console.log(`📝 Testing password reset for user: ${testUser.name} (${testUser.email})`);

    // Step 3: Test password reset
    console.log('\nStep 3: Testing password reset...');
    const resetResponse = await fetch(`${API_BASE}/admin/users/${testUser._id}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({}) // Generate random password
    });

    const resetData = await resetResponse.json();
    
    if (resetData.success) {
      console.log('✅ Password reset successful!');
      if (resetData.data.temporaryPassword) {
        console.log(`🔑 Temporary password: ${resetData.data.temporaryPassword}`);
      }
      console.log(`📧 Email should be sent to: ${testUser.email}`);
    } else {
      console.log('❌ Password reset failed:', resetData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAdminPasswordReset();
