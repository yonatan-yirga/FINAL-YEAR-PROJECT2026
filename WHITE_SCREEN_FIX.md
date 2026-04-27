# White Screen Fix - Company Detail Page ✅

## Problem
When clicking on a company card on the home page → Shows white/blank screen

## Possible Causes & Solutions

### **1. Backend Server Not Running**

**Check**:
```bash
# Is backend running?
# Should see: Starting development server at http://127.0.0.1:8000/
```

**Solution**:
```bash
cd Backend
python manage.py runserver
```

### **2. Public Endpoint Not Created**

**Check**: Open browser and go to:
```
http://localhost:8000/api/internships/public/
```

**Expected**: JSON array of internships
**If Error**: Backend code not updated or server not restarted

**Solution**:
1. Verify `Backend/apps/internships/views.py` has `public_internships_list` function
2. Verify `Backend/apps/internships/urls.py` has `path('public/', ...)` route
3. Restart backend server

### **3. No Internships in Database**

**Check**: Visit the public endpoint:
```
http://localhost:8000/api/internships/public/
```

**If Returns**: `[]` (empty array)

**Solution**: Post at least one internship:
1. Login as company
2. Go to `/company/post-internship`
3. Fill out form and submit
4. Verify internship appears in endpoint

### **4. CORS Issues**

**Check Browser Console** (F12):
- Look for CORS errors
- Look for "Access-Control-Allow-Origin" errors

**Solution**: Verify `Backend/config/settings.py` has:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### **5. API Service Configuration**

**Check**: `Frontend/src/services/api.js`

**Should Have**:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### **6. Console Errors**

**How to Check**:
1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Click "Console" tab
4. Refresh page
5. Look for red error messages

**Common Errors**:

#### Error: "Failed to fetch"
- Backend not running
- Wrong API URL
- CORS issue

#### Error: "404 Not Found"
- Public endpoint not created
- URL route not registered
- Server not restarted

#### Error: "Network Error"
- Backend server down
- Wrong port number
- Firewall blocking

## Debugging Steps

### **Step 1: Check Backend**

```bash
# Terminal 1: Start backend
cd Backend
python manage.py runserver

# Should see:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CTRL-BREAK.
```

### **Step 2: Test Public Endpoint**

Open browser:
```
http://localhost:8000/api/internships/public/
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "title": "Software Developer Intern",
    "company_name": "Tech Solutions",
    "location": "Addis Ababa",
    ...
  }
]
```

**If Empty Array `[]`**:
- No internships posted yet
- Post one internship as company

**If Error Page**:
- Endpoint not created
- Check views.py and urls.py
- Restart server

### **Step 3: Check Frontend**

```bash
# Terminal 2: Start frontend
cd Frontend
npm run dev

# Should see:
# Local: http://localhost:5173/
```

### **Step 4: Test Landing Page**

1. Open: `http://localhost:5173/`
2. Open Browser Console (F12)
3. Look for console.log messages:
   - "Fetching public companies..."
   - "Public internships response: [...]"
   - "Processed companies: [...]"

**If No Messages**:
- Frontend not calling API
- Check LandingPage.jsx

**If Error Messages**:
- Read error carefully
- Check network tab for failed requests

### **Step 5: Test Company Click**

1. Click on a company card
2. Watch console for messages:
   - "Fetching company details for: [Company Name]"
   - "Company fetch result: {...}"

**If White Screen**:
- Check console for errors
- Check network tab for failed API calls

## Enhanced Error Handling

I've added console logging to help debug:

### **publicService.js**

```javascript
// Now logs:
console.log('Fetching public companies...');
console.log('Public internships response:', response);
console.log('Processed companies:', companies);
console.log('Fetching internships for company:', companyName);
console.log('Filtered internships for company:', companyInternships);
```

### **CompanyDetail.jsx**

```javascript
// Now logs:
console.log('Fetching company details for:', companyName);
console.log('Company fetch result:', result);
```

## Testing Checklist

