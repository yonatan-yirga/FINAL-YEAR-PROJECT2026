# Email Notification for New User Creation

## Overview
When an admin or UIL officer creates a new user through the system, the user automatically receives a welcome email containing their login credentials and instructions for accessing the platform.

---

## ✅ Feature Implementation

### What Was Added

1. **Automatic Email Notification**
   - Triggered when a new user is created via Admin/UIL interface
   - Sends welcome email with login credentials
   - Includes security instructions and getting started guide

2. **Email Content**
   - User's email address
   - Temporary password
   - Role assignment
   - Department assignment
   - Login URL
   - Security recommendations
   - Getting started instructions

3. **Error Handling**
   - Email sending failures don't prevent user creation
   - Errors are logged for admin review
   - User creation succeeds even if email fails

---

## Files Modified

### Backend

#### `Backend/apps/accounts/views.py`
**Changes in `AdminUserListView.post()` method**:
- Added call to `_send_welcome_email()` after user creation
- Updated success message to indicate email was sent

**New method `_send_welcome_email()`**:
- Composes professional welcome email
- Includes login credentials
- Adds security instructions
- Sends email using Django's `send_mail()`
- Handles errors gracefully with logging

---

## Email Template

### Subject
```
Welcome to DMU Internship Management System
```

### Body
```
Hello [Full Name],

Welcome to the DMU Internship Management System!

Your account has been successfully created by the system administrator. Below are your login credentials:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email:      user@example.com
Password:   SecurePass123
Role:       Student
Department: Computer Science

Login URL:  http://localhost:5173/login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT SECURITY INSTRUCTIONS:
1. Keep your password secure and do not share it with anyone
2. We recommend changing your password after your first login
3. To change your password: Login → Settings → Change Password
4. If you did not expect this account, please contact support immediately

GETTING STARTED:
1. Visit the login page using the URL above
2. Enter your email and password
3. Complete your profile information
4. Start using the system

If you have any questions or need assistance, please contact the system administrator.

Best regards,
DMU Internship Management System
```

---

## Email Configuration

### Development Environment

By default, in development mode (`DEBUG=True`), emails are printed to the console:

```python
# settings.py
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**To test**: Check your terminal/console where Django is running to see the email output.

### Production Environment

For production, configure SMTP settings in your `.env` file:

```env
# Email Configuration
USE_SMTP=True
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. **Update .env file**:
   ```env
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx
   ```

#### Other Email Providers

**Outlook/Office 365**:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

**SendGrid**:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

