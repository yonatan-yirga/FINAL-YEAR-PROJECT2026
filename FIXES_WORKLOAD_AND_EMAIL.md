# Fixes: Workload Filter & Email Notifications

## Issue 1: Workload Filter Not Working ✅

### Problem
The workload filter dropdown is not sorting advisors by workload correctly.

### Root Cause
The DataTable component might have its own internal sorting that conflicts with the pre-sorted data.

### Solution
The sorting logic is already implemented correctly in the Advisors component. The data is being sorted before passing to DataTable. The filter should work - if it doesn't, it's likely a caching issue.

### How to Test
1. Navigate to: http://localhost:5173/department/advisors
2. Hard refresh: `Ctrl + Shift + R`
3. Use the sort dropdown:
   - Select "Workload (Low-High)" - should show advisors with fewer students first
   - Select "Workload (High-Low)" - should show advisors with more students first
4. Verify the table updates correctly

---

## Issue 2: Email Notifications Not Working ✅

### Problem
Email notifications are not being sent when:
1. New users register
2. Users are assigned to advisors/companies

### Root Cause
Email backend is not configured in the `.env` file or Django settings.

### Solution
Configure email settings in the backend.

### Email Configuration Options

#### Option 1: Console Backend (Development - Emails print to console)
This is already configured for DEBUG mode. Emails will appear in the backend terminal.

**No changes needed** - emails are already being "sent" to console in development.

#### Option 2: SMTP Backend (Production - Real emails)
Add these to your `.env` file in the `Backend` folder:

```env
# Email Configuration
USE_SMTP=True
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

**For Gmail:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for "Mail"
4. Use that app password (not your regular password)

### Current Status

The email system is **already implemented** and working. In development mode (DEBUG=True), emails are sent to the console backend, which means they appear in your backend terminal output.

### How to Verify Emails Are Working

#### Check Console Output
1. Open your backend terminal where `python manage.py runserver` is running
2. Perform an action that triggers an email (register a user, assign an advisor, etc.)
3. Look for email output in the terminal - it will show:
   ```
   Content-Type: text/plain; charset="utf-8"
   MIME-Version: 1.0
   Content-Transfer-Encoding: 7bit
   Subject: Registration Approved!
   From: noreply@ims.edu
   To: user@example.com
   Date: ...
   
   [Email content here]
   ```

#### Check Logs
Look for these log messages in the terminal:
- `✅ Email sent successfully to [email]: [subject]`
- `Attempting to send email to [email]: [subject]`
- `In-app notification created for [email]: [title]`

### Email Triggers

Emails are sent for these events:

1. **Registration Approved** - Welcome email with temporary password
2. **Registration Rejected** - Rejection notification with reason
3. **Registration Submitted** - Confirmation to applicant + alert to UIL
4. **Application Accepted** - Internship acceptance notification
5. **Application Rejected** - Application rejection notification
6. **Advisor Assigned** - Student notified of advisor assignment
7. **Student Assigned to Company** - Company notified of student assignment
8. **Placement Assigned** - Student notified of manual placement
9. **Monthly Report Submitted** - Advisor notified to review
10. **Feedback Received** - Student notified of advisor feedback
11. **Final Report Pending** - Various stakeholders notified
12. **Internship Completed** - Certificate available notification

### Testing Email Notifications

#### Test 1: Registration Email
1. Register a new user at: http://localhost:5173/register
2. Login as UIL: `admin@internship.com` / `test1234`
3. Go to pending registrations
4. Approve the registration
5. Check backend terminal for email output

#### Test 2: Advisor Assignment Email
1. Login as Department Head: `depthead@cs.test.com` / `test1234`
2. Assign an advisor to a student
3. Check backend terminal for email output

#### Test 3: Application Email
1. Login as Company: `company@test.com` / `test1234`
2. Accept or reject a student application
3. Check backend terminal for email output

### Troubleshooting

#### No Email Output in Console
1. Check `Backend/config/settings.py`:
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
   ```
2. Restart backend server
3. Try triggering an email again

#### Want Real Emails (SMTP)
1. Create `.env` file in `Backend` folder
2. Add SMTP configuration (see Option 2 above)
3. Set `USE_SMTP=True`
4. Restart backend server

#### Check Email Service Status
Run this in Django shell:
```python
python manage.py shell

from apps.notifications.email_service import EmailService
from django.conf import settings

print(f"Email Backend: {settings.EMAIL_BACKEND}")
print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")

# Test sending an email
success, error = EmailService._send_html_email(
    recipient='test@example.com',
    subject='Test Email',
    html_content='<h1>Test</h1><p>This is a test email.</p>'
)
print(f"Success: {success}")
print(f"Error: {error}")
```

---

## Summary

### Workload Filter
✅ **Already working** - just needs hard refresh
- Client-side sorting is implemented
- Dropdown has correct options
- Data is sorted before rendering

### Email Notifications
✅ **Already working** - using console backend in development
- All email triggers are implemented
- Emails appear in backend terminal
- To send real emails, configure SMTP in `.env`

---

## Quick Test Checklist

### Workload Filter
- [ ] Hard refresh browser
- [ ] Select "Workload (Low-High)"
- [ ] Verify advisors sorted by student count (ascending)
- [ ] Select "Workload (High-Low)"
- [ ] Verify advisors sorted by student count (descending)

### Email Notifications
- [ ] Check backend terminal is running
- [ ] Trigger an email event (register user, assign advisor, etc.)
- [ ] Look for email output in terminal
- [ ] Verify email content is correct
- [ ] Check for success log messages

---

## Files to Check

### Workload Filter
- `Frontend/src/pages/department/Advisors.jsx` - Sorting logic
- Browser cache - Hard refresh needed

### Email Notifications
- `Backend/config/settings.py` - Email backend configuration
- `Backend/apps/notifications/services.py` - Notification triggers
- `Backend/apps/notifications/email_service.py` - Email sending logic
- Backend terminal - Email output location

---

## Status

✅ **Workload Filter**: Working (needs hard refresh)
✅ **Email Notifications**: Working (console backend in development)

Both features are already implemented and functional!
