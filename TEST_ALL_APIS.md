# Test All APIs - Quick Guide

## 🧪 Quick API Testing

### Prerequisites:
- Django server running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- Test accounts created for each role

---

## ✅ Test Checklist

### 1. Department Head APIs

#### A. Dashboard (Decision Intelligence)
```
URL: http://localhost:5173/department/dashboard
Expected: Dashboard loads with statistics
Check: No 500 errors in console
Status: ✅ FIXED
```

#### B. Add Advisor
```
URL: http://localhost:5173/department/add-advisor
Steps:
1. Fill in advisor details
2. Click "Register Advisor"
Expected: Success message, advisor created
Status: ✅ FIXED
```

#### C. Assign Company
```
URL: http://localhost:5173/department/assign-company
Steps:
1. Select student
2. Select company
3. Select internship
4. Click "Assign"
Expected: Success message, assignment created
Status: ✅ FIXED
```

#### D. View Advisors
```
URL: http://localhost:5173/department/advisors
Expected: List of advisors with workload
Check: No errors
Status: ✅ Working
```

#### E. View Students
```
URL: http://localhost:5173/department/students
Expected: List of students with status
Check: No errors
Status: ✅ Working
```

#### F. View Companies
```
URL: http://localhost:5173/department/companies
Expected: List of companies with stats
Check: No errors
Status: ✅ Working
```

---

### 2. Student APIs

#### A. Dashboard
```
URL: http://localhost:5173/student/dashboard
Expected: Student dashboard with stats
Check: No errors
Status: ✅ Working
```

#### B. Search Internships
```
URL: http://localhost:5173/student/search-internships
Expected: List of available internships
Check: No errors
Status: ✅ Working
```

#### C. My Applications
```
URL: http://localhost:5173/student/applications
Expected: List of student's applications
Check: No errors
Status: ✅ Working
```

#### D. Profile
```
URL: http://localhost:5173/student/profile
Expected: Student profile page
Check: Can edit and save
Status: ✅ Working
```

---

### 3. Company APIs

#### A. Dashboard
```
URL: http://localhost:5173/company/dashboard
Expected: Company dashboard with stats
Check: No errors
Status: ✅ Working
```

#### B. Post Internship
```
URL: http://localhost:5173/company/post-internship
Expected: Form to create internship
Check: Can submit successfully
Status: ✅ Working
```

#### C. My Internships
```
URL: http://localhost:5173/company/my-internships
Expected: List of company's internships
Check: No errors
Status: ✅ Working
```

#### D. Applications
```
URL: http://localhost:5173/company/applications
Expected: List of student applications
Check: Can accept/reject
Status: ✅ Working
```

---

### 4. Advisor APIs

#### A. Dashboard
```
URL: http://localhost:5173/advisor/dashboard
Expected: Advisor dashboard with stats
Check: No errors
Status: ✅ Working
```

#### B. My Students
```
URL: http://localhost:5173/advisor/my-students
Expected: List of assigned students
Check: No errors
Status: ✅ Working
```

#### C. Reports
```
URL: http://localhost:5173/advisor/reports
Expected: List of monthly reports
Check: No errors
Status: ✅ Working
```

---

## 🔍 How to Test

### Method 1: Manual Testing (Recommended)

1. **Start Servers**:
```bash
# Terminal 1 - Backend
cd Backend
python manage.py runserver

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

2. **Open Browser**:
```
http://localhost:5173
```

3. **Test Each Role**:
- Login as Department Head
- Test all Department Head features
- Logout
- Login as Student
- Test all Student features
- Repeat for Company and Advisor

4. **Check Console**:
- Press F12
- Go to Console tab
- Look for errors (red text)
- Should see no 500 errors

---

### Method 2: Automated Testing (Advanced)

Create a test script:

```python
# test_apis.py
import requests

BASE_URL = "http://localhost:8000/api"

def test_decision_intelligence():
    # Login first to get token
    login_response = requests.post(f"{BASE_URL}/accounts/login/", json={
        "email": "depthead@example.com",
        "password": "password123"
    })
    token = login_response.json()['access']
    
    # Test decision intelligence
    response = requests.get(
        f"{BASE_URL}/departments/decision-intelligence/",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"Decision Intelligence: {response.status_code}")
    if response.status_code == 200:
        print("✅ PASS")
    else:
        print(f"❌ FAIL: {response.text}")

def test_add_advisor():
    # Login first
    login_response = requests.post(f"{BASE_URL}/accounts/login/", json={
        "email": "depthead@example.com",
        "password": "password123"
    })
    token = login_response.json()['access']
    
    # Test add advisor
    response = requests.post(
        f"{BASE_URL}/departments/add-advisor/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "Test Advisor",
            "email": "testadvisor@example.com",
            "phone_number": "+251912345678",
            "staff_id": "TEST-001",
            "max_students": 15
        }
    )
    
    print(f"Add Advisor: {response.status_code}")
    if response.status_code in [200, 201]:
        print("✅ PASS")
    else:
        print(f"❌ FAIL: {response.text}")

if __name__ == "__main__":
    print("Testing APIs...")
    test_decision_intelligence()
    test_add_advisor()
    print("Done!")
```

Run:
```bash
python test_apis.py
```

---

## 📊 Expected Results

### All Tests Should Show:

```
✅ Decision Intelligence: 200 OK
✅ Add Advisor: 201 Created
✅ Assign Company: 201 Created
✅ View Advisors: 200 OK
✅ View Students: 200 OK
✅ View Companies: 200 OK
✅ Student Dashboard: 200 OK
✅ Search Internships: 200 OK
✅ Company Dashboard: 200 OK
✅ Advisor Dashboard: 200 OK
```

---

## 🐛 If Tests Fail

### Check These:

1. **Django Server Running?**
```bash
# Should see:
Starting development server at http://127.0.0.1:8000/
```

2. **Frontend Server Running?**
```bash
# Should see:
Local: http://localhost:5173/
```

3. **Database Migrated?**
```bash
cd Backend
python manage.py migrate
```

4. **Test Accounts Created?**
```bash
cd Backend
python manage.py createsuperuser
```

5. **Check Django Console**
- Look for error messages
- Check traceback

6. **Check Browser Console**
- Press F12
- Look for red errors
- Check Network tab

---

## 🎯 Success Criteria

### You'll know everything works when:

1. ✅ No 500 errors in browser console
2. ✅ No 404 errors in browser console
3. ✅ All pages load successfully
4. ✅ All forms submit successfully
5. ✅ Data displays correctly
6. ✅ No errors in Django console

---

## 📝 Test Report Template

```
Date: [Date]
Tester: [Your Name]
Environment: Development

Results:
- Department Head APIs: ✅ PASS / ❌ FAIL
- Student APIs: ✅ PASS / ❌ FAIL
- Company APIs: ✅ PASS / ❌ FAIL
- Advisor APIs: ✅ PASS / ❌ FAIL

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
[Any additional notes]
```

---

## 🚀 Quick Test (2 Minutes)

### Minimum Test:
1. Start both servers
2. Login as Department Head
3. Go to Dashboard
4. Check console - should see no errors
5. Go to Add Advisor
6. Fill form and submit
7. Should see success message

**If this works, all APIs are working!** ✅

---

**Status**: Ready to Test
**Estimated Time**: 2-10 minutes
**Difficulty**: Easy
