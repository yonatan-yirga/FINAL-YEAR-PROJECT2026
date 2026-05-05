"""
Test Email System
Run this script to verify email notifications are working
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from apps.notifications.email_service import EmailService
from apps.accounts.models import User

print("=" * 80)
print("EMAIL SYSTEM TEST")
print("=" * 80)

# 1. Check Email Configuration
print("\n1. EMAIL CONFIGURATION:")
print(f"   Backend: {settings.EMAIL_BACKEND}")
print(f"   From Email: {settings.DEFAULT_FROM_EMAIL}")
print(f"   Debug Mode: {settings.DEBUG}")

if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
    print("   ✅ Using Console Backend (emails will print to terminal)")
elif settings.EMAIL_BACKEND.endswith('smtp.EmailBackend'):
    print("   ✅ Using SMTP Backend (real emails will be sent)")
    print(f"   Host: {settings.EMAIL_HOST}")
    print(f"   Port: {settings.EMAIL_PORT}")
    print(f"   TLS: {settings.EMAIL_USE_TLS}")
    print(f"   User: {settings.EMAIL_HOST_USER}")
else:
    print(f"   ⚠️  Unknown backend: {settings.EMAIL_BACKEND}")

# 2. Test Email Sending
print("\n2. TESTING EMAIL SEND:")
print("   Sending test email...")

test_email = "test@example.com"
success, error = EmailService._send_html_email(
    recipient=test_email,
    subject='Test Email from Internship Management System',
    html_content='''
    <html>
        <body>
            <h1>Test Email</h1>
            <p>This is a test email to verify the email system is working.</p>
            <p>If you see this in your terminal (console backend) or inbox (SMTP backend), the system is working!</p>
        </body>
    </html>
    '''
)

if success:
    print(f"   ✅ Email sent successfully to {test_email}")
    if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
        print("   📧 Check the output above for the email content")
else:
    print(f"   ❌ Failed to send email: {error}")

# 3. Check Users for Testing
print("\n3. AVAILABLE TEST USERS:")
users = User.objects.filter(is_active=True).order_by('role')[:5]
for user in users:
    print(f"   • {user.email} ({user.role})")

# 4. Test Registration Approved Email
print("\n4. TESTING REGISTRATION APPROVED EMAIL:")
test_user = User.objects.filter(role='STUDENT', is_active=True).first()
if test_user:
    print(f"   Sending to: {test_user.email}")
    success, error = EmailService.send_registration_approved_email(
        user=test_user,
        temp_password='test1234'
    )
    if success:
        print("   ✅ Registration approved email sent")
    else:
        print(f"   ❌ Failed: {error}")
else:
    print("   ⚠️  No student user found for testing")

# 5. Test Advisor Assignment Email
print("\n5. TESTING ADVISOR ASSIGNMENT EMAIL:")
student = User.objects.filter(role='STUDENT', is_active=True).first()
advisor = User.objects.filter(role='ADVISOR', is_active=True).first()

if student and advisor:
    print(f"   Student: {student.email}")
    print(f"   Advisor: {advisor.email}")
    success, error = EmailService.send_advisor_assigned_email(
        student=student,
        advisor=advisor
    )
    if success:
        print("   ✅ Advisor assignment email sent")
    else:
        print(f"   ❌ Failed: {error}")
else:
    print("   ⚠️  No student or advisor found for testing")

# Summary
print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
print("\nNEXT STEPS:")
if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
    print("✅ Console backend is working - emails appear in terminal")
    print("📧 To send real emails, configure SMTP in .env file:")
    print("   USE_SMTP=True")
    print("   EMAIL_HOST=smtp.gmail.com")
    print("   EMAIL_HOST_USER=your-email@gmail.com")
    print("   EMAIL_HOST_PASSWORD=your-app-password")
else:
    print("✅ SMTP backend is configured")
    print("📧 Check your inbox for test emails")

print("\n" + "=" * 80)
