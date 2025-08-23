# OTP Password Change Error Analysis

## Error Codes Encountered

### 1. **400 (Bad Request)**
**Possible Causes:**
- Missing `currentPassword` in request body
- Incorrect current password
- User role is 'admin' (admins should use different endpoint)
- Invalid authentication token

### 2. **429 (Too Many Requests)**  
**Cause:** Rate limiting is working as designed
- **OTP Requests**: 3 requests per 5 minutes exceeded
- **OTP Verification**: 10 attempts per 15 minutes exceeded

### 3. **422 (Unprocessable Entity)**
**Validation Errors in:**

#### For `/request-password-change-otp`:
```javascript
// Required field validation:
currentPassword: required, non-empty string
```

#### For `/verify-otp-and-change-password`:
```javascript
// OTP validation:
otp: exactly 6 digits, numeric only

// Password validation:
newPassword: {
  minLength: 8 characters,
  uppercase: at least 1,
  lowercase: at least 1, 
  numbers: at least 1,
  specialChars: at least 1 (@$!%*?&)
}
```

## Debugging Steps

### Step 1: Check Authentication
```bash
# Verify JWT token is valid
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/verify-token
```

### Step 2: Check User Role
```javascript
// User must be 'student' or 'teacher', NOT 'admin'
console.log('User role:', req.user.role);
```

### Step 3: Test OTP Request
```javascript
// Correct payload for OTP request:
{
  "currentPassword": "your_actual_current_password"
}
```

### Step 4: Test OTP Verification
```javascript
// Correct payload for OTP verification:
{
  "otp": "123456",  // exactly 6 digits
  "newPassword": "NewPass123!"  // meets all requirements
}
```

## Common Issues & Solutions

### Issue 1: Password Validation Failing
**Symptoms:** 422 error on password change
**Solution:** Ensure new password has:
- At least 8 characters
- 1 uppercase letter (A-Z)
- 1 lowercase letter (a-z)  
- 1 number (0-9)
- 1 special character (@$!%*?&)

**Examples:**
```
❌ "password123" (no uppercase, no special char)
❌ "Password123" (no special char)
❌ "Pass123!" (only 8 chars, but uses ! not in allowed set)
✅ "Password123@" (meets all requirements)
✅ "MyNewPass123!" (meets all requirements)
```

### Issue 2: OTP Format Validation
**Symptoms:** 422 error on OTP verification
**Solution:** OTP must be exactly 6 numeric digits
```
❌ "12345" (only 5 digits)
❌ "1234567" (7 digits)  
❌ "12345a" (contains letter)
✅ "123456" (exactly 6 digits)
```

### Issue 3: Rate Limiting
**Symptoms:** 429 error
**Solution:** Wait for the countdown to expire
- Check error message for exact wait time
- Frontend should show countdown timer
- Don't spam requests

### Issue 4: Admin User Trying OTP
**Symptoms:** 400 error "Admins should use regular change password endpoint"
**Solution:** Admins use different endpoint:
```
POST /api/auth/change-password
{
  "currentPassword": "current",
  "newPassword": "new"
}
```

## Frontend Testing Checklist

### 1. Authentication State
- [ ] User is logged in with valid JWT
- [ ] User role is 'student' or 'teacher'
- [ ] Token is not expired

### 2. Request OTP Flow  
- [ ] Current password field is not empty
- [ ] Current password is correct
- [ ] Not hitting rate limit (3 per 5 minutes)

### 3. Verify OTP Flow
- [ ] OTP is exactly 6 digits
- [ ] OTP is numeric only
- [ ] New password meets all validation rules
- [ ] Not hitting verification rate limit (10 per 15 minutes)

## Backend Console Debugging

Add these console logs temporarily for debugging:

```javascript
// In authController.js requestPasswordChangeOtp
console.log('🔍 Debug OTP Request:', {
  userId: req.user._id,
  userRole: req.user.role,
  hasCurrentPassword: !!req.body.currentPassword,
  requestTime: new Date().toISOString()
});

// In authController.js verifyOtpAndChangePassword  
console.log('🔍 Debug OTP Verification:', {
  userId: req.user._id,
  hasOtp: !!req.body.otp,
  otpLength: req.body.otp?.length,
  hasNewPassword: !!req.body.newPassword,
  passwordLength: req.body.newPassword?.length
});
```

## Network Tab Investigation

### Check Request Headers:
```
Authorization: Bearer <valid-jwt-token>
Content-Type: application/json
```

### Check Request Body for OTP Request:
```json
{
  "currentPassword": "actual_password_here"
}
```

### Check Request Body for OTP Verification:
```json
{
  "otp": "123456",
  "newPassword": "ValidPass123@"
}
```

## Quick Fix Commands

### Reset Rate Limiting (if needed):
```bash
# Restart backend server to reset in-memory rate limits
cd backend && npm start
```

### Check User in Database:
```javascript
// In MongoDB Compass or shell
db.users.findOne({email: "your_email@example.com"})
```

### Clear OTP Data (if stuck):
```javascript
// In MongoDB  
db.users.updateOne(
  {email: "your_email@example.com"}, 
  {$unset: {passwordChangeOtp: 1, passwordChangeOtpExpires: 1, passwordChangeOtpAttempts: 1}}
)
```

## Expected Successful Flow

1. **Login** → Get JWT token
2. **Request OTP** → 200 OK, "OTP sent to email"  
3. **Check Email** → Receive 6-digit OTP
4. **Verify OTP** → 200 OK, "Password changed successfully"
5. **Test Login** → Works with new password

Any deviation from this flow indicates where the issue is occurring.
