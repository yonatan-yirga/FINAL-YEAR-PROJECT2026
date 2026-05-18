# Fix: "Failed to fetch overloaded advisors" Error

## Problem
The error "Failed to fetch overloaded advisors" occurs because the Django backend server needs to be restarted to pick up the new code changes.

## ✅ Verification Complete
All endpoints are properly configured:
- ✓ Methods exist in `DepartmentViewSet`
- ✓ URL patterns registered
- ✓ Endpoints callable and return correct data

## Solution: Restart Django Server

### Step 1: Stop Current Server
In the terminal running the Django server, press:
```
Ctrl + C
```

### Step 2: Restart Server
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### Step 3: Verify Server is Running
You should see:
```
Django version X.X.X, using settings 'config.settings'
Starting development server at http://0.0.0.0:8000/
Quit the server with CTRL-BREAK.
```

### Step 4: Test the Frontend
1. Go to: `http://localhost:5173/department/advisor-overload`
2. The page should now load successfully
3. You should see three panels (Overloaded, Students, Available)

## Alternative: Quick Test

If you want to verify the backend is working before testing the frontend:

```bash
cd Backend
python test_overload_endpoint.py
```

You should see all green checkmarks (✓).

## What Was Fixed

1. **Added 3 new URL patterns** in `Backend/apps/departments/urls.py`:
   - `advisors/overloaded/` → `overloaded_advisors`
   - `advisors/available/` → `available_advisors`
   - `advisors/reassign/` → `reassign_students`

2. **Added 3 new methods** in `Backend/apps/departments/views.py`:
   - `overloaded_advisors()` - Lists advisors exceeding capacity
   - `available_advisors()` - Lists advisors with available capacity
   - `reassign_students()` - Reassigns students between advisors

## Troubleshooting

### Still Getting Error After Restart?

1. **Check Backend Logs:**
   Look for any error messages in the terminal running Django

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any error messages

3. **Verify Authentication:**
   - Make sure you're logged in as a Department Head
   - Check that your JWT token is valid

4. **Check Network Tab:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Look for the request to `/api/departments/advisors/overloaded/`
   - Check the response status and error message

### Common Issues

**Issue:** 403 Forbidden
**Solution:** Make sure you're logged in as a Department Head

**Issue:** 404 Not Found
**Solution:** Verify the backend server is running on port 8000

**Issue:** 500 Internal Server Error
**Solution:** Check backend logs for Python errors

## Success Indicators

When everything is working, you should see:

1. **Backend Terminal:**
   ```
   [15/May/2026 10:30:00] "GET /api/departments/advisors/overloaded/ HTTP/1.1" 200 1234
   ```

2. **Frontend:**
   - Three panels visible
   - No error messages
   - Advisors listed (if any are overloaded)

## Need More Help?

Run the diagnostic script:
```bash
cd Backend
python test_overload_endpoint.py
```

This will show you exactly what's working and what's not.

---

**TL;DR:** Just restart the Django server with `python manage.py runserver 0.0.0.0:8000` and it should work! 🚀
