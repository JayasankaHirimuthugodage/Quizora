// Simple test script to verify the new OTP forgot password API
const testForgotPasswordOtp = async () => {
  try {
    console.log('Testing forgot password OTP endpoint...');
    
    const response = await fetch('http://localhost:5000/api/auth/forgot-password-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });

    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
    
    if (response.ok) {
      console.log('✅ API endpoint is working correctly!');
      console.log('✅ Message:', data.message);
    } else {
      console.log('❌ API endpoint returned an error');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Run the test
testForgotPasswordOtp();
