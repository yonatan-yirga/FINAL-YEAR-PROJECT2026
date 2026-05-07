# Debug Guide: Landing Page Not Showing Company Posts

## Quick Test Steps

### Step 1: Test the API Directly

Open the test file in your browser:
```
test_api.html
```

This will:
- Fetch data from the API
- Show all companies found
- Display raw JSON response
- Show detailed debugging info

**Expected Result**: Should show "navigated.tec" with 2 internships

---

### Step 2: Check Browser Console

1. Open landing page: http://localhost:5173/
2. Press F12 to open DevTools
3. Go to Console tab
4. Click the "Refresh" button
5. Look for these logs:

```
=== LANDING PAGE: Starting fetchCompanies ===
Fetching public companies...
Fetching from URL: http://localhost:8000/api/internships/public/?ordering=-created_at&_t=...
Response status: 200
Public internships response: [...]
Total internships fetched: 8
Processing internship 1: {id: 47, title: "fullstackdeveloper", company: "navigated.tec", ...}
Processing internship 2: {id: 46, title: "Fullstack JavaScript Developer", company: "navigated.tec", ...}
...
Creating new company entry for: navigated.tec
navigated.tec now has 1 internships
navigated.tec now has 2 internships
...
=== FINAL PROCESSED COMPANIES ===
1. navigated.tec - 2 internships
2. DataDrive Systems - 2 internships
3. InnovateSoft Ltd - 2 internships
4. TechCorp Solutions - 2 internships
================================
=== LANDING PAGE: Setting companies === [...]
Fetched companies: 4
=== LANDING PAGE: fetchCompanies complete ===
```

---

### Step 3: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page or click "Refresh" button
4. Look for request to: `internships/public/`
5. Click on it
6. Check:
   - **Status**: Should be 200
   - **Response**: Should show JSON array with internships
   - **Preview**: Should show navigated.tec posts

---

### Step 4: Clear Browser Cache

If data is still not showing:

1. **Hard Refresh**: Press `Ctrl + Shift + R`
2. **Clear Cache**:
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"
3. **Refresh page again**

---

## Common Issues and Solutions

### Issue 1: Companies Not Showing

**Symptom**: Organizations section is empty or shows "Partner organizations will be displayed here"

**Check**:
```javascript
// In browser console on landing page
console.log('Companies state:', window.location.href);
// Then click Refresh button and watch console
```

**Solution**:
1. Check console for errors
2. Verify API returns data (use test_api.html)
3. Clear browser cache
4. Hard refresh (Ctrl + Shift + R)

---

### Issue 2: Old Data Showing

**Symptom**: Shows old companies but not new ones

**Solution**:
1. Click the "Refresh" button
2. Wait 30 seconds for auto-refresh
3. Clear browser cache
4. Check if new posts have `status='OPEN'` and `is_active=True`

---

### Issue 3: API Returns Empty Array

**Symptom**: Console shows `Total internships fetched: 0`

**Check Backend**:
```bash
cd Backend
python manage.py shell
```

```python
from apps.internships.models import Internship

# Check all internships
all_internships = Internship.objects.all()
print(f"Total internships: {all_internships.count()}")

# Check open internships
open_internships = Internship.objects.filter(status='OPEN', is_active=True)
print(f"Open internships: {open_internships.count()}")

# Check navigated.tec specifically
from apps.accounts.models import User
company = User.objects.filter(company_profile__company_name='navigated.tec').first()
if company:
    company_internships = Internship.objects.filter(company=company, status='OPEN', is_active=True)
    print(f"navigated.tec open internships: {company_internships.count()}")
    for i in company_internships:
        print(f"  - {i.title} (ID: {i.id}, Status: {i.status}, Active: {i.is_active})")
else:
    print("navigated.tec company not found")
```

---

### Issue 4: CORS Error

**Symptom**: Console shows CORS error

**Check Backend Settings**:
```python
# Backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

**Restart Backend**:
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

---

### Issue 5: Backend Not Running

**Symptom**: Console shows "Failed to fetch" or "Network error"

**Solution**:
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

Check if you see:
```
Starting development server at http://0.0.0.0:8000/
```

---

## Manual API Test

Test the API directly in browser console:

```javascript
// Test 1: Fetch internships
fetch('http://localhost:8000/api/internships/public/')
  .then(r => r.json())
  .then(data => {
    console.log('Total internships:', data.length);
    console.log('Companies:', [...new Set(data.map(i => i.company_name))]);
    console.log('navigated.tec posts:', data.filter(i => i.company_name === 'navigated.tec'));
  });

// Test 2: Check if navigated.tec is in the data
fetch('http://localhost:8000/api/internships/public/')
  .then(r => r.json())
  .then(data => {
    const navigatedPosts = data.filter(i => i.company_name === 'navigated.tec');
    console.log('navigated.tec has', navigatedPosts.length, 'posts');
    navigatedPosts.forEach(post => {
      console.log(`- ${post.title} (Status: ${post.status}, Active: ${post.is_active})`);
    });
  });
```

---

## Verification Checklist

- [ ] Backend server is running on port 8000
- [ ] Frontend server is running on port 5173
- [ ] API returns data (test with test_api.html)
- [ ] navigated.tec posts have `status='OPEN'`
- [ ] navigated.tec posts have `is_active=True`
- [ ] Browser cache is cleared
- [ ] Console shows no errors
- [ ] Network tab shows 200 response
- [ ] Console logs show companies being processed
- [ ] "X companies loaded" counter shows correct number

---

## Expected Console Output

When everything is working, you should see:

```
=== LANDING PAGE: Starting fetchCompanies ===
Fetching public companies...
Fetching from URL: http://localhost:8000/api/internships/public/?ordering=-created_at&_t=1714564800000
Response status: 200
Public internships response: (8) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
Total internships fetched: 8
Processing internship 1: {id: 47, title: 'fullstackdeveloper', company: 'navigated.tec', status: 'OPEN', is_active: true}
Creating new company entry for: navigated.tec
navigated.tec now has 1 internships
Processing internship 2: {id: 46, title: 'Fullstack JavaScript Developer (Angular + Node.js)', company: 'navigated.tec', status: 'OPEN', is_active: true}
navigated.tec now has 2 internships
Processing internship 3: {id: 41, title: 'Mobile App Developer Intern', company: 'DataDrive Systems', status: 'OPEN', is_active: true}
Creating new company entry for: DataDrive Systems
DataDrive Systems now has 1 internships
...
=== FINAL PROCESSED COMPANIES ===
1. navigated.tec - 2 internships
2. DataDrive Systems - 2 internships
3. InnovateSoft Ltd - 2 internships
4. TechCorp Solutions - 2 internships
================================
=== LANDING PAGE: Setting companies === (4) [{…}, {…}, {…}, {…}]
Fetched companies: 4
=== LANDING PAGE: fetchCompanies complete ===
```

---

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Take a screenshot** of:
   - Browser console (F12 → Console)
   - Network tab (F12 → Network)
   - The landing page Organizations section

2. **Run test_api.html** and take a screenshot

3. **Check backend logs** for any errors

4. **Verify the data** in the database using the Python shell commands above

5. **Try a different browser** (Chrome, Firefox, Edge)

6. **Disable browser extensions** that might interfere (ad blockers, etc.)
