# Email Troubleshooting Guide

## ✅ Current Status

Your SMTP configuration is **WORKING CORRECTLY**! The test email was sent successfully.

```
✅ SUCCESS! Email sent successfully!
Email sent to: yonyir05@gmail.com
```

---

## 📧 Email Configuration

### Current Settings (.env)
```env
EMAIL_HOST_USER=yonyir05@gmail.com
EMAIL_HOST_PASSWORD=vkkzvwtgncpdbowx  # App Password
USE_SMTP=True
```

### Django Settings (config/settings.py)
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'yonyir05@gmail.com'
EMAIL_HOST_PASSWORD = '****************'
DEFAULT_FROM_EMAIL = 'yonyir05@gmail.com'
```

---

## 🔍 Testing Email Functionality

### Test 1: Basic SMTP Test
```bash
cd Backend
python test_email.py
```

**Expected Output:**
```
✅ SUCCESS! Email sent successfully!
```

### Test 2: Registration Email Test
1. Go to registration page: `http://localhost:5173/register`
2. Fill out the registration form
3. Submit the form
4. Check the backend console for logs:
   ```
   ✅ Registration notification sent for user@example.com
   ✅ Email sent successfully to user@example.com: Registration Received
   ```
5. Check your email inbox (including spam folder)

---

## 📝 Registration Email Flow

### When a User Registers

1. **User submits registration form**
   - Frontend sends POST to `/api/registrations/register/`

2. **Backend creates registration record**
   - `RegisterView.post()` is called
   - Registration saved to database

3. **Notification service is triggered**
   - `NotificationService.notify_registration_submitted()` is called
   - This sends TWO emails:

#### Email 1: Confirmation to Applicant
```python
EmailService.send_registration_received_email(
    registration.email,  # Applicant's email
    registration.get_request_type_display()  # STUDENT, COMPANY, etc.
)
```

**Subject:** "Registration Received - University Internship System"

**Content:**
- Thank you message
- Confirmation that registration was received
- Status: Pending Approval
- Expected review time: 1-2 business days

#### Email 2: Alert to UIL Office
```python
EmailService.send_new_registration_alert_to_uil(
    uil_user,  # Each UIL staff member
    registration  # Registration details
)
```

**Subject:** "New Registration Request: [Applicant Name]"

**Content:**
- New registration alert
- Applicant details
- Registration type
- Link to UIL dashboard

---

## 🐛 Common Issues & Solutions

### Issue 1: No Email Received

**Possible Causes:**
1. Email went to spam folder
2. Email address typo in registration form
3. Email service error (check logs)

**Solutions:**
1. **Check Spam Folder**
   - Look in spam/junk folder
   - Mark as "Not Spam" if found

2. **Check Backend Logs**
   ```bash
   # Look for these messages in console:
   ✅ Registration notification sent for user@example.com
   ✅ Email sent successfully to user@example.com
   
   # Or error messages:
   ❌ Failed to send email to user@example.com: [error]
   ```

3. **Verify Email Address**
   - Check if email was entered correctly
   - Check database: `SELECT email FROM registrations_registrationrequest;`

4. **Test Email Manually**
   ```bash
   cd Backend
   python test_email.py
   ```

### Issue 2: Gmail App Password Not Working

**Solutions:**
1. **Generate New App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Update `.env` file:
     ```env
     EMAIL_HOST_PASSWORD=your_new_app_password
     ```

2. **Enable 2-Factor Authentication**
   - App Passwords require 2FA to be enabled
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

3. **Check Gmail Settings**
   - Make sure IMAP is enabled
   - Go to Gmail Settings → Forwarding and POP/IMAP
   - Enable IMAP access

### Issue 3: Connection Timeout

**Solutions:**
1. **Check Firewall**
   - Allow outgoing connections on port 587
   - Temporarily disable firewall to test

2. **Try Different Port**
   Update `.env`:
   ```env
   EMAIL_PORT=465
   EMAIL_USE_TLS=False
   EMAIL_USE_SSL=True
   ```

3. **Check Network**
   - Test if port 587 is accessible:
     ```bash
     telnet smtp.gmail.com 587
     ```

### Issue 4: Authentication Failed

**Solutions:**
1. **Verify Credentials**
   - Double-check EMAIL_HOST_USER
   - Double-check EMAIL_HOST_PASSWORD
   - No spaces or extra characters

2. **Use App Password**
   - Don't use your regular Gmail password
   - Must use App Password

3. **Check Account Status**
   - Make sure Gmail account is active
   - Check for any security alerts

---

## 🔧 Debugging Steps

### Step 1: Check Environment Variables
```bash
cd Backend
python -c "from decouple import config; print('EMAIL_HOST_USER:', config('EMAIL_HOST_USER')); print('EMAIL_HOST_PASSWORD:', '*' * len(config('EMAIL_HOST_PASSWORD')))"
```

### Step 2: Check Django Settings
```bash
cd Backend
python manage.py shell
```
```python
from django.conf import settings
print('EMAIL_BACKEND:', settings.EMAIL_BACKEND)
print('EMAIL_HOST:', settings.EMAIL_HOST)
print('EMAIL_PORT:', settings.EMAIL_PORT)
print('EMAIL_USE_TLS:', settings.EMAIL_USE_TLS)
print('EMAIL_HOST_USER:', settings.EMAIL_HOST_USER)
print('DEFAULT_FROM_EMAIL:', settings.DEFAULT_FROM_EMAIL)
```

