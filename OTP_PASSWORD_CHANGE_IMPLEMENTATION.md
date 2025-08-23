# OTP-Based Password Change Implementation

## Overview
This implementation adds a secure OTP (One-Time Password) based password change system for students and teachers in the Quizora platform. Admins continue to use the existing simple password change method.

## Features Implemented

### Backend Features
1. **Database Schema Updates**
   - Added OTP fields to User model: `passwordChangeOtp`, `passwordChangeOtpExpires`, `passwordChangeOtpAttempts`
   - Added helper methods for OTP generation, verification, and cleanup

2. **New API Endpoints**
   - `POST /api/auth/request-password-change-otp` - Generate and send OTP via email
   - `POST /api/auth/verify-otp-and-change-password` - Verify OTP and change password

3. **Email Service Enhancement**
   - New OTP email template with security information
   - Professional email design with countdown timer and security tips

4. **Security Features**
   - 6-digit numeric OTP with 5-minute expiry
   - Maximum 3 OTP verification attempts
   - Rate limiting: 1 OTP request per minute, 5 verification attempts per 15 minutes
   - Current password verification before OTP generation
   - New password validation (different from current password)

5. **Validation & Middleware**
   - Input validation for OTP format (6 digits, numeric only)
   - Password strength validation
   - Role-based access (students and teachers only)

### Frontend Features
1. **Multi-Step Change Password Modal**
   - Step 1: Current password verification
   - Step 2: OTP sent confirmation
   - Step 3: OTP input + new password
   - Step 4: Success confirmation

2. **User Experience Enhancements**
   - Resend OTP functionality with 60-second cooldown
   - Attempt counter (shows attempts used)
   - Real-time validation and error messages
   - Password visibility toggles
   - Progress indicator

3. **Dashboard Integration**
   - Change Password button for students and teachers
   - Responsive design integration

## User Flow

### For Students and Teachers:
1. Click "Change Password" button on dashboard
2. Enter current password → System verifies and requests OTP
3. Check email for 6-digit OTP (valid for 5 minutes)
4. Enter OTP and new password → System verifies and updates

### For Admins:
- Continue using existing simple password change (current + new password)
- Can also reset their password via admin panel

## Security Specifications

### OTP Settings
- **Format**: 6-digit numeric (e.g., 123456)
- **Delivery**: Email only
- **Validity**: 5 minutes
- **Attempts**: Maximum 3 verification attempts
- **Rate Limiting**: 1 OTP request per minute per user

### Email Template Features
- Professional design with Quizora branding
- Clear OTP display with large, monospace font
- Security instructions and warnings
- Expiry time and attempt limit information

### Validation Rules
- Current password must be correct
- New password must be different from current
- New password must meet strength requirements:
  - Minimum 8 characters
  - Contains uppercase and lowercase letters
  - Contains at least one number
  - Contains at least one special character

## API Documentation

### Request OTP Endpoint
```
POST /api/auth/request-password-change-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "userCurrentPassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent to your email address"
  }
}
```

### Verify OTP and Change Password
```
POST /api/auth/verify-otp-and-change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Error Handling

### Common Error Responses
- Invalid current password
- OTP expired or invalid
- Too many OTP attempts
- Rate limiting exceeded
- Password validation failures
- Email delivery failures

### Frontend Error Handling
- Field-specific error messages
- General error display
- Graceful degradation for network issues
- User-friendly error descriptions

## File Structure

### Backend Files Modified/Created
```
backend/
├── models/User.js (updated - added OTP fields and methods)
├── controllers/authController.js (updated - added OTP endpoints)
├── services/emailService.js (updated - added OTP email template)
├── utils/validators.js (updated - added OTP validation)
├── middlewares/rateLimiter.js (updated - added OTP rate limiting)
└── routes/authRoutes.js (updated - added OTP routes)
```

### Frontend Files Modified/Created
```
frontend/src/
├── components/Auth/ChangePasswordModal.jsx (new)
├── services/auth/authService.js (updated - added OTP methods)
├── config/api.js (updated - added OTP endpoints)
└── pages/DashboardPage.jsx (updated - added change password integration)
```

## Testing the Implementation

### Manual Testing Steps
1. **Start the application**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

2. **Test as Student/Teacher**
   - Login as a student or teacher
   - Click "Change Password" on dashboard
   - Follow the multi-step process
   - Check email for OTP
   - Complete password change

3. **Test Security Features**
   - Try invalid current password
   - Test OTP expiry (wait 5+ minutes)
   - Test rate limiting (request multiple OTPs quickly)
   - Test maximum attempts (enter wrong OTP 3+ times)

### Email Configuration
Ensure the following environment variables are set in backend/.env:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SEND_WELCOME_EMAILS=true
```

## Future Enhancements

### Potential Improvements
1. **SMS OTP Support** - Add phone number verification and SMS OTP
2. **TOTP Integration** - Time-based OTP using authenticator apps
3. **Backup Codes** - Generate backup codes for account recovery
4. **Password History** - Prevent reuse of recent passwords
5. **Advanced Analytics** - Track password change patterns and security metrics

### Monitoring & Logging
- Add logging for OTP generation and verification attempts
- Monitor rate limiting effectiveness
- Track email delivery success rates
- Alert on suspicious password change patterns

## Conclusion

This implementation provides a robust, secure password change system that enhances the security of the Quizora platform while maintaining excellent user experience. The OTP-based approach ensures that only legitimate users can change their passwords, while the email delivery provides an additional verification layer.

The system is designed to be maintainable, scalable, and follows security best practices for educational platforms.
