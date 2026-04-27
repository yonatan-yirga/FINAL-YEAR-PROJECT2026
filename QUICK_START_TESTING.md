# Quick Start Testing Guide

## Prerequisites

- Django backend running on `http://localhost:8000`
- React frontend running on `http://localhost:5173`
- Logged in as Department Head user
- Database migrations applied

## Step 1: Restart Backend Server

```bash
cd Backend
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
```

## Step 2: Verify Frontend is Running

```bash
cd Frontend
npm run dev
```

Expected output:
```
VITE v7.3.1  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 3: Test Cycle Management

### 3.1 Navigate to Cycles Page
1. Log in as Department Head
2. Go to Department Dashboard
3. Click "Manage Deadlines" or "Cycles"

### 3.2 Create First Cycle
1. Click "Create New Cycle" button
2. Fill in the form:
   - **Year**: 2026
   - **Semester**: 1
   - **Start Date**: 2026-01-15 (click date picker)
   - **End Date**: 2026-03-15 (click date picker)
   - **Active**: Check this box
3. Click "Save Cycle"
4. **Expected Result**: Success message, cycle appears in list

### 3.3 Verify Cycle Display
- Check that cycle shows in the grid
- Verify "Active" badge appears
- Verify active cycle banner at top shows correct dates
- Verify duration is calculated correctly (59 days)

### 3.4 Create Second Cycle
1. Click "Create New Cycle" button
2. Fill in:
   - **Year**: 2026
   - **Semester**: 2
   - **Start Date**: 2026-06-01
   - **End Date**: 2026-08-31
   - **Active**: Leave unchecked
3. Click "Save Cycle"
4. **Expected Result**: Cycle created, not marked as active

### 3.5 Test Activation
1. Find the second cycle (2026 S2)
2. Click "Activate" button
3. Confirm in dialog
4. **Expected Result**: 
   - Second cycle now shows "Active" badge
   - First cycle no longer shows "Active" badge
   - Banner updates to show second cycle

### 3.6 Test Edit
1. Find the first cycle (2026 S1)
2. Click "Edit" button
3. Change end date to 2026-03-20
4. Click "Save Cycle"
5. **Expected Result**: Cycle updated, new date shows in card

### 3.7 Test Close
1. Find the active cycle (2026 S2)
2. Click "Close Cycle" button
3. Confirm in dialog
4. **Expected Result**: 
   - Cycle no longer shows "Active" badge
   - Banner disappears
   - Cycle shows as "Closed"

### 3.8 Test Delete
1. Find an inactive cycle
2. Click "Delete" button
3. Confirm in dialog
4. **Expected Result**: Cycle removed from list

### 3.9 Test Validation Errors

**Test Empty Dates**:
1. Click "Create New Cycle"
2. Fill in Year and Semester only
3. Leave dates empty
4. Click "Save Cycle"
5. **Expected Result**: Error message "Start date is required"

**Test Invalid Date Range**:
1. Click "Create New Cycle"
2. Fill in:
   - Year: 2026
   - Semester: 1
   - Start Date: 2026-03-15
   - End Date: 2026-01-15 (before start date)
3. Click "Save Cycle"
4. **Expected Result**: Error message "Start date must be before end date"

**Test Duplicate Cycle**:
1. Create a cycle for 2026 S1
2. Try to create another cycle for 2026 S1
3. **Expected Result**: Error message "Cycle already exists for this year and semester"

## Step 4: Test Escalation Inbox

### 4.1 Navigate to Escalations Page
1. Go to Department Dashboard
2. Click "Escalation Inbox" or "Escalations"

### 4.2 Create First Escalation
1. Click "Create New Escalation" button
2. Fill in:
   - **Issue Type**: Student Performance Risk
   - **Title**: Student Failing Courses
   - **Description**: Student is failing multiple courses and at risk of not completing internship
3. Click "Create Escalation"
4. **Expected Result**: Success message, escalation appears in list

### 4.3 Verify Escalation Display
- Check that escalation shows in the list
- Verify issue type shows with correct color (Red for Performance Risk)
- Verify status shows as "OPEN"
- Verify created date is today

### 4.4 Create Different Issue Types
Create escalations for each issue type:

1. **Advisor Inactivity** (Orange)
   - Title: Advisor Not Responding
   - Description: Advisor has not responded to student inquiries for 2 weeks

2. **Company Policy Violation** (Purple)
   - Title: Company Violating Agreement
   - Description: Company is not following internship agreement terms

3. **Placement Conflict** (Blue)
   - Title: Student Assigned to Multiple Companies
   - Description: Student has been assigned to two different companies

4. **Other Strategic Issue** (Gray)
   - Title: General Issue
   - Description: Some other strategic issue

### 4.5 Test Filtering
1. Click on "Status" filter
2. Select "OPEN"
3. **Expected Result**: Only open escalations show
4. Select "RESOLVED"
5. **Expected Result**: Only resolved escalations show (should be empty)

### 4.6 Test Search
1. Type in search box: "Advisor"
2. **Expected Result**: Only escalations with "Advisor" in title/description show

### 4.7 Test Resolution
1. Find an open escalation
2. Click "Resolve" button
3. Fill in resolution notes: "Issue has been resolved with the advisor"
4. Click "Resolve Escalation"
5. **Expected Result**: 
   - Status changes to "RESOLVED"
   - Notes are saved
   - Escalation no longer shows in "OPEN" filter

### 4.8 Test Escalate to UIL
1. Create a new escalation
2. Click "Escalate to UIL" button
3. Fill in reason: "This issue requires university-level intervention"
4. Click "Escalate to UIL"
5. **Expected Result**: 
   - Status changes to "ESCALATED_TO_UIL"
   - Reason is saved in resolution notes

### 4.9 Test Statistics
- Verify total escalation count is correct
- Verify issue type breakdown is accurate
- Verify status counts are correct

## Step 5: Test Error Scenarios

### 5.1 Test Missing Required Fields
1. Click "Create New Escalation"
2. Leave all fields empty
3. Click "Create Escalation"
4. **Expected Result**: Error message about missing fields

### 5.2 Test Network Error Recovery
1. Stop the backend server
2. Try to create a cycle
3. **Expected Result**: Error message "Failed to create cycle"
4. Restart backend
5. Click "Retry" button
6. **Expected Result**: Page refreshes and loads successfully

## Step 6: Verify Database

### 6.1 Check Cycles Table
```bash
python manage.py shell
```

```python
from apps.departments.models import DepartmentCycle
cycles = DepartmentCycle.objects.all()
for cycle in cycles:
    print(f"{cycle.year} S{cycle.semester}: {cycle.start_date} - {cycle.end_date} (Active: {cycle.is_active})")
