# Quick Test: Page Refresh Fix

## Test Credentials
- **Student**: `student@test.com` / `test1234`
- **Advisor**: `advisor@test.com` / `test1234`
- **Department Head**: `depthead@cs.test.com` / `test1234`
- **Admin**: `admin@internship.com` / `test1234`

## Test Steps

### Test 1: Basic Refresh (2 minutes)
```
1. Go to http://localhost:5173/login
2. Login with student@test.com / test1234
3. Wait for dashboard to load
4. Press Ctrl + Shift + R (hard refresh)
5. ✅ Expected: Dashboard loads (NOT login page)
```

### Test 2: Different Pages (5 minutes)
```
1. Login as student
2. Go to /student/search-internships
3. Hard refresh (Ctrl + Shift + R)
4. ✅ Expected: Search page loads

5. Go to /student/applications
6. Hard refresh
7. ✅ Expected: Applications page loads

8. Go to /student/profile
9. Hard refresh
10. ✅ Expected: Profile page loads
```

### Test 3: Different Roles (5 minutes)
```
1. Logout
2. Login as advisor@test.com / test1234
3. Go to /advisor/my-students
4. Hard refresh
5. ✅ Expected: My Students page loads

6. Logout
7. Login as depthead@cs.test.com / test1234
8. Go to /department/advisors
9. Hard refresh
10. ✅ Expected: Advisors page loads

11. Logout
12. Login as admin@internship.com / test1234
13. Go to /admin/dashboard
14. Hard refresh
15. ✅ Expected: Admin dashboard loads
```

### Test 4: Offline Simulation (3 minutes)
```
1. Login as student
2. Go to /student/dashboard
3. Open DevTools (F12)
4. Go to Network tab
5. Set throttling to "Offline"
6. Hard refresh (Ctrl + Shift + R)
7. ✅ Expected: Dashboard loads with cached data
8. Restore network connection
9. ✅ Expected: Page continues to work
```

### Test 5: Multiple Tabs (3 minutes)
```
1. Open Tab 1: http://localhost:5173/login
2. Login as student
3. Go to /student/dashboard
4. Open Tab 2: http://localhost:5173/student/dashboard
5. Hard refresh Tab 2
6. ✅ Expected: Dashboard loads in Tab 2
7. Go back to Tab 1
8. Click Logout
9. Go to Tab 2
10. Hard refresh
11. ✅ Expected: Redirected to login page
```

## What to Look For

### ✅ Success Indicators
- Page loads without redirecting to login
- User data is displayed correctly
- No console errors
- Loading spinner appears briefly then disappears
- Page content loads quickly

### ❌ Failure Indicators
- Redirected to login page
- Blank page or 404 error
- Console shows authentication errors
- Loading spinner spins indefinitely
- Page takes very long to load

## Browser Console Check

Open DevTools (F12) and check Console tab:

### ✅ Good Messages
```
Auth initialization error: (none)
Token validation failed: (none)
Profile fetch failed: (none)
```

### ❌ Bad Messages
```
Auth initialization error: [error message]
Token validation failed: [error message]
Profile fetch failed: [error message]
```

## If Tests Fail

1. **Check localStorage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Check localStorage for `authToken` and `user`
   - Both should exist after login

2. **Check API Connection**:
   - Backend should be running on http://localhost:8000
   - Check Network tab in DevTools
   - API calls should return 200 status

3. **Check Console**:
   - Look for any error messages
   - Check for CORS errors
   - Check for 401/403 errors

4. **Restart Services**:
   - Restart backend: `python manage.py runserver 0.0.0.0:8000`
   - Restart frontend: `npm run dev`
   - Clear browser cache: Ctrl + Shift + Delete

## Expected Behavior Summary

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Refresh on dashboard | → Login page | → Dashboard ✅ |
| Refresh on any page | → Login page | → Same page ✅ |
| Offline refresh | → Login page | → Cached page ✅ |
| Network error | → Login page | → Stays logged in ✅ |
| After login | → Dashboard | → Original page ✅ |

## Time Estimate
- All tests: ~20 minutes
- Quick test (Test 1 only): ~2 minutes
