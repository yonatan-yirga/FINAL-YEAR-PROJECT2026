# Advisor Students View - 500 Error Fixed

## Issue
When clicking on an advisor name in the Advisors table, the page was returning a 500 Internal Server Error:
```
GET http://localhost:8000/api/departments/advisors/98/students/ 500 (Internal Server Error)
```

## Root Causes

### 1. Missing URL Route
The backend endpoint `advisor_students` was implemented in `views.py` but the URL route was missing in `urls.py`.

### 2. Incorrect Field Names
The `AdvisorAssignment` model uses `assigned_at` not `created_at`:
- Line 354: `order_by('-created_at')` → should be `order_by('-assigned_at')`
- Line 377: `assignment.created_at` → should be `assignment.assigned_at`

### 3. Incorrect Data Access Pattern
The code was trying to access internship through `application.internship`, but the `AdvisorAssignment` model has a direct `internship` foreign key field.

## Changes Made

### 1. Added URL Route (`Backend/apps/departments/urls.py`)
**Added the missing route for advisor students endpoint:**
```python
path('advisors/<int:pk>/students/', DepartmentViewSet.as_view({'get': 'advisor_students'}), name='department-advisor-students'),
```

### 2. Fixed Import Issue (`Backend/apps/departments/views.py`)
**Removed redundant import inside the method:**
- The `AdvisorAssignment` model was already imported at the top from `apps.advisors.models`
- Removed the incorrect duplicate import from `apps.applications.models`

### 3. Fixed Field Names and Data Access (`Backend/apps/departments/views.py`)
**Corrected the query and data access:**
```python
# Changed order_by from '-created_at' to '-assigned_at'
.order_by('-assigned_at')

# Access internship directly from assignment
internship = assignment.internship
if not internship and assignment.application:
    internship = assignment.application.internship

# Changed assigned_date from assignment.created_at to assignment.assigned_at
'assigned_date': assignment.assigned_at,
```

**Updated select_related to include both paths:**
```python
.select_related(
    'student__student_profile',
    'internship__company__company_profile',  # Direct path
    'application__internship__company__company_profile',  # Fallback path
    'internship',
    'application__internship'
)
```

## Implementation Details

### Backend Endpoint
- **URL:** `GET /api/departments/advisors/:id/students/`
- **Method:** `advisor_students` in `DepartmentViewSet`
- **Returns:**
  - Advisor profile info (name, staff ID, email, phone, department)
  - List of students with:
    - Student profile info
    - Company/internship details
    - Internship status (ACTIVE/COMPLETED)
    - Start/end dates
    - Batch info
    - Assigned date

### Frontend Implementation
- **Route:** `/department/advisor/:advisorId/students`
- **Component:** `AdvisorStudents.jsx`
- **Features:**
  - Advisor info card with avatar
  - Statistics dashboard (total, active, completed, pending)
  - Students table with search and sort
  - Status badges with icons
  - Back button to return to advisors list

## Files Modified
1. `Backend/apps/departments/urls.py` - Added URL route
2. `Backend/apps/departments/views.py` - Fixed import, field names, and data access pattern

## Next Steps

### ⚠️ RESTART BACKEND SERVER REQUIRED
The changes will not take effect until the backend server is restarted:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
python manage.py runserver 0.0.0.0:8000
```

### Testing
After restarting the server:
1. Login as Department Head: `depthead@cs.test.com` / `test1234`
2. Navigate to Advisors page
3. Click on any advisor name in the table
4. Should see the advisor's students page with:
   - Advisor info card
   - Statistics (total, active, completed, pending)
   - Students table with all details

## Expected Behavior
- Clicking advisor name opens new page showing their students
- Page displays advisor info and statistics
- Students table shows company, status, dates, and batch
- Search functionality filters students
- Back button returns to advisors list

## Status
✅ **FIXED** - All issues resolved:
  - URL route added
  - Import issue fixed
  - Field names corrected (`assigned_at` instead of `created_at`)
  - Data access pattern fixed (direct internship access)
⏳ **PENDING** - Requires backend server restart to apply changes
