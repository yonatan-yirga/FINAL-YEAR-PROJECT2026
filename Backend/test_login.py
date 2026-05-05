import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
import requests

print("=" * 70)
print("Testing Login Endpoint")
print("=" * 70)

# Get user input
email = input("\nEnter email: ")
password = input("Enter password: ")

# Check if user exists
user = User.objects.filter(email=email).first()
if not user:
    print(f"\n❌ User '{email}' does not exist in database!")
    print("\nAvailable users:")
    for u in User.objects.all()[:10]:
        print(f"  - {u.email} ({u.role})")
    exit()

print(f"\n✅ User found: {user.email} ({user.role})")

# Test password
if user.check_password(password):
    print("✅ Password is correct in database!")
else:
    print("❌ Password is INCORRECT in database!")
    print("\nDo you want to reset password to 'test123'? (y/n)")
    if input().lower() == 'y':
        user.set_password('test123')
        user.save()
        print("✅ Password reset to 'test123'")
        password = 'test123'
    else:
        exit()

# Test API endpoint
print("\n" + "=" * 70)
print("Testing API Endpoint")
print("=" * 70)

url = 'http://localhost:8000/api/auth/login/'
data = {'email': email, 'password': password}

print(f"\nPOST {url}")
print(f"Data: {data}")

try:
    response = requests.post(url, json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ Login successful!")
        json_data = response.json()
        print(f"Token: {json_data.get('token', 'N/A')[:50]}...")
        print(f"User: {json_data.get('user', {})}")
    else:
        print("\n❌ Login failed!")
        print("This means the API endpoint is rejecting the login.")
        print("Let me check the login view...")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("Make sure the server is running on port 8000")
