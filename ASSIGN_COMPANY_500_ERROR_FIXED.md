# Assign Company to Student - 500 Error Fixed

## Problem
When Department Head tried to assign a student to a company/internship, the system returned a 500 Internal Server Error with the following database constraint violation:

```
django.db.utils.IntegrityError: null value in column "applied_at" of relation "applications" violates not-null constraint
```

## Root Cause
The `applied_at` field in the `Application` model has `auto_now_add=True`, which means Django automatically sets it when creating a new record. However, when using `save_base(raw=True)` to bypass validation (needed to allow Department Head to manually place students even when internship is not accepting applications), Django does not populate auto fields.

## Solution
Modified `Backend/apps/departments/views.py` in the `assign_company` method to:

1. **Temporarily disable auto field behavior**: Before saving, we temporarily set `auto_now_add=False` and `auto_now=False` on the timestamp fields
2. **Manually set timestamps**: Set `applied_at` and `updated_at` to current time
3. **Save with raw=True**: Save the application bypassing validation
4. **Restore field settings**: Restore the original auto field settings to not affect other operations

### Code Changes
```python
# Temporarily remove auto_now_add to allow manual setting
applied_at_field = Application._meta.get_field('applied_at')
updated_at_field = Application._meta.get_field('updated_at')

original_auto_now_add = applied_at_field.auto_now_add
original_auto_now = updated_at_field.auto_now

applied_at_field.auto_now_add = False
updated_at_field.auto_now = False

try:
    # Set the timestamps manually
    application.applied_at = now
    application.updated_at = now
    
    # Save without validation
    application.save_base(raw=True, force_insert=True)
finally:
    # Restore the original field settings
    applied_at_field.auto_now_add = original_auto_now_add
    updated_at_field.auto_now = original_auto_now
```

## Testing
1. Login as Department Head: `depthead@cs.test.com` / `test1234`
2. Navigate to: http://localhost:5173/department/assign-company
3. Select a student from the list
4. Click on a company to view its internships
5. Click "Assign" button on any internship
6. Verify success message appears
7. Check that application was created with status "ACCEPTED"

## Files Modified
- `Backend/apps/departments/views.py` - Fixed the `assign_company` method

## Result
✅ Department Head can now successfully assign students to companies/internships
✅ Application records are created with all required fields populated
✅ No more 500 errors or database constraint violations
✅ Notifications are sent to both student and company (with error handling)

## Related Issues Fixed Previously
1. `reviewed_by` field validation - Set to `None` instead of Department Head user
2. Internship validation - Bypassed `is_accepting_applications` check for manual placements
3. Notification failures - Wrapped in try-except to prevent assignment failures
