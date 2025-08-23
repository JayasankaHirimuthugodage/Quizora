# Email Configuration Options

## Current Issue
The Gmail SMTP authentication is failing. Here are the solutions:

## Option 1: Use Gmail App Password (Recommended)
1. Go to Google Account settings
2. Enable 2-Factor Authentication  
3. Generate an App Password for "Mail"
4. Replace EMAIL_PASSWORD with the app password

## Option 2: Use Alternative SMTP Service
Replace Gmail settings with one of these:

### Ethereal Email (Testing)
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_user
EMAIL_PASSWORD=your_ethereal_password
```

### Mailtrap (Testing)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
```

### SendGrid SMTP
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

## Option 3: Disable Email Temporarily
```env
SEND_WELCOME_EMAILS=false
```

## Current Error
Gmail is rejecting the credentials with:
"Invalid login: 535-5.7.8 Username and Password not accepted"

This typically means:
1. 2FA is enabled but App Password is not used
2. Less secure apps is disabled
3. Incorrect credentials
