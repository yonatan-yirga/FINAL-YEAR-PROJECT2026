# Quick Start - Test Settings & Supervisor Feature

## 🚀 Quick Test (5 Minutes)

### Step 1: Start Servers (1 minute)

#### Backend:
```bash
cd Backend
python manage.py runserver
```
Wait for: `Starting development server at http://127.0.0.1:8000/`

#### Frontend (New Terminal):
```bash
cd Frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Step 2: Test Settings Save (2 minutes)

1. **Open Browser:** `http://localhost:5173`
2. **Login as Company User**
3. **Navigate to Settings:** Click profile → Settings
4. **Open Console:** Press `F12` → Console tab
5. **Update a Field:** Change phone number or city
6. **Click Save Changes**
7. **Check Console:** Should see:
   ```
   Sending profile update: {object}
   Profile update response: {object}
   ```
8. **Check Success Message:** Green banner "Profile updated successfully!"
9. **Refresh Page:** Press `F5`
10. **Verify:** Your changes are still there ✅

### Step 3: Test Supervisor Fields (2 minutes)

1. **Scroll Down** to "Internship Supervisor Information" (purple icon)
2. **Fill Fields:**
   - Name: "John Smith"
   - Title: "Senior Developer"
   - Email: "john@company.com"
   - Phone: "+251 911 234 567"
3. **Click Save Changes**
4. **Check Success Message**
5. **Refresh Page**
6. **Verify:** All supervisor fields still have your data ✅

### Step 4: Test API Endpoint (Optional - 1 minute)

**In Browser Console:**
```javascript
fetch('http://localhost:8000/api/advisors/company-student-advisors/', {
  headers: {
    'Authorization': 'Token ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(d => console.log('Result:', d));
```

**Expected:** Object with `count` and `students` array

---

## ✅ Success Checklist

After testing, you should have:
- [ ] Settings save button works
- [ ] No console errors
- [ ] Success message appears
- [ ] Data persists after refresh
- [ ] Supervisor section is visible
- [ ] Supervisor fields save correctly
- [ ] API endpoint returns data (or empty array)

---

## 🐛 If Something Fails

### Save Button Doesn't Work:
```bash
# Check backend is running
curl http://localhost:8000/api/auth/profile/

# Check frontend console for errors
# Press F12 → Console tab
```

### Supervisor Fields Don't Save:
```bash
# Run migration
cd Backend
python manage.py migrate accounts

# Check migration status
python manage.py showmigrations accounts
```

### API Returns Error:
```bash
# Check if you're logged in as company user
# Verify token in localStorage
console.log(localStorage.getItem('authToken'));
```

---

## 📊 What to Look For

### ✅ Good Signs:
- Green success message
- Console shows "Sending profile update"
- Console shows "Profile update response"
- No red errors in console
- Data persists after refresh
- Supervisor section has purple icon

### ❌ Bad Signs:
- Red error message
- Console shows errors
- Data doesn't persist
- Page reloads unexpectedly
- 404 or 500 errors in network tab

---

## 🎯 Quick Verification Commands

### Check Backend Status:
```bash
curl http://localhost:8000/api/auth/system-status/
```

### Check Database Migration:
```bash
cd Backend
python manage.py showmigrations accounts | grep supervisor
```
Should show: `[X] 0014_add_supervisor_fields`

### Check Frontend Build:
```bash
cd Frontend
npm run build
```
Should complete without errors

---

## 📞 Need Help?

### Check These First:
1. Backend server running? (http://localhost:8000)
2. Frontend server running? (http://localhost:5173)
3. Logged in as company user?
4. Browser console open? (F12)
5. Migration applied? (`python manage.py migrate`)

### Still Having Issues?
- Check `TASK_COMPLETION_SUMMARY.md` for details
- Review `TEST_SETTINGS_AND_SUPERVISOR.md` for full tests
- Check browser console for specific errors
- Check backend terminal for errors

---

## 🎉 Success!

If all tests pass:
1. ✅ Feature is working correctly
2. ✅ Ready for production use
3. ✅ Can proceed with next features

**Congratulations! The Settings & Supervisor feature is complete!** 🎊

---

**Estimated Time:** 5 minutes
**Difficulty:** Easy
**Prerequisites:** Backend + Frontend running
**Status:** Ready to Test ✅
