# Quick Test Guide - Settings & Supervisor Feature

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:5173`
- At least one company user account
- At least one student with accepted application and advisor assignment

## Test 1: Settings Save Button (Company User)

### Steps:
1. Open browser and navigate to `http://localhost:5173`
2. Login as a company user
3. Navigate to Settings: `http://localhost:5173/settings`
4. Open browser Developer Tools (F12) and go to Console tab
5. Update any field (e.g., Phone Number, City, Address)
6. Click "Save Changes" button
7. **Expected Results:**
   - Console shows: `Sending profile update: {object}`
   - Console shows: `Profile update response: {object}`
   - Green success message appears: "Profile updated successfully!"
   - No errors in console
   - Page doesn't reload but data is saved

### If It Fails:
- Check console for error messages
- Check Network tab for failed API calls
- Verify backend is running
- Check backend terminal for errors

## Test 2: Supervisor Information Fields

### Steps:
1. While logged in as company user, stay on Settings page
2. Scroll down to "Internship Supervisor Information" section
3. Fill in all supervisor fields:
   - **Supervisor Full Name:** "John Smith"
   - **Supervisor Title/Position:** "Senior Developer"
   - **Supervisor Email:** "john.smith@company.com"
   - **Supervisor Phone:** "+251 911 234 567"
4. Click "Save Changes"
5. **Expected Results:**
   - Success message appears
   - No errors in console
6. Refresh the page (F5)
7. **Expected Results:**
   - All supervisor fields still contain the data you entered
   - Data persisted successfully

### If It Fails:
- Check if migration was applied: Run `python manage.py migrate accounts` in Backend folder
- Check database for `supervisor_name`, `supervisor_email`, `supervisor_phone`, `supervisor_title` columns in `company_profiles` table
- Check console and network tab for errors

## Test 3: Company-Advisor API Endpoint

### Using Browser Console:
1. While logged in as company user, open Developer Tools Console
2. Run this JavaScript code:
```javascript
fetch('http://localhost:8000/api/advisors/company-student-advisors/', {
  headers: {
    'Authorization': 'Token ' + localStorage.getItem('authToken'),
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Advisor Data:', data))
.catch(err => console.error('Error:', err));
```
3. **Expected Results:**
   - Console shows object with `count` and `students` array
   - Each student has `advisor` object with name, email, phone, etc.
   - If no students assigned yet, `count: 0` and empty `students: []`

### Using curl (Command Line):
```bash
# First, get your auth token by logging in
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"company@example.com\",\"password\":\"yourpassword\"}"

# Copy the token from response, then:
curl -X GET http://localhost:8000/api/advisors/company-student-advisors/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

## Test 4: Settings Save Button (Student User)

### Steps:
1. Logout from company account
2. Login as a student user
3. Navigate to Settings
4. Update any field (e.g., Phone Number, Skills)
5. Click "Save Changes"
6. **Expected Results:**
   - Success message appears
   - No errors
   - Data persists after refresh

## Test 5: Settings Save Button (Advisor User)

### Steps:
1. Logout and login as advisor user
2. Navigate to Settings
3. Update any field
4. Click "Save Changes"
5. **Expected Results:**
   - Success message appears
   - No errors
   - Data persists after refresh

## Visual Verification Checklist

### Settings Page UI:
- [ ] Page loads without errors
- [ ] All tabs are visible (Profile, Security, Notifications, Appearance)
- [ ] Profile tab shows user information
- [ ] For company users: "Internship Supervisor Information" section is visible
- [ ] Supervisor section has purple gradient icon
- [ ] Informational box explains the purpose
- [ ] All input fields are properly styled
- [ ] Save button is visible and clickable
- [ ] Success/error messages display properly

### Supervisor Section Design:
- [ ] Premium glassmorphism design
- [ ] Purple gradient icon wrapper (#8b5cf6)
- [ ] Sparkles icon visible
- [ ] Informational box with bullet points
- [ ] 4 input fields in 2-column layout
- [ ] Fields have proper labels with icons
- [ ] Placeholder text is helpful

## Common Issues & Solutions

### Issue: "Failed to update profile"
**Solution:** 
- Check if email field is being sent (it shouldn't be)
- Verify backend serializer accepts the fields
- Check backend logs for validation errors

### Issue: Supervisor fields not saving
**Solution:**
- Run migration: `python manage.py migrate accounts`
- Verify database has new columns
- Check serializer includes new fields

### Issue: API returns empty students array
**Solution:**
- This is normal if no students are assigned yet
- Create test data: student → apply → company accepts → advisor assigned
- Then test again

### Issue: Console shows CORS error
**Solution:**
- Verify backend CORS settings allow frontend origin
- Check `CORS_ALLOWED_ORIGINS` in Django settings

## Success Indicators

✅ **All Tests Pass:**
- Settings save button works for all roles
- Supervisor fields save and persist
- API endpoint returns data (or empty array if no students)
- No console errors
- UI looks premium and polished

✅ **Ready for Production:**
- All features working
- Error handling in place
- Data persists correctly
- API endpoints secured

## Next Steps After Testing

If all tests pass:
1. ✅ Mark feature as complete
2. 📝 Document for other developers
3. 🚀 Deploy to staging/production
4. 📧 Notify stakeholders

If tests fail:
1. 🐛 Debug using console logs
2. 🔍 Check backend logs
3. 📊 Verify database state
4. 🔧 Fix issues and retest
