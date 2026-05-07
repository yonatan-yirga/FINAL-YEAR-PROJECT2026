# Testing Guide: Landing Page Company Posts Fix

## Quick Test Steps

### Step 1: Start the Servers

**Backend** (in one terminal):
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

**Frontend** (in another terminal):
```bash
cd Frontend
npm run dev
```

### Step 2: Create a Test Internship Post

1. **Login as a company user**:
   - Go to: http://localhost:5173/login
   - Email: `company@test.com`
   - Password: `test1234`

2. **Create a new internship**:
   - Navigate to "My Internships" or "Post Internship"
   - Fill in the form:
     - Title: "Test Software Developer Intern"
     - Description: "This is a test internship post"
     - Required Skills: "Python, Django, React"
     - Location: "Addis Ababa"
     - Duration: 6 months
     - Start Date: (any future date)
     - Max Applicants: 5
   - Click "Create" or "Post"
   - **Important**: Make sure status is "OPEN"

3. **Verify the post was created**:
   - Check the company dashboard
   - Should see the new post in "My Internships"

### Step 3: Check Landing Page

1. **Open landing page** (in a new tab or incognito window):
   - Go to: http://localhost:5173/
   - No login required

2. **Scroll to "Partner Organizations" section**

3. **Check if company appears**:
   - Should see the company card with:
     - Company name
     - Location
     - Number of positions (internships)
     - Rating

4. **If not visible immediately**:
   - Wait 30 seconds (auto-refresh)
   - OR click the green "Refresh" button

### Step 4: Verify Auto-Refresh

1. **Keep landing page open**
2. **In another tab, create another internship** (as company user)
3. **Go back to landing page**
4. **Wait 30 seconds** - should see updated count
5. **Or click "Refresh"** - should update immediately

## Expected Results

### ✅ Success Indicators

1. **Company appears in Organizations section**
2. **Internship count is correct**
3. **Refresh button works** (shows "Loading..." then updates)
4. **Auto-refresh works** (updates every 30 seconds)
5. **No console errors** (check browser DevTools)

### ❌ Troubleshooting

#### Problem: Company not showing

**Check 1: Internship Status**
```bash
# In Backend directory
python manage.py shell
```
```python
from apps.internships.models import Internship
from apps.accounts.models import User

# Check if internship exists
company = User.objects.get(email='company@test.com')
internships = Internship.objects.filter(company=company)
print(f"Total internships: {internships.count()}")

# Check open internships
open_internships = internships.filter(status='OPEN', is_active=True)
print(f"Open internships: {open_internships.count()}")

# Print details
for i in open_internships:
    print(f"- {i.title} | Status: {i.status} | Active: {i.is_active}")
```

**Check 2: API Response**
- Open browser DevTools (F12)
- Go to Network tab
- Refresh landing page
- Look for request to: `http://localhost:8000/api/internships/public/`
- Check response:
  - Status should be 200
  - Response should be JSON array
  - Should contain your internship

**Check 3: Console Logs**
- Open browser console (F12 → Console)
- Should see:
  ```
  Fetching public companies...
  Public internships response: [...]
  Processed companies: [...]
  Fetched companies: X
  ```

#### Problem: 400 Bad Request Error

This was the original OAuth error. If you still see it:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + Shift + R)
3. Check if backend is running on port 8000

#### Problem: CORS Error

If you see CORS errors:
1. Check `Backend/config/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:5173',
       'http://127.0.0.1:5173',
   ]
   ```
2. Restart backend server

## Browser Console Commands

### Check what data is being fetched:
```javascript
// In browser console on landing page
fetch('http://localhost:8000/api/internships/public/')
  .then(r => r.json())
  .then(data => console.log('Internships:', data))
```

### Force refresh companies:
```javascript
// In browser console on landing page
// (only works if page is loaded)
window.location.reload()
```

## Database Check

### Check internships directly in database:

```bash
cd Backend
python manage.py shell
```

```python
from apps.internships.models import Internship
from apps.accounts.models import User

# Get all open internships
open_internships = Internship.objects.filter(
    status='OPEN',
    is_active=True
).select_related('company', 'company__company_profile')

print(f"\nTotal open internships: {open_internships.count()}\n")

for internship in open_internships:
    company_name = internship.get_company_name()
    print(f"Company: {company_name}")
    print(f"Title: {internship.title}")
    print(f"Location: {internship.location}")
    print(f"Status: {internship.status}")
    print(f"Active: {internship.is_active}")
    print("-" * 50)
```

## Success Criteria

- [x] Company posts appear on landing page
- [x] Auto-refresh works (30 seconds)
- [x] Manual refresh button works
- [x] Loading state shows while fetching
- [x] No authentication errors
- [x] No CORS errors
- [x] Console logs show correct data

## Notes

1. **Only OPEN internships show**: Closed or filled internships won't appear
2. **Top 6 companies**: Landing page shows only 6 companies with most internships
3. **No login required**: Landing page is public, no authentication needed
4. **Real-time updates**: New posts appear within 30 seconds or on manual refresh

## Need Help?

If issues persist:
1. Check `LANDING_PAGE_REFRESH_FIX.md` for detailed explanation
2. Check browser console for errors
3. Check backend logs for API errors
4. Verify database has open internships
