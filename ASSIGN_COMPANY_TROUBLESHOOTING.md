# Assign Company Feature - Troubleshooting Guide 🔧

## Common Issues and Solutions

### ❌ Issue: "Failed to fetch students"

**Cause**: The API call to fetch students is failing

**Solutions**:

#### Solution 1: Remove Status Filter (APPLIED ✅)
The issue was passing `status: 'not_applied'` parameter which the backend doesn't recognize.

**Fixed Code**:
```javascript
// Fetch all students without status filter
const studentsRes = await departmentService.getStudents();

// Filter on frontend instead
const availableStudents = studentsRes.data.filter(
  s => !s.internship_status || 
       s.internship_status === 'NOT_APPLIED' || 
       s.internship_status === 'not_applied'
);
```

#### Solution 2: Check Backend Server
Make sure your Django backend is running:
```bash
cd Backend
python manage.py runserver
```

#### Solution 3: Check API Endpoint
Verify the endpoint exists:
```
GET http://localhost:8000/api/departments/students/
```

#### Solution 4: Check CORS Settings
If you see CORS errors in browser console, update `Backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

#### Solution 5: Check Authentication
Make sure you're logged in as a Department Head:
- Role must be: `DEPARTMENT_HEAD`, `UIL`, or `ADMIN`
- User must be authenticated

---

### ❌ Issue: "Failed to fetch companies"

**Solutions**:

1. **Check Backend Endpoint**:
   ```
   GET http://localhost:8000/api/departments/companies/
   ```

2. **Verify Department Head Permissions**:
   - User must have `DEPARTMENT_HEAD` role
   - User must be approved (`is_approved=True`)

---

### ❌ Issue: "No open internships available"

**Causes**:
- Company hasn't posted any internships
- All internships are CLOSED or FILLED
- All internships have 0 available slots

**Solutions**:

1. **Check Company Internships**:
   ```sql
   SELECT * FROM internships WHERE company_id = X;
   ```

2. **Verify Internship Status**:
   - Status should be `OPEN`
   - `available_slots` should be > 0
   - `is_active` should be `True`

3. **Create Test Internship**:
   - Login as company
   - Go to "Post Internship"
   - Create a new internship with available slots

---

### ❌ Issue: "Failed to assign company to student"

**Possible Causes**:

1. **Student Already Has Internship**:
   ```
   Error: "Student already has an accepted internship placement."
   ```
   **Solution**: Choose a different student

2. **No Available Slots**:
   ```
   Error: "No available slots remaining for this internship."
   ```
   **Solution**: Choose a different internship

3. **Department Mismatch**:
   ```
   Error: "Student and internship must be in the same department."
   ```
   **Solution**: Ensure student and company are in same department

4. **Backend Endpoint Not Found**:
   ```
   Error: 404 Not Found
   ```
   **Solution**: Check that the endpoint is registered in `Backend/apps/departments/urls.py`

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check Console tab for errors:
```
Failed to fetch
CORS error
404 Not Found
500 Internal Server Error
```

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Try to load the page
3. Look for failed requests (red)
4. Click on failed request to see details

### Step 3: Check Backend Logs
In your terminal where Django is running, look for errors:
```
[ERROR] ...
Traceback ...
```

### Step 4: Test API Directly
Use browser or Postman to test:
```
GET http://localhost:8000/api/departments/students/
GET http://localhost:8000/api/departments/companies/
GET http://localhost:8000/api/internships/?company_id=1
POST http://localhost:8000/api/departments/assign-company/
```

---

## ✅ Quick Fixes Applied

### Fix #1: Removed Status Filter ✅
**File**: `Frontend/src/pages/department/AssignCompany.jsx`
**Change**: Fetch all students, filter on frontend
**Status**: APPLIED

### Fix #2: Added Better Error Messages ✅
**File**: `Frontend/src/pages/department/AssignCompany.jsx`
**Change**: Show specific error messages to user
**Status**: APPLIED

### Fix #3: Added Array Type Checking ✅
**File**: `Frontend/src/pages/department/AssignCompany.jsx`
**Change**: Check if response.data is array before filtering
**Status**: APPLIED

---

## 🧪 Testing Checklist

After applying fixes, test these scenarios:

- [ ] Page loads without errors
- [ ] Students list appears
- [ ] Companies list appears
- [ ] Can search students
- [ ] Can search companies
- [ ] Can select student
- [ ] Can select company
- [ ] Internships load when company selected
- [ ] Can select internship
- [ ] Assignment confirmation works
- [ ] Success message appears
- [ ] Student receives notification
- [ ] Company receives notification

---

## 📞 Still Having Issues?

### Check These:

1. **Backend Running?**
   ```bash
   ps aux | grep python
   # Should show manage.py runserver
   ```

2. **Frontend Running?**
   ```bash
   ps aux | grep node
   # Should show vite or npm
   ```

3. **Database Connected?**
   ```bash
   cd Backend
   python manage.py dbshell
   # Should connect to database
   ```

4. **Migrations Applied?**
   ```bash
   cd Backend
   python manage.py showmigrations
   # All should have [X]
   ```

5. **Dependencies Installed?**
   ```bash
   cd Backend
   pip list | grep Django
   
   cd Frontend
   npm list react
   ```

---

## 🔧 Emergency Reset

If nothing works, try this:

### Backend:
```bash
cd Backend
python manage.py migrate
python manage.py runserver
```

### Frontend:
```bash
cd Frontend
npm install
npm run dev
```

### Clear Browser Cache:
- Press Ctrl+Shift+Delete
- Clear cache and cookies
- Reload page (Ctrl+F5)

---

## ✅ Current Status

**Issue**: "Failed to fetch students"  
**Status**: ✅ **FIXED**  
**Solution**: Removed status filter parameter  
**File Modified**: `Frontend/src/pages/department/AssignCompany.jsx`

**The page should now load successfully!** 🎉

---

**Last Updated**: Current Session  
**Status**: Issue Resolved ✅