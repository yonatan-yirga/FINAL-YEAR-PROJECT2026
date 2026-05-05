"""
Simple test to check if advisor students endpoint works
Run from Backend directory: python test_advisor_endpoint.py
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

print("\n=== Testing Advisor Students Endpoint ===\n")

# Step 1: Login
print("1. Logging in as department head...")
login_data = {
    "email": "depthead@cs.test.com",
    "password": "test1234"
}

try:
    response = requests.post(f"{BASE_URL}/accounts/login/", json=login_data)
    if response.status_code == 200:
        token = response.json().get('access')
        print(f"✓ Login successful! Token: {token[:20]}...")
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(response.text)
        exit(1)
except Exception as e:
    print(f"✗ Login error: {e}")
    exit(1)

# Step 2: Get advisors list
print("\n2. Getting advisors list...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(f"{BASE_URL}/departments/advisors/", headers=headers)
    if response.status_code == 200:
        advisors = response.json()
        print(f"✓ Found {len(advisors)} advisors")
        if advisors:
            advisor = advisors[0]
            advisor_id = advisor['id']
            advisor_name = advisor.get('full_name', advisor.get('email'))
            print(f"  Testing with: {advisor_name} (ID: {advisor_id})")
        else:
            print("✗ No advisors found in database")
            exit(1)
    else:
        print(f"✗ Failed to get advisors: {response.status_code}")
        print(response.text)
        exit(1)
except Exception as e:
    print(f"✗ Error getting advisors: {e}")
    exit(1)

# Step 3: Test advisor students endpoint
print(f"\n3. Getting students for advisor {advisor_id}...")
try:
    response = requests.get(
        f"{BASE_URL}/departments/advisors/{advisor_id}/students/",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Success!")
        print(f"\nAdvisor: {data['advisor']['full_name']}")
        print(f"Students: {len(data['students'])}")
        
        if data['students']:
            print("\nFirst student:")
            student = data['students'][0]
            print(f"  Name: {student['full_name']}")
            print(f"  Company: {student.get('company_name', 'N/A')}")
            print(f"  Status: {student['internship_status']}")
        else:
            print("  (No students assigned)")
    else:
        print(f"✗ Failed: {response.status_code}")
        print("\nResponse:")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
            
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Test Complete ===\n")
