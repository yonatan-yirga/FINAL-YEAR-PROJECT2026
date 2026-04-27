# Add Advisor Error Fix - Applied

## 🐛 Issue Reported
When registering an advisor, the system showed error: **"Failed to register advisor"**

## 🔍 Root Causes Found

### 1. Missing URL Route ❌
**Problem**: The `add-advisor` endpoint was not registered in the URLs file.

**Location**: `Backend/apps/departments/urls.py`

**Fix Applied**: ✅
```python
# Added this line:
path('add-advisor/', DepartmentViewSet.as_view({'post': 'add_advisor'}), name='department-add-advisor'),
```

### 2. Missing FRONTEND_URL Setting ❌
**Problem**: The code referenced `settings.FRONTEND_URL` which doesn't exist in Django settings.

**Location**: `Backend/apps/departments/views.py` (line ~1635)

**Fix Applied**: ✅
```python
# Changed from:
Please login at: {settings.FRONTEND_URL}/login

# Changed to:
try:
    frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
except (AttributeError, IndexError):
    frontend_url = 'http://localhost:5173'

Please login at: {frontend_url}/login
```

This matches the pattern used in other parts of the codebase (certificates, password reset, etc.)

---

## ✅ Fixes Applied

### Fix 1: Added URL Route
**File**: `Backend/apps/departments/urls.py`

```python
urlpatterns = [
    # ... existing routes ...
    
    # Advisor Assignment
    path('unassigned-students/', DepartmentViewSet.as_view({'get': 'unassigned_students'}), name='department-unassigned-students'),
    path('assign-advisor/', DepartmentViewSet.as_view({'post': 'assign_advisor'}), name='department-assign-advisor'),
    path('add-advisor/', DepartmentViewSet.as_view({'post': 'add_advisor'}), name='department-add-advisor'),  # ✅ ADDED
    
    # Company Assignment (Direct Placement)
    path('assign-company/', DepartmentViewSet.as_view({'post': 'assign_company'}), name='department-assign-company'),  # ✅ ADDED
    
    # ... rest of routes ...
]
```

### Fix 2: Fixed Frontend URL Reference
**File**: `Backend/apps/departments/views.py`

```python
# Send email with credentials
try:
    from django.core.mail import send_mail
    from django.conf import settings
    
    # Get frontend URL ✅ ADDED
    try:
        frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
    except (AttributeError, IndexError):
        frontend_url = 'http://localhost:5173'
    
    subject = 'Welcome to Internship Management System - Advisor Account Created'
    message = f"""
Dear {full_name},

Your advisor account has been created by the Department Head.

Login Credentials:
Email: {email}
Password: {password}

Please login at: {frontend_url}/login  # ✅ FIXED

After logging in, we recommend changing your password in the settings.

Best regards,
Internship Management System
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=True,
    )
except Exception as e:
    # Log error but don't fail the request
    print(f"Failed to send email: {str(e)}")
```

---

## 🧪 Testing Steps

### Step 1: Restart Django Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd Backend
python manage.py runserver
```

### Step 2: Test Add Advisor
1. Login as Department Head
2. Go to Advisors page
3. Click "Add Advisor" button
4. Fill in the form:
   - Full Name: "Test Advisor"
   - Email: "test@example.com"
   - Phone: "+251 912 345 678"
   - Staff ID: "TEST-001"
   - Max Students: 15
5. Click "Register Advisor"
6. Should see success message ✅

### Step 3: Verify in Database
```bash
cd Backend
python manage.py shell
```

```python
from apps.accounts.models import User, AdvisorProfile

# Check if user was created
user = User.objects.filter(email='test@example.com').first()
print(f"User created: {user}")
print(f"Role: {user.role}")
print(f"Approved: {user.is_approved}")

# Check if profile was created
profile = AdvisorProfile.objects.filter(user=user).first()
print(f"Profile created: {profile}")
print(f"Full name: {profile.full_name}")
print(f"Staff ID: {profile.staff_id}")
```

### Step 4: Check Email (if configured)
- Check the email inbox for test@example.com
- Should receive welcome email with credentials
- If email not configured, that's okay - account is still created

---

## 🔧 Additional Fixes Made

### Also Fixed: Assign Company Route
While fixing the add-advisor route, I also added the missing `assign-company` route which was implemented but not registered in URLs.

---

## 📊 What Should Work Now

### ✅ Add Advisor Feature:
1. Department Head can access `/department/add-advisor`
2. Form submits to correct endpoint
3. Backend validates data
4. User account created
5. Advisor profile created
6. Email sent (if configured)
7. Success message displayed
8. Redirect to Advisors page

### ✅ Assign Company Feature:
1. Department Head can access `/department/assign-company`
2. Can select student and company
3. Backend creates application
4. Notifications sent
5. Success message displayed

---

## 🚨 If Still Getting Errors

### Check 1: Django Server Running?
```bash
# Make sure server is running
cd Backend
python manage.py runserver
```

### Check 2: Check Console for Errors
Look at the Django console output for any error messages.

### Check 3: Check Browser Console
Open browser DevTools (F12) and check Console tab for errors.

### Check 4: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to register advisor
4. Look for the POST request to `/api/departments/add-advisor/`
5. Check the response status and error message

### Check 5: Verify Backend URL
Make sure frontend is pointing to correct backend URL:
- Check `Frontend/src/services/api.js`
- Should be: `http://localhost:8000/api/`

---

## 📝 Error Messages and Solutions

### Error: "Failed to register advisor"
**Cause**: Generic error from backend
**Solution**: Check Django console for detailed error message

### Error: "404 Not Found"
**Cause**: URL route not registered
**Solution**: ✅ Fixed - route added to urls.py

### Error: "500 Internal Server Error"
**Cause**: Backend code error
**Solution**: Check Django console for stack trace

### Error: "Email already exists"
**Cause**: Email is already registered
**Solution**: Use a different email address

### Error: "Staff ID already exists"
**Cause**: Staff ID is already in use
**Solution**: Use a different staff ID

---

## 🎯 Summary

### Problems Found:
1. ❌ Missing URL route for `add-advisor`
2. ❌ Missing URL route for `assign-company`
3. ❌ Invalid `settings.FRONTEND_URL` reference

### Fixes Applied:
1. ✅ Added `add-advisor` URL route
2. ✅ Added `assign-company` URL route
3. ✅ Fixed frontend URL to use `CORS_ALLOWED_ORIGINS[0]`

### Files Modified:
1. `Backend/apps/departments/urls.py` (added 2 routes)
2. `Backend/apps/departments/views.py` (fixed frontend URL)

### Next Steps:
1. Restart Django server
2. Test add advisor feature
3. Should work now! ✅

---

## 📞 Support

If you still encounter issues after applying these fixes:

1. **Check Django Console**: Look for detailed error messages
2. **Check Browser Console**: Look for JavaScript errors
3. **Check Network Tab**: Look at API request/response
4. **Verify Server Running**: Make sure Django is running on port 8000
5. **Clear Browser Cache**: Try hard refresh (Ctrl+Shift+R)

---

**Status**: ✅ Fixes Applied
**Date**: 2026-04-27
**Files Modified**: 2
**Ready to Test**: Yes