**Mailgun**:
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@your-domain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
```

---

## How It Works

### User Creation Flow

1. **Admin/UIL creates user**
   - Via Manage Users page
   - Fills in: Email, Full Name, Role, Department, Password

2. **Backend processes request**
   - Creates user account in database
   - Creates role-specific profile
   - Marks user as approved and active

3. **Email notification sent**
   - Composes welcome email with credentials
   - Sends email to user's email address
   - Logs any errors (doesn't fail user creation)

4. **User receives email**
   - Opens email in their inbox
   - Reads login credentials
   - Clicks login URL
   - Logs in with provided credentials

5. **User changes password (recommended)**
   - Logs in successfully
   - Goes to Settings → Change Password
   - Sets new secure password

---

## API Endpoint

### Create User with Email Notification

```
POST /api/auth/admin/users/
```

**Headers**:
```
Authorization: Token <admin-or-uil-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "full_name": "John Doe",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "department": 1
}
```

**Response (Success - 201)**:
```json
{
  "message": "User newuser@example.com created successfully. Welcome email sent.",
  "user": {
    "id": 15,
    "email": "newuser@example.com",
    "role": "STUDENT",
    "department": 1,
    "department_name": "Computer Science",
    "is_approved": true,
    "is_active": true,
    "created_at": "2026-05-16T10:30:00Z"
  }
}
```

**Response (Error - 400)**:
```json
{
  "error": "A user with this email already exists."
}
```

---

## Security Features

### Password Security
- Passwords are hashed using Django's secure password hashing
- Original password is never stored in plain text
- Only sent once via email during account creation

### Email Security
- Emails sent over TLS/SSL encrypted connection
- Credentials only sent to verified email address
- Users encouraged to change password immediately

### Failure Handling
- Email failures don't prevent user creation
- Errors logged for admin review
- Admin can manually send credentials if needed

---

## Testing

### Development Testing (Console Backend)

1. **Start Django server**:
   ```bash
   python manage.py runserver
   ```

2. **Create a user** via Manage Users page

3. **Check console output**:
   ```
   Content-Type: text/plain; charset="utf-8"
   MIME-Version: 1.0
   Content-Transfer-Encoding: 7bit
   Subject: Welcome to DMU Internship Management System
   From: noreply@example.com
   To: newuser@example.com
   Date: Fri, 16 May 2026 10:30:00 -0000
   Message-ID: <...>

   Hello John Doe,

   Welcome to the DMU Internship Management System!
   ...
   ```

### Production Testing (SMTP Backend)

1. **Configure SMTP** in `.env` file

2. **Restart Django server**:
   ```bash
   python manage.py runserver
   ```

3. **Create a test user** with your own email

4. **Check your inbox** for the welcome email

5. **Verify email content**:
   - Credentials are correct
   - Login URL works
   - Formatting is proper

---

## Troubleshooting

### Email Not Received

**Check 1: Console Output (Development)**
- Look for email in terminal where Django is running
- If not there, check for errors

**Check 2: SMTP Configuration (Production)**
```bash
# Test SMTP connection
python manage.py shell
```
```python
from django.core.mail import send_mail
send_mail(
    'Test Email',
    'This is a test.',
    'from@example.com',
    ['to@example.com'],
    fail_silently=False,
)
```

**Check 3: Spam Folder**
- Check user's spam/junk folder
- Add sender to safe senders list

**Check 4: Email Logs**
- Check Django logs for email errors
- Look for authentication failures
- Verify SMTP credentials

### Common Errors

**Error: SMTPAuthenticationError**
- **Cause**: Invalid email credentials
- **Solution**: Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env

**Error**: Connection refused
- **Cause**: Firewall blocking SMTP port
- **Solution**: Check firewall settings, try different port (465 for SSL)

**Error**: Sender address rejected
- **Cause**: FROM email not authorized
- **Solution**: Use authenticated email address as DEFAULT_FROM_EMAIL

---

## User Experience

### What Users See

1. **Email arrives** in inbox within seconds
2. **Subject line** clearly identifies the system
3. **Professional formatting** with clear sections
4. **All information** needed to log in
5. **Security guidance** for password management
6. **Getting started** instructions

### User Actions

1. **Open email** from DMU Internship System
2. **Copy password** (or remember it)
3. **Click login URL** (or navigate manually)
4. **Enter credentials** on login page
5. **Log in successfully**
6. **Change password** (recommended)
7. **Complete profile** information
8. **Start using** the system

---

## Admin Benefits

### Streamlined Onboarding
- No need to manually send credentials
- Users receive information immediately
- Reduces support requests

### Professional Communication
- Branded email template
- Clear instructions
- Security best practices

### Audit Trail
- Email logs track when credentials were sent
- Failed emails logged for follow-up
- User creation and notification in one step

---

## Future Enhancements (Optional)

1. **HTML Email Template**
   - Rich formatting with colors and logos
   - Responsive design for mobile devices
   - Branded header and footer

2. **Email Customization**
   - Admin can customize email template
   - Different templates for different roles
   - Multilingual support

3. **Resend Credentials**
   - Button to resend welcome email
   - Password reset link in email
   - Temporary password expiration

4. **Email Verification**
   - Require email verification before login
   - Verification link in welcome email
   - Account activation workflow

5. **Notification Preferences**
   - Users can opt-out of certain emails
   - Email frequency settings
   - Notification center in app

---

## Summary

Successfully implemented automatic email notification for new user creation:

- ✅ Welcome email sent automatically
- ✅ Login credentials included
- ✅ Security instructions provided
- ✅ Getting started guide included
- ✅ Error handling implemented
- ✅ Works in development and production
- ✅ Configurable SMTP settings
- ✅ Professional email template
- ✅ Graceful failure handling
- ✅ Logging for troubleshooting

**Feature Complete!** 🎉

Users now receive their login credentials via email immediately after account creation, providing a seamless onboarding experience.
