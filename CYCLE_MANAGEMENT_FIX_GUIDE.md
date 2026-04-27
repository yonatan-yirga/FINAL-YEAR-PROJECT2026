# Cycle Management - Fix Guide & Usage Instructions

## Overview
This guide explains the fixes applied to the Cycle Management system and provides clear instructions on how to use it.

## Issues Fixed

### 1. **Date Validation Error (400 Bad Request)**
**Problem**: When creating a cycle, users were getting a 400 error because the dates were empty or in an incorrect format.

**Root Cause**: 
- The backend wasn't properly validating empty date strings
- The frontend wasn't validating dates before submission
- Date format conversion wasn't being handled correctly

**Solution Applied**:
- Added comprehensive date validation in the backend (`create_cycle` and `update_cycle` methods)
- Added frontend form validation to check for empty dates before submission
- Added date format validation (YYYY-MM-DD)
- Added date logic validation (start_date must be before end_date)
- Improved error messages to be more descriptive

### 2. **Backend Validation Improvements**
**Changes in `Backend/apps/departments/views.py`**:

```python
# Added datetime import
from datetime import timedelta, datetime

# In create_cycle method:
- Validates that start_date and end_date are not empty strings
- Converts string dates to Python date objects using datetime.strptime()
- Validates date format is YYYY-MM-DD
- Validates that start_date < end_date
- Returns specific error messages for each validation failure

# In update_cycle method:
- Same validation logic as create_cycle
- Handles partial updates (only validates fields being updated)
```

### 3. **Frontend Validation Improvements**
**Changes in `Frontend/src/pages/department/DepartmentCycles.jsx`**:

```javascript
// In handleSubmit function:
- Validates year is provided
- Validates semester is provided
- Validates start_date is not empty
- Validates end_date is not empty
- Validates start_date < end_date
- Shows specific error messages for each validation failure
- Prevents form submission if validation fails
```

## How to Use Cycle Management

### Creating a New Cycle

1. **Navigate to Department Dashboard**
   - Go to the Department Head dashboard
   - Click on "Manage Deadlines" or "Cycles" section

2. **Click "Create New Cycle" Button**
   - Located in the top-right of the cycles section
   - Opens a modal form

3. **Fill in the Form**
   - **Year**: Enter the year (e.g., 2026)
   - **Semester**: Select from dropdown (Semester 1 or Semester 2)
   - **Start Date**: Click the date field and select a date
     - Format: YYYY-MM-DD (e.g., 2026-01-15)
     - This is the first day students can apply
   - **End Date**: Click the date field and select a date
     - Format: YYYY-MM-DD (e.g., 2026-03-15)
     - This is the last day students can apply
     - Must be after the Start Date
   - **Active**: Check this box if you want this to be the current active cycle
     - Only one cycle can be active at a time
     - Activating a new cycle will deactivate the previous one

4. **Submit the Form**
   - Click "Save Cycle" button
   - If validation passes, the cycle will be created
   - If validation fails, you'll see a specific error message
   - Success message will appear at the top

### Editing an Existing Cycle

1. **Find the Cycle**
   - Locate the cycle in the cycles grid
   - Click the "Edit" button (pencil icon)

2. **Update Fields**
   - Modify any fields you want to change
   - All validation rules apply to updates as well

3. **Save Changes**
   - Click "Save Cycle" button
   - Changes will be applied immediately

### Activating a Cycle

1. **Find the Cycle**
   - Locate the cycle in the cycles grid
   - Click the "Activate" button (power icon)

2. **Confirm Action**
   - A confirmation dialog will appear
   - Click "OK" to confirm
   - This will deactivate all other cycles

3. **Verification**
   - The cycle will now show as "Active" with a green badge
   - The active cycle banner at the top will update

### Closing a Cycle

1. **Find the Active Cycle**
   - Locate the active cycle (marked with "Active" badge)
   - Click the "Close Cycle" button (power off icon)

2. **Confirm Action**
   - A confirmation dialog will appear
   - Click "OK" to confirm
   - Students will no longer be able to apply during this cycle

3. **Verification**
   - The cycle will no longer show as "Active"
   - The active cycle banner will disappear

