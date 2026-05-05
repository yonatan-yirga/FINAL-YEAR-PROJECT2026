"""
Test Email Configuration
Run this script to test if SMTP email sending works
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    """Test sending an email"""
    print("=" * 60)
    print("TESTING EMAIL CONFIGURATION")
    print("=" * 60)
    
    print(f"\nEmail Backend: {settings.EMAIL_BACKEND}")
    print(f"Email Host: {settings.EMAIL_HOST}")
    print(f"Email Port: {settings.EMAIL_PORT}")
    print(f"Email Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"Email Host User: {settings.EMAIL_HOST_USER}")
    print(f"Email Host Password: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
    print(f"Default From Email: {settings.DEFAULT_FROM_EMAIL}")
    
    print("\n" + "=" * 60)
    print("SENDING TEST EMAIL...")
    print("=" * 60)
    
    try:
        result = send_mail(
            subject='Test Email from Internship System',
            message='This is a test email to verify SMTP configuration is working correctly.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send to yourself
            fail_silently=False,
        )
        
        if result == 1:
            print("\n✅ SUCCESS! Email sent successfully!")
            print(f"Email sent to: {settings.EMAIL_HOST_USER}")
        else:
            print("\n❌ FAILED! Email was not sent.")
            
    except Exception as e:
        print(f"\n❌ ERROR! Failed to send email:")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        
        # Common error solutions
        print("\n" + "=" * 60)
        print("TROUBLESHOOTING TIPS:")
        print("=" * 60)
        print("1. Check if EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are set in .env")
        print("2. For Gmail, use an App Password (not your regular password)")
        print("   - Go to: https://myaccount.google.com/apppasswords")
        print("   - Generate a new app password")
        print("   - Use that password in EMAIL_HOST_PASSWORD")
        print("3. Make sure 'Less secure app access' is enabled (if not using App Password)")
        print("4. Check if your firewall/antivirus is blocking port 587")
        print("5. Try using port 465 with EMAIL_USE_SSL=True instead of TLS")

if __name__ == '__main__':
    test_email()
