# Internship Loading Debug Guide

## Issue
When clicking on a company in the Department Head "Assign Company" page, the internships are not loading and showing error: "Failed to fetch internships: undefined"

## Enhanced Debugging Added

### 1. Frontend Service Layer (`internshipService.js`)
Added comprehensive error handling:
- ✅ Logs all API calls with parameters
- ✅ Logs full response objects
- ✅ Handles different error types (server error, network error, request error)
- ✅ Provides detailed error messages instead of "undefined"

### 2. Frontend Component (`AssignCompany.jsx`)
Added detailed logging:
- ✅ Logs company ID being fetched
- ✅ Logs full company object
- ✅ Validates company ID before API call
- ✅ Logs response in multiple formats
- ✅ Logs exception details (name, message, stack)

## How to Debug

### Step 1: Open Browser Console
1. Open the application in your browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Test the Feature
1. Login as Department Head: `depthead@cs.test.com` / `test1234`
2. Navigate to "Assign Company" page
3. Click on a company (e.g., "navigated.tec" or "canada")
4. Watch the console for log messages

### Step 3: Analyze Console Output

Look for these emoji indicators:

#### 🔍 Request Logs
```
🔍 Fetching internships for company ID: 123
🔍 Company object: { id: 123, company_name: "...", ... }
🔍 internshipService.getAll called with params: { company_id: 123 }
```

**What to check:**
- Is the company ID a valid number?
- Does the company object have an `id` field?
- Are the params being passed correctly?

#### ✅ Success Logs
```
✅ internshipService.getAll response: { ... }
✅ Data is array, length: 3
📋 Final internship data: [...]
📋 First internship (if any): { id: 1, title: "...", ... }
```

**What to check:**
- Is the response structure correct?
- How many internships were returned?
- Does the first internship have all required fields?

#### ❌ Error Logs
```
❌ internshipService.getAll error: Error: ...
❌ Error response: { status: 403, data: {...} }
❌ Error message: "Permission denied"
❌ API returned success=false
❌ Exception while fetching internships: TypeError: ...
```

**What to check:**
- What is the HTTP status code? (401, 403, 404, 500)
- What is the error message from the server?
- Is it a network error or server error?

## Common Issues and Solutions

### Issue 1: Company ID is undefined
**Symptoms:**
```
❌ No company ID provided!
```

**Solution:**
- Check if company object has `id` field
- May need to use `company.user_id` or `company.pk` instead
- Check backend serializer to see what field name is used

### Issue 2: Permission Denied (403)
**Symptoms:**
```
❌ Error response: { status: 403, ... }
```

**Solution:**
- Department Head may not have permission to view company internships
- Check backend permissions in `Backend/apps/internships/views.py`
- May need to add Department Head to allowed roles

### Issue 3: No Response from Server
**Symptoms:**
```
❌ No response from server. Please check your connection.
```

**Solution:**
- Backend server may not be running
- Check if backend is running: `python manage.py runserver 0.0.0.0:8000`
- Check if API URL is correct in `.env` file

### Issue 4: Empty Response
**Symptoms:**
```
✅ Data is array, length: 0
This company has no internship postings yet
```

**Solution:**
- Company genuinely has no internships
- Check database: Does this company have any internships?
- May need to create test internships for this company

### Issue 5: Wrong Response Format
**Symptoms:**
```
⚠️ Unexpected response format: object {...}
```

**Solution:**
- Backend may be returning data in unexpected format
- Check backend serializer output
- May need to adjust frontend parsing logic

## Backend Checks

### Check 1: Verify API Endpoint
```bash
# Test the API directly
curl -H "Authorization: Token YOUR_TOKEN" \
  "http://localhost:8000/api/internships/?company_id=123"
```

### Check 2: Check Backend Logs
Look at the terminal where backend is running for:
- Request received logs
- Query logs
- Error logs

### Check 3: Check Database
```python
# In Django shell
python manage.py shell

from apps.internships.models import Internship
from apps.accounts.models import User

# Find the company
company = User.objects.get(email='company@test.com')
print(f"Company ID: {company.id}")

# Check their internships
internships = Internship.objects.filter(company=company)
print(f"Internships count: {internships.count()}")
for i in internships:
    print(f"- {i.title} (ID: {i.id}, Status: {i.status})")
```

## Next Steps Based on Console Output

### If you see company ID is undefined:
1. Read the company object structure
2. Find the correct field name for company ID
3. Update the code to use correct field

### If you see 403 Permission Denied:
1. Check backend permissions
2. Add Department Head to allowed roles
3. Test again

### If you see empty array:
1. Create test internships for the company
2. Verify company_id filter is working
3. Check if internships are marked as `is_active=True`

### If you see network error:
1. Verify backend is running
2. Check API URL configuration
3. Check CORS settings

## Files Modified

1. **Frontend/src/services/internshipService.js**
   - Enhanced error handling
   - Added detailed logging
   - Better error messages

2. **Frontend/src/pages/department/AssignCompany.jsx**
   - Added company ID validation
   - Enhanced logging
   - Better error display

## Test Credentials

- **Department Head:** `depthead@cs.test.com` / `test1234`
- **Company 1:** `company@test.com` / `test1234`
- **Company 2:** `two306702@gmail.com` / `test1234`

## Expected Console Output (Success Case)

```
🔍 Fetching internships for company ID: 5
🔍 Company object: { id: 5, company_name: "navigated.tec", ... }
🔍 internshipService.getAll called with params: { company_id: 5 }
✅ internshipService.getAll response: [...]
📦 Full API response: { success: true, data: [...] }
📦 Response.data: [...]
📦 Response.success: true
✅ Data is array, length: 3
📋 Final internship data: [{ id: 1, title: "Software Developer", ... }, ...]
📋 First internship (if any): { id: 1, title: "Software Developer", ... }
```

## Contact for Help

If you're still stuck after following this guide:
1. Copy ALL console logs (including emoji indicators)
2. Take a screenshot of the error
3. Note which company you clicked on
4. Share this information for further debugging