```

### 6.2 Check Escalations Table
```python
from apps.departments.models import Escalation
escalations = Escalation.objects.all()
for esc in escalations:
    print(f"[{esc.status}] {esc.title} ({esc.issue_type})")
```

## Step 7: Performance Testing

### 7.1 Load Testing
1. Create 10 cycles
2. Create 20 escalations
3. Verify page loads quickly
4. Verify filters work smoothly

### 7.2 Pagination (if implemented)
1. Create 50+ cycles
2. Verify pagination controls appear
3. Test navigation between pages

## Troubleshooting

### Issue: 400 Bad Request on Cycle Creation
**Solution**: 
- Ensure dates are filled in
- Check date format is YYYY-MM-DD
- Verify start date is before end date

### Issue: 404 Not Found
**Solution**:
- Restart Django backend
- Check URL routes are registered
- Verify department exists

### Issue: Dates not showing correctly
**Solution**:
- Clear browser cache
- Check browser console for errors
- Verify date format in database

### Issue: Validation not working
**Solution**:
- Check browser console for JavaScript errors
- Verify form inputs have `required` attribute
- Check network tab for API responses

## Success Criteria

✅ All tests pass if:
- Cycles can be created with valid dates
- Cycles cannot be created with invalid dates
- Activation/deactivation works correctly
- Escalations can be created and resolved
- Filtering and search work correctly
- Error messages are clear and helpful
- Database stores data correctly
- UI updates in real-time

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Optimize performance** if needed
3. **Add pagination** for large datasets
4. **Create admin superuser** for admin panel access
5. **Test complete workflow** from cycle creation to student applications
6. **Deploy to production** when ready

---

**Estimated Testing Time**: 30-45 minutes
**Last Updated**: April 25, 2026
