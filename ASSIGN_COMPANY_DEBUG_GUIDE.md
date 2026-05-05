# 🔧 Assign Company - Internship Loading Debug Guide

## 🎯 Issue

When clicking on a company in the "Assign Company to Student" page, internships are not loading and showing error:
```
"Failed to fetch internships: undefined"
```

---

## 🔍 What I Added

### Enhanced Debugging Logs

The code now includes detailed console logs to help identify the issue:

```javascript
console.log('🔍 Fetching internships for company ID:', companyId);
console.log('📦 Full API response:', response);
console.log('📦 Response.data:', response.data);
console.log('📦 Response.success:', response.success);
```

---

## 🚀 How to Debug

### Step 1: Open Browser Console

1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Clear the console (click the 🚫 icon)

### Step 2: Reproduce the Issue

1. Login as Department Head: `depthead@cs.test.com` / `test1234`
2. Go to "Assign Company to Student"
3. Select a student
4. Click on a company (e.g., "navigated.tec")

### Step 3: Check Console Logs

Look for these log messages:

#### Expected Logs:
```
🔍 Fetching internships for company ID: 123
📦 Full API response: {success: true, data: [...]}
📦 Response.data: [...]
📦 Response.success: true
✅ Data is array, length: 3
📋 Final internship data: [...]
```

#### If Error Occurs:
```
❌ API returned success=false: [error message]
```
or
```
❌ Exception while fetching internships: [error details]
```

---

## 🔍 Common Issues & Solutions

### Issue 1: API Returns Empty Array

**Symptoms:**
```
✅ Data is array, length: 0
```

**Cause:** Company has no internships in the database

**Solution:**
1. Login as the company
2. Create an internship posting
3. Try again

### Issue 2: API Returns 403 Forbidden

**Symptoms:**
```
❌ API returned success=false: Forbidden
```

**Cause:** Department Head doesn't have permission to view internships

**Solution:**
1. Check if Department Head is in the same department as the company
2. Check backend permissions in `Backend/apps/internships/views.py`

### Issue 3: API Returns 404 Not Found

**Symptoms:**
```
❌ Exception while fetching internships: 404
```

**Cause:** API endpoint doesn't exist or URL is wrong

**Solution:**
1. Check if backend is running: `http://localhost:8000/api/internships/`
2. Verify the URL in `Frontend/src/services/internshipService.js`

### Issue 4: Company ID is Undefined

**Symptoms:**
```
🔍 Fetching internships for company ID: undefined
```

**Cause:** Company object doesn't have an `id` field

**Solution:**
1. Check the company data structure
2. Verify `selectedCompany.id` exists

### Issue 5: Response Format Unexpected

**Symptoms:**
```
⚠️ Unexpected response format: object {...}
```

**Cause:** API returns data in a different format

**Solution:**
1. Check the console log for the actual response structure
2. Update the response handling code to match

---

## 🔧 Manual API Test

### Test the API Directly

Open a new browser tab and test the API:

```
http://localhost:8000/api/internships/?company_id=123
```

Replace `123` with the actual company ID.

**Expected Response:**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Software Developer Intern",
      "description": "...",
      "required_skills": "Python, Django",
      "location": "Addis Ababa",
      "duration_months": 3,
      "start_date": "2025-01-15",
      "available_slots": 5,
      "status": "OPEN"
    }
  ]
}
```

---

## 🔍 Check Backend Logs

### View Django Server Logs

In the terminal where the backend is running, look for:

```
GET /api/internships/?company_id=123
[timestamp] "GET /api/internships/?company_id=123 HTTP/1.1" 200 1234
```

**Status Codes:**
- `200` - Success ✅
- `403` - Forbidden (permission issue) ❌
- `404` - Not Found (endpoint doesn't exist) ❌
- `500` - Server Error (backend crash) ❌

---

## 🔧 Quick Fixes

### Fix 1: Restart Backend

Sometimes the backend needs a restart:

```bash
# Stop backend (Ctrl+C)
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### Fix 2: Hard Refresh Frontend

Clear browser cache:

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Fix 3: Check Authentication

Make sure you're logged in:

1. Check browser DevTools > Application > Local Storage
2. Look for `token` or `auth_token`
3. If missing, login again

### Fix 4: Check Company ID

In the console, check the company object:

```javascript
console.log('Selected company:', selectedCompany);
console.log('Company ID:', selectedCompany?.id);
```

---

## 📊 Response Format Handling

The code now handles multiple response formats:

### Format 1: Direct Array
```json
[
  { "id": 1, "title": "..." },
  { "id": 2, "title": "..." }
]
```

### Format 2: Paginated (DRF)
```json
{
  "count": 2,
  "results": [
    { "id": 1, "title": "..." },
    { "id": 2, "title": "..." }
  ]
}
```

### Format 3: Nested Data
```json
{
  "data": [
    { "id": 1, "title": "..." },
    { "id": 2, "title": "..." }
  ]
}
```

---

## 🎯 Next Steps

### If Logs Show Success But No Internships Display:

1. Check if `internships` state is being set:
   ```javascript
   console.log('Internships state:', internships);
   ```

2. Check if the render condition is correct:
   ```javascript
   console.log('Internships length:', internships.length);
   ```

3. Check for React rendering issues

### If API Call Fails:

1. Check network tab in DevTools
2. Look for the API request
3. Check request headers (Authorization token)
4. Check response status and body

### If Company ID is Wrong:

1. Check how companies are fetched
2. Verify company data structure
3. Check if `id` field exists in company object

---

## 📝 Checklist

Before reporting an issue, check:

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 5173
- [ ] Logged in as Department Head
- [ ] Browser console is open
- [ ] Network tab is recording
- [ ] Backend terminal is visible
- [ ] Company has internships in database
- [ ] Department Head is in same department as company

---

## 🆘 Still Not Working?

### Collect This Information:

1. **Console Logs:**
   - Copy all logs starting with 🔍, 📦, ✅, or ❌

2. **Network Request:**
   - Open DevTools > Network tab
   - Find the `/api/internships/` request
   - Copy Request URL, Headers, and Response

3. **Backend Logs:**
   - Copy the last 20 lines from backend terminal

4. **Company Data:**
   - Copy the company object from console:
     ```javascript
     console.log(JSON.stringify(selectedCompany, null, 2));
     ```

---

**Status:** Debug mode enabled with detailed logging
**Action:** Follow the steps above to identify the issue
**Result:** Detailed logs will show exactly what's happening! 🔍

