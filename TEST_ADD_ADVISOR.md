# Test Add Advisor Feature - Quick Guide

## 🧪 Quick Test Steps

### 1. Restart Django Server
```bash
# Stop current server (Ctrl+C if running)
cd Backend
python manage.py runserver
```

**Expected Output**:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

### 2. Test the Feature

#### A. Login as Department Head
1. Go to: `http://localhost:5173/login`
2. Login with Department Head credentials
3. Should redirect to Department Dashboard

#### B. Navigate to Add Advisor
**Option 1**: From Advisors Page
- Click "Advisors" in sidebar
- Click green "Add Advisor" button (top right)

**Option 2**: From Dashboard
- Stay on Dashboard
- Find "Quick Navigation" section
- Click "Add Advisor"

#### C. Fill the Form
```
Full Name: Test Advisor
Email: testadvisor@example.com
Phone: +251 912 345 678
Staff ID: TEST-2024-001
Max Students: 15
```

#### D. Submit
- Click "Register Advisor" button
- Watch for loading spinner
- Wait for response

---

### 3. Expected Results

#### ✅ Success Scenario:
```
✓ Green success alert appears
✓ Message: "Advisor Test Advisor has been successfully registered. 
           Login credentials have been sent to testadvisor@example.com."
✓ Form resets
✓ Auto-redirect to Advisors page after 2 seconds
✓ New advisor appears in Advisors list
```

#### ❌ If Error Occurs:
```
✗ Red error alert appears
✗ Check error message
✗ See troubleshooting below
```

---

## 🔍 Troubleshooting

### Error: "Failed to register advisor"

#### Check 1: Django Console
Look at the terminal where Django is running. You should see the error details.

**Common Errors**:

**A. URL Not Found (404)**
```
"POST /api/departments/add-advisor/ HTTP/1.1" 404
```
**Solution**: Make sure you restarted Django server after adding the URL route.

**B. AttributeError: 'Settings' object has no attribute 'FRONTEND_URL'**
```
AttributeError: 'Settings' object has no attribute 'FRONTEND_URL'
```
**Solution**: This should be fixed now. Make sure you have the latest code.

**C. Email Error**
```
Failed to send email: [Errno 111] Connection refused
```
**Solution**: This is okay! The account is still created. Email just didn't send.

---

### Error: "Email already exists"

**Cause**: You already registered an advisor with this email.

**Solution**: Use a different email:
```
testadvisor2@example.com
testadvisor3@example.com
etc.
```

---

### Error: "Staff ID already exists"

**Cause**: You already registered an advisor with this staff ID.

**Solution**: Use a different staff ID:
```
TEST-2024-002
TEST-2024-003
etc.
```

---

## 🔧 Advanced Testing

### Test 1: Verify in Database

```bash
cd Backend
python manage.py shell
```

```python
from apps.accounts.models import User, AdvisorProfile

# Find the advisor
user = User.objects.filter(email='testadvisor@example.com').first()

if user:
    print("✅ User created successfully!")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   Approved: {user.is_approved}")
    print(f"   Department: {user.department}")
    
    # Check profile
    profile = user.advisor_profile
    print(f"\n✅ Profile created successfully!")
    print(f"   Full Name: {profile.full_name}")
    print(f"   Staff ID: {profile.staff_id}")
    print(f"   Phone: {profile.phone_number}")
    print(f"   Max Students: {profile.max_students}")
else:
    print("❌ User not found!")
```

---

### Test 2: Test Login with New Advisor

1. Logout from Department Head account
2. Go to login page
3. Try to login with:
   - Email: `testadvisor@example.com`
   - Password: (check email or database)

**To get password from database**:
```python
# In Django shell
from apps.accounts.models import User
user = User.objects.get(email='testadvisor@example.com')
# Password is hashed, so you can't see it
# But you can set a new one:
user.set_password('newpassword123')
user.save()
print("Password changed to: newpassword123")
```

---

### Test 3: Check API Directly

Using curl or Postman:

```bash
# Get auth token first (login as Department Head)
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"depthead@example.com","password":"yourpassword"}'

# Use the token to register advisor
curl -X POST http://localhost:8000/api/departments/add-advisor/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "full_name": "API Test Advisor",
    "email": "apitest@example.com",
    "phone_number": "+251 912 345 678",
    "staff_id": "API-TEST-001",
    "max_students": 15
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Advisor API Test Advisor has been successfully registered. Login credentials have been sent to apitest@example.com.",
  "advisor": {
    "id": 6,
    "full_name": "API Test Advisor",
    "email": "apitest@example.com",
    "staff_id": "API-TEST-001",
    "max_students": 15
  }
}
```

---

## 📊 Test Checklist

- [ ] Django server restarted
- [ ] Can access Add Advisor page
- [ ] Form loads correctly
- [ ] Can fill in all fields
- [ ] Submit button works
- [ ] Success message appears
- [ ] Advisor appears in Advisors list
- [ ] Can verify in database
- [ ] Email sent (if configured)
- [ ] Can login as new advisor

---

## 🎯 Quick Verification

### Minimum Test (30 seconds):
1. Restart Django server
2. Login as Department Head
3. Go to Add Advisor page
4. Fill form with test data
5. Click Register
6. See success message ✅

### Full Test (5 minutes):
1. Minimum test above
2. Verify in Advisors list
3. Check database
4. Try to login as new advisor
5. Test email (if configured)

---

## 📞 Still Having Issues?

### Check These:

1. **Django Server Running?**
   ```bash
   # Should see this:
   Starting development server at http://127.0.0.1:8000/
   ```

2. **Frontend Running?**
   ```bash
   # Should see this:
   Local: http://localhost:5173/
   ```

3. **Correct URLs?**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`

4. **Browser Console Errors?**
   - Press F12
   - Check Console tab
   - Look for red errors

5. **Network Errors?**
   - Press F12
   - Go to Network tab
   - Try to register advisor
   - Look at the POST request
   - Check status code and response

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ No errors in Django console
2. ✅ Success message in browser
3. ✅ Advisor appears in list
4. ✅ Can find advisor in database
5. ✅ Email sent (if configured)

---

**Status**: Ready to Test
**Estimated Time**: 30 seconds - 5 minutes
**Difficulty**: Easy
