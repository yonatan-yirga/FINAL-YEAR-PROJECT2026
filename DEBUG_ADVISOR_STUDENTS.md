# Debug Guide: Advisor Students Endpoint

## Current Status
Getting error: "Failed to fetch advisor students"

## Steps to Debug

### 1. Restart Backend Server
**CRITICAL:** You must restart the backend server for URL changes to take effect.

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### 2. Check Backend Terminal
After restarting, watch the backend terminal for any errors when you click an advisor name.

Look for:
- Import errors
- Database query errors
- Field access errors
- Traceback messages

### 3. Test the Endpoint Manually

#### Option A: Using Python Script
```bash
cd Backend
python test_advisor_endpoint.py
```

This will:
1. Login as department head
2. Get list of advisors
3. Test the advisor students endpoint
4. Show detailed error messages

#### Option B: Using Browser Console
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click an advisor name
4. Look for the request to `/api/departments/advisors/{id}/students/`
5. Check:
   - Status code (should be 200, not 404 or 500)
   - Response body (click on the request → Response tab)
   - Any error messages

#### Option C: Using curl
```bash
# First, get a token
TOKEN=$(curl -s -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"depthead@cs.test.com","password":"test1234"}' \
  | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# Then test the endpoint (replace 84 with actual advisor ID)
curl -X GET "http://localhost:8000/api/departments/advisors/84/students/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Common Issues and Solutions

#### Issue: 404 Not Found
**Cause:** URL route not registered or server not restarted
**Solution:** 
- Restart backend server
- Check `Backend/apps/departments/urls.py` has the route
- Verify URL pattern matches: `advisors/<int:pk>/students/`

#### Issue: 500 Internal Server Error
**Cause:** Code error in the view method
**Solution:**
- Check backend terminal for traceback
- Common causes:
  - Missing fields (assigned_at vs created_at)
  - Accessing None values
  - Missing related objects (profiles, internships)

#### Issue: 403 Forbidden
**Cause:** Permission denied
**Solution:**
- Ensure you're logged in as DEPARTMENT_HEAD
- Check token is valid
- Verify `_check_department_permission` passes

#### Issue: Empty students list
**Cause:** No students assigned to advisor
**Solution:**
- This is normal if advisor has no students
- Check database: `AdvisorAssignment.objects.filter(advisor_id=X).count()`

### 5. Verify Database Data

Run this in Django shell:
```bash
cd Backend
python manage.py shell
```

```python
from apps.accounts.models import User
from apps.advisors.models import AdvisorAssignment

# Check advisors
advisors = User.objects.filter(role='ADVISOR', is_approved=True)
print(f"Advisors: {advisors.count()}")

# Check assignments
for advisor in advisors[:3]:
    assignments = AdvisorAssignment.objects.filter(advisor=advisor)
    print(f"{advisor.email}: {assignments.count()} students")
    
    # Check first assignment
    if assignments.exists():
        a = assignments.first()
        print(f"  - Has internship: {a.internship is not None}")
        print(f"  - Has student profile: {hasattr(a.student, 'student_profile')}")
        print(f"  - Assigned at: {a.assigned_at}")
```

### 6. Check Frontend Error Details

In `Frontend/src/pages/department/AdvisorStudents.jsx`, temporarily add more logging:

```javascript
const fetchAdvisorStudents = async () => {
  try {
    setLoading(true);
    console.log('Fetching advisor students for ID:', advisorId);
    
    const response = await departmentService.getAdvisorStudents(advisorId);
    console.log('Response:', response);
    
    if (response.success) {
      setAdvisor(response.data.advisor);
      setStudents(response.data.students || []);
      setError(null);
    } else {
      console.error('Error from service:', response.error);
      setError(response.error);
    }
  } catch (err) {
    console.error('Catch block error:', err);
    setError('Failed to load advisor students');
  } finally {
    setLoading(false);
  }
};
```

### 7. Expected Response Format

The endpoint should return:
```json
{
  "advisor": {
    "id": 84,
    "full_name": "John Doe",
    "staff_id": "ADV001",
    "email": "advisor@test.com",
    "phone_number": "+251912345678",
    "department": "Computer Science"
  },
  "students": [
    {
      "id": 10,
      "full_name": "Jane Smith",
      "student_id": "STU001",
      "email": "student@test.com",
      "phone_number": "+251987654321",
      "batch": "2024",
      "company_name": "Tech Corp",
      "internship_title": "Software Developer Intern",
      "internship_status": "ACTIVE",
      "start_date": "2024-01-01",
      "end_date": "2024-06-30",
      "assigned_date": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## Quick Checklist

- [ ] Backend server restarted after code changes
- [ ] URL route exists in `Backend/apps/departments/urls.py`
- [ ] Method `advisor_students` exists in `Backend/apps/departments/views.py`
- [ ] No errors in backend terminal
- [ ] Browser console shows the request
- [ ] Request returns 200 status code
- [ ] Response has correct JSON structure
- [ ] Frontend displays the data

## If Still Not Working

1. **Check the exact error in browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Copy the full error message

2. **Check backend terminal output:**
   - Look for any Python tracebacks
   - Copy the full error message

3. **Run the test script:**
   ```bash
   cd Backend
   python test_advisor_endpoint.py
   ```
   - Copy the output

4. **Share these details** so we can identify the exact issue.