### Deleting a Cycle

1. **Find the Cycle**
   - Locate the cycle in the cycles grid
   - Click the "Delete" button (trash icon)

2. **Confirm Action**
   - A confirmation dialog will appear
   - Click "OK" to confirm
   - Note: You cannot delete an active cycle

3. **Verification**
   - The cycle will be removed from the list

## Error Messages & Solutions

| Error Message | Cause | Solution |
|---|---|---|
| "Year is required" | Year field is empty | Enter a valid year (e.g., 2026) |
| "Semester is required" | Semester not selected | Select Semester 1 or Semester 2 |
| "Start date is required" | Start date field is empty | Click the date field and select a date |
| "End date is required" | End date field is empty | Click the date field and select a date |
| "Start date must be before end date" | Start date is after or equal to end date | Select an end date that is after the start date |
| "Dates must be in YYYY-MM-DD format" | Date format is incorrect | Use the date picker (it will format correctly) |
| "Cycle already exists for this year and semester" | A cycle with the same year/semester already exists | Edit the existing cycle or choose different year/semester |
| "Cannot delete an active cycle" | Trying to delete the currently active cycle | Close or deactivate the cycle first, then delete |

## Technical Details

### Date Format
- **Frontend**: HTML5 date input automatically formats as YYYY-MM-DD
- **Backend**: Expects YYYY-MM-DD format, converts to Python date object
- **Database**: Stored as DATE field in PostgreSQL

### Validation Flow
1. **Frontend Validation** (immediate feedback)
   - Checks for empty fields
   - Validates date logic
   - Prevents submission if invalid

2. **Backend Validation** (server-side safety)
   - Validates all fields again
   - Checks for duplicate cycles
   - Validates date format and logic
   - Returns specific error messages

### API Endpoints

#### Get All Cycles
```
GET /api/departments/cycles/
Response: Array of cycle objects
```

#### Create Cycle
```
POST /api/departments/cycles/create/
Body: {
  "year": 2026,
  "semester": 1,
  "start_date": "2026-01-15",
  "end_date": "2026-03-15",
  "is_active": false
}
Response: { message, cycle }
```

#### Update Cycle
```
PUT /api/departments/{cycle_id}/cycles/update/
Body: { year, semester, start_date, end_date, is_active }
Response: { message, cycle }
```

#### Activate Cycle
```
POST /api/departments/{cycle_id}/cycles/activate/
Response: { message }
```

#### Close Cycle
```
POST /api/departments/{cycle_id}/cycles/close/
Response: { message }
```

#### Delete Cycle
```
DELETE /api/departments/{cycle_id}/cycles/delete/
Response: { message }
```

## Testing Checklist

- [ ] Create a new cycle with valid dates
- [ ] Try creating a cycle with empty dates (should show error)
- [ ] Try creating a cycle with start_date >= end_date (should show error)
- [ ] Edit an existing cycle
- [ ] Activate a cycle (verify others are deactivated)
- [ ] Close an active cycle
- [ ] Delete an inactive cycle
- [ ] Try deleting an active cycle (should show error)
- [ ] Verify dates display correctly in the cycle cards
- [ ] Verify active cycle banner shows correct information

## Files Modified

1. **Backend/apps/departments/views.py**
   - Added `datetime` import
   - Enhanced `create_cycle()` method with validation
   - Enhanced `update_cycle()` method with validation
   - Improved error messages

2. **Frontend/src/pages/department/DepartmentCycles.jsx**
   - Enhanced `handleSubmit()` function with validation
   - Added date format and logic validation
   - Improved error handling

## Next Steps

1. **Test the cycle management feature** with the checklist above
2. **Verify dates are being saved correctly** in the database
3. **Test the escalation inbox feature** (separate implementation)
4. **Create admin superuser** for testing (if not already done)
5. **Test the complete workflow** from cycle creation to student applications

## Support

If you encounter any issues:
1. Check the error message displayed
2. Refer to the "Error Messages & Solutions" table above
3. Verify the date format is YYYY-MM-DD
4. Check the browser console for any JavaScript errors
5. Check the Django server logs for backend errors

---

**Last Updated**: April 25, 2026
**Status**: Ready for Testing