### Step 3: Test Email Sending
```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email',
    'This is a test.',
    settings.DEFAULT_FROM_EMAIL,
    ['your_email@example.com'],
    fail_silently=False,
)
```

### Step 4: Check Logs
```bash
# Backend console should show:
✅ Email sent successfully to user@example.com: Registration Received

# If you see errors:
❌ Failed to send email to user@example.com: [error message]
```

### Step 5: Test Registration Flow
```bash
# 1. Start backend
cd Backend
python manage.py runserver

# 2. Start frontend
cd Frontend
npm run dev

# 3. Register a new user
# 4. Check backend console for email logs
# 5. Check email inbox (and spam)
```

---

## 📊 Email Logging

### Enhanced Logging Added

The email service now includes detailed logging:

```python
# Before sending
logger.info(f'Attempting to send email to {recipient}: {subject}')

# On success
logger.info(f'✅ Email sent successfully to {recipient}: {subject}')

# On error
logger.error(f'❌ Failed to send email to {recipient}: {str(e)}')
logger.exception('Full email error traceback:')
```

### View Logs
```bash
# Backend console will show:
INFO - Attempting to send email to user@example.com: Registration Received
INFO - ✅ Email sent successfully to user@example.com: Registration Received
```

---

## 🎯 Quick Checklist

Before reporting an email issue, verify:

- [ ] SMTP test passes (`python test_email.py`)
- [ ] `.env` file has correct EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
- [ ] Gmail App Password is being used (not regular password)
- [ ] 2-Factor Authentication is enabled on Gmail
- [ ] Backend server is running
- [ ] No errors in backend console
- [ ] Checked spam folder
- [ ] Email address was entered correctly
- [ ] Firewall allows port 587
- [ ] Internet connection is working

---

## 📧 Email Types Sent

### 1. Registration Received (Applicant)
- **When:** User submits registration
- **To:** Applicant's email
- **Subject:** "Registration Received - University Internship System"

### 2. New Registration Alert (UIL)
- **When:** User submits registration
- **To:** All UIL staff
- **Subject:** "New Registration Request: [Name]"

### 3. Registration Approved
- **When:** UIL approves registration
- **To:** Applicant's email
- **Subject:** "Registration Approved - Welcome to IMS"
- **Includes:** Temporary password

### 4. Registration Rejected
- **When:** UIL rejects registration
- **To:** Applicant's email
- **Subject:** "Registration Update Required"
- **Includes:** Rejection reason

### 5. Application Accepted
- **When:** Company accepts student application
- **To:** Student's email
- **Subject:** "Internship Application Accepted"

### 6. Application Rejected
- **When:** Company rejects student application
- **To:** Student's email
- **Subject:** "Internship Application Update"

### 7. Advisor Assigned
- **When:** Advisor is assigned to student
- **To:** Student's email
- **Subject:** "Advisor Assigned to Your Internship"

### 8. Feedback Received
- **When:** Advisor provides feedback
- **To:** Student's email
- **Subject:** "New Feedback from Your Advisor"

### 9. Monthly Report Submitted
- **When:** Student submits monthly report
- **To:** Advisor's email
- **Subject:** "Monthly Report Submitted - [Student Name]"

### 10. Certificate Ready
- **When:** Certificate is generated
- **To:** Student's email
- **Subject:** "Certificate Ready — [Certificate ID]"

---

## 🚀 Production Recommendations

### 1. Use Professional Email Service
Consider using:
- **SendGrid** (99.9% deliverability)
- **Mailgun** (Developer-friendly)
- **Amazon SES** (Cost-effective)
- **Postmark** (Transactional emails)

### 2. Configure SPF/DKIM/DMARC
- Improves email deliverability
- Prevents emails from going to spam
- Authenticates your domain

### 3. Monitor Email Delivery
- Track sent emails
- Monitor bounce rates
- Check spam complaints
- Set up alerts for failures

### 4. Use Email Templates
- Consistent branding
- Easy to update
- Professional appearance

### 5. Implement Email Queue
- Use Celery for async email sending
- Retry failed emails
- Don't block HTTP requests

---

## 📞 Support

### If Emails Still Not Working

1. **Check Backend Console**
   - Look for error messages
   - Copy full error traceback

2. **Run Test Script**
   ```bash
   cd Backend
   python test_email.py
   ```

3. **Check Email Service Status**
   - Gmail status: https://www.google.com/appsstatus
   - Check for outages

4. **Contact Support**
   - Provide error messages
   - Include test results
   - Share configuration (without passwords!)

---

## ✅ Verification

Your email system is working! To verify:

1. ✅ SMTP test passed
2. ✅ Configuration is correct
3. ✅ App Password is valid
4. ✅ Enhanced logging added
5. ✅ Error handling improved

**Next Steps:**
1. Test registration flow
2. Check email inbox (and spam)
3. Monitor backend logs
4. Report any issues with full error messages

---

**Email System Status: ✅ WORKING**

The SMTP configuration is correct and emails are being sent successfully. If you're not receiving registration emails, check:
1. Spam folder
2. Email address spelling
3. Backend console logs
4. Run the test script

For any issues, check the backend console for detailed error messages with the enhanced logging now in place.
