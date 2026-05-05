# Quick Test: Assign Company to Student

## What Was Fixed
Fixed the 500 Internal Server Error when Department Head assigns a student to a company. The error was caused by the `applied_at` field being NULL due to Django's auto field behavior being bypassed.

## How to Test

### 1. Login as Department Head
- URL: http://localhost:5173/login
- Email: `depthead@cs.test.com`
- Password: `test1234`

### 2. Navigate to Assign Company Page
- URL: http://localhost:5173/department/assign-company
- Or click "Assign Company" from the Department Head dashboard

### 3. Test the Assignment
1. **Select a student** from the student list on the left
2. **Click on a company** to view its internship posts
3. **Review the internship details** (description, skills, slots, etc.)
4. **Click the "Assign" button** on any internship
5. **Verify success message** appears: "Student successfully assigned to company"

### 4. Verify the Assignment
- Check that the student now appears as assigned
- Verify the internship's filled slots increased
- Check notifications were sent (if notification system is working)

## Expected Behavior
✅ No more 500 errors
✅ Success message appears
✅ Application created with status "ACCEPTED"
✅ Student is assigned to the internship
✅ Internship slots are updated

## What Happens Behind the Scenes
1. Creates an `Application` record with status "ACCEPTED"
2. Sets `applied_at` and `updated_at` timestamps manually
3. Bypasses validation to allow manual placement
4. Updates internship's filled slots
5. Sends notifications to student and company

## Technical Details
- The fix temporarily disables Django's auto field behavior
- Manually sets the `applied_at` timestamp
- Uses `save_base(raw=True)` to bypass validation
- Restores auto field settings after saving

## Files Modified
- `Backend/apps/departments/views.py` - Fixed `assign_company` method

## Backend Server
The backend server is already running on port 8000. No restart needed - Django auto-reloads on file changes.

## Frontend
If you had the frontend open, do a hard refresh:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