### ✅ **Backend Tests**

- [ ] Backend server running on port 8000
- [ ] Can access: `http://localhost:8000/api/internships/public/`
- [ ] Endpoint returns JSON array (not error page)
- [ ] At least one internship exists in response

### ✅ **Frontend Tests**

- [ ] Frontend running on port 5173
- [ ] Landing page loads without errors
- [ ] Browser console shows no red errors
- [ ] Organizations section shows companies
- [ ] Can click company card
- [ ] Company detail page loads (not white screen)
- [ ] Internships display on company detail page

### ✅ **Network Tests**

1. Open Browser DevTools (F12)
2. Go to "Network" tab
3. Refresh landing page
4. Look for request to `/internships/public/`
5. Check:
   - [ ] Status: 200 OK (not 404, 500, etc.)
   - [ ] Response: JSON array
   - [ ] No CORS errors

## Quick Fix Commands

```bash
# Terminal 1: Backend
cd Backend
python manage.py runserver

# Terminal 2: Frontend  
cd Frontend
npm run dev

# Browser
# Open: http://localhost:5173/
# Press F12 for console
# Check for errors
```

## Common Solutions

### **Solution 1: Restart Everything**

```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd Backend
python manage.py runserver

# Restart frontend (new terminal)
cd Frontend
npm run dev

# Clear browser cache (Ctrl+Shift+Delete)
# Refresh page (Ctrl+F5)
```

### **Solution 2: Check Database**

```bash
cd Backend
python manage.py shell

# In Python shell:
from apps.internships.models import Internship
print(Internship.objects.filter(status='OPEN', is_active=True).count())
# Should show number > 0

# If 0, create one:
# Login as company and post internship
```

### **Solution 3: Verify Code Changes**

Check these files have the new code:

1. ✅ `Backend/apps/internships/views.py`
   - Has `public_internships_list` function
   - Has `@permission_classes([AllowAny])`

2. ✅ `Backend/apps/internships/urls.py`
   - Has `path('public/', views.public_internships_list, ...)`

3. ✅ `Frontend/src/services/publicService.js`
   - Uses `/internships/public/` endpoint
   - Has console.log statements

## Success Indicators

### **✅ Working Correctly**

**Backend**:
- Server running without errors
- `/api/internships/public/` returns JSON array
- Array contains at least one internship

**Frontend**:
- Landing page loads
- Companies appear in Organizations section
- Clicking company shows detail page (not white screen)
- Internships display on company detail page

**Browser Console**:
- No red error messages
- Console logs show successful API calls
- Network tab shows 200 OK responses

## Still Having Issues?

### **Collect Debug Information**

1. **Backend Terminal Output**:
   - Copy any error messages
   - Note the port number

2. **Browser Console**:
   - Copy all error messages (red text)
   - Copy console.log output

3. **Network Tab**:
   - Find `/internships/public/` request
   - Check status code
   - Check response

4. **API Test**:
   - Visit: `http://localhost:8000/api/internships/public/`
   - Copy the response or error

### **Check These Files**

1. `Backend/apps/internships/views.py` - Has public_internships_list?
2. `Backend/apps/internships/urls.py` - Has public/ route?
3. `Frontend/src/services/publicService.js` - Uses /internships/public/?
4. `Frontend/src/pages/public/CompanyDetail.jsx` - Has error handling?

## Files Modified (For Reference)

1. ✅ `Backend/apps/internships/views.py` - Added public endpoint
2. ✅ `Backend/apps/internships/urls.py` - Added route
3. ✅ `Frontend/src/services/publicService.js` - Added logging, error handling
4. ✅ `Frontend/src/pages/public/CompanyDetail.jsx` - Added logging

## Conclusion

The white screen issue is usually caused by:
1. Backend server not running
2. Public endpoint not created/registered
3. No internships in database
4. API connection issues

Follow the debugging steps above to identify and fix the issue!

**Status**: ✅ Enhanced error handling and logging added
**Next**: Check browser console for specific error messages
