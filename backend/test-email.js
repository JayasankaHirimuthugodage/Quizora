// Simple test to verify email sending functionality
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

console.log('🔧 Loading EmailService...');

try {
  const { EmailService } = await import('./services/emailService.js');
  console.log('✅ EmailService loaded successfully');
  
  await testEmailService(EmailService);
} catch (error) {
  console.error('❌ Failed to load EmailService:', error.message);
  console.error('Stack:', error.stack);
}

async function testEmailService(EmailService) {
  console.log('🧪 Testing Email Service...');
  
  try {
    // Check environment variables
    console.log('📋 Checking environment variables...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***hidden***' : 'NOT SET');
    console.log('SEND_WELCOME_EMAILS:', process.env.SEND_WELCOME_EMAILS);
    
    // Test email configuration
    console.log('🔧 Initializing email transporter...');
    await EmailService.initializeTransporter();
    console.log('✅ Email transporter initialized successfully');
    
    // Test sending welcome email
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    const testPassword = 'TempPass123';
    const testRole = 'student';
    
    console.log('📧 Testing welcome email...');
    const result = await EmailService.sendWelcomeEmail(testEmail, testName, testPassword, testRole);
    
    if (result.success) {
      console.log('✅ Welcome email test successful!');
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Welcome email test failed');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Tip: Check your EMAIL_USER and EMAIL_PASSWORD in .env file');
    }
    
    if (error.message.includes('connection')) {
      console.log('💡 Tip: Check your EMAIL_HOST and EMAIL_PORT settings');
    }
  }
}
