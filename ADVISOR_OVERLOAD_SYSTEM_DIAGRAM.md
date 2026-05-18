# Advisor Overload Resolution - System Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  AdvisorOverloadResolution.jsx                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ Overloaded   │  │  Students    │  │  Available   │    │    │
│  │  │  Advisors    │  │ to Reassign  │  │  Advisors    │    │    │
│  │  │              │  │              │  │              │    │    │
│  │  │ [List View]  │  │ [Checkboxes] │  │ [List View]  │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │                                                             │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │         Action Bar (Confirm Reassignment)          │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  departmentService.js                                      │    │
│  │  • getOverloadedAdvisors()                                 │    │
│  │  • getAvailableAdvisors()                                  │    │
│  │  • reassignStudents(data)                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
└─────────────────────────────────────────────────────────────────────┘
                               ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Django)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  DepartmentViewSet (views.py)                              │    │
│  │                                                             │    │
│  │  GET /api/departments/advisors/overloaded/                 │    │
│  │  ├─ Query advisors with active_students > max_students     │    │
│  │  ├─ Calculate excess and percentage                        │    │
│  │  └─ Return list with student details                       │    │
│  │                                                             │    │
│  │  GET /api/departments/advisors/available/                  │    │
│  │  ├─ Query advisors with active_students < max_students     │    │
│  │  ├─ Calculate available capacity                           │    │
│  │  └─ Return sorted by capacity                              │    │
│  │                                                             │    │
│  │  POST /api/departments/advisors/reassign/                  │    │
│  │  ├─ Validate from_advisor and to_advisor                   │    │
│  │  ├─ Check capacity and department match                    │    │
│  │  ├─ Update AdvisorAssignment records                       │    │
│  │  ├─ Send notifications                                     │    │
│  │  └─ Return success response                                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Database Models                                           │    │
│  │                                                             │    │
│  │  AdvisorProfile                                            │    │
│  │  ├─ user (FK to User)                                      │    │
│  │  ├─ max_students (default: 15)                             │    │
│  │  └─ advising_location                                      │    │
│  │                                                             │    │
│  │  AdvisorAssignment                                         │    │
│  │  ├─ student (FK to User)                                   │    │
│  │  ├─ advisor (FK to User)                                   │    │
│  │  ├─ internship (FK to Internship)                          │    │
│  │  ├─ is_active (Boolean)                                    │    │
│  │  └─ assigned_at (DateTime)                                 │    │
│  │                                                             │    │
│  │  User                                                       │    │
│  │  ├─ role (ADVISOR, STUDENT, etc.)                          │    │
│  │  ├─ department (FK to Department)                          │    │
│  │  └─ is_approved (Boolean)                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  NotificationService                                       │    │
│  │  • create_notification(recipient, title, message, ...)    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### 1. Load Overload Resolution Page

```
User → Frontend → GET /api/departments/advisors/overloaded/
                ↓
              Backend queries:
              • User.objects.filter(role='ADVISOR')
              • Annotate with active_students count
              • Filter where active_students > max_students
                ↓
              Returns: List of overloaded advisors with students
                ↓
User ← Frontend ← JSON Response
```

### 2. Load Available Advisors

```
User → Frontend → GET /api/departments/advisors/available/
                ↓
              Backend queries:
              • User.objects.filter(role='ADVISOR')
              • Annotate with active_students count
              • Filter where active_students < max_students
              • Calculate available_capacity
                ↓
              Returns: List sorted by capacity (most first)
                ↓
User ← Frontend ← JSON Response
```

### 3. Reassign Students

```
User → Frontend → POST /api/departments/advisors/reassign/
                  {
                    from_advisor_id: 5,
                    to_advisor_id: 8,
                    assignment_ids: [45, 46, 47]
                  }
                ↓
              Backend validates:
              • Both advisors exist and approved
              • Same department
              • Target has capacity
              • Assignments are active
                ↓
              Backend updates:
              • AdvisorAssignment.advisor = to_advisor
              • Save each assignment
                ↓
              Backend notifies:
              • Student: "Advisor Changed"
              • New Advisor: "New Student Assigned"
                ↓
              Returns: Success with count
                ↓
User ← Frontend ← { success: true, reassigned_count: 3 }
```

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Actions                                               │
└─────────────────────────────────────────────────────────────┘
         │
         ├─ Navigate to page
         │  └─→ useEffect() → fetchData()
         │      ├─→ getOverloadedAdvisors()
         │      └─→ getAvailableAdvisors()
         │
         ├─ Click overloaded advisor
         │  └─→ handleSelectAdvisor(advisor)
         │      └─→ setSelectedFromAdvisor(advisor)
         │
         ├─ Check/uncheck students
         │  └─→ handleToggleStudent(assignmentId)
         │      └─→ setSelectedStudents([...])
         │
         ├─ Click available advisor
         │  └─→ setSelectedToAdvisor(advisor)
         │      └─→ Validate capacity
         │
         └─ Click "Confirm Reassignment"
            └─→ handleReassign()
                ├─→ Validate selection
                ├─→ reassignStudents(data)
                ├─→ Show success message
                └─→ fetchData() (refresh)
```

## State Management

```javascript
// Component State
const [overloadedAdvisors, setOverloadedAdvisors] = useState([]);
const [availableAdvisors, setAvailableAdvisors] = useState([]);
const [selectedFromAdvisor, setSelectedFromAdvisor] = useState(null);
const [selectedToAdvisor, setSelectedToAdvisor] = useState(null);
const [selectedStudents, setSelectedStudents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [reassigning, setReassigning] = useState(false);
const [successMessage, setSuccessMessage] = useState(null);

// State Transitions
Initial → Loading → Loaded → Selecting → Confirming → Success → Refresh
```

## Database Query Patterns

### Get Overloaded Advisors

```python
advisors = User.objects.filter(
    role='ADVISOR',
    is_approved=True,
    department=department  # If department head
).annotate(
    active_students=Count(
        'supervised_students',
        filter=Q(supervised_students__is_active=True)
    )
).select_related('advisor_profile', 'department')

# Filter overloaded
overloaded = [a for a in advisors if a.active_students > a.advisor_profile.max_students]
```

### Get Available Advisors

```python
advisors = User.objects.filter(
    role='ADVISOR',
    is_approved=True,
    department=department
).annotate(
    active_students=Count(
        'supervised_students',
        filter=Q(supervised_students__is_active=True)
    )
).select_related('advisor_profile', 'department')

# Filter available
available = [a for a in advisors if a.active_students < a.advisor_profile.max_students]
```

### Reassign Students

```python
# Get assignments
assignments = AdvisorAssignment.objects.filter(
    id__in=assignment_ids,
    advisor=from_advisor,
    is_active=True
)

# Update each
for assignment in assignments:
    assignment.advisor = to_advisor
    assignment.save()
    
    # Send notifications
    NotificationService.create_notification(...)
```

## Security Flow

```
Request → Authentication Middleware
            ↓
          Check JWT token
            ↓
          Load user from token
            ↓
          Check role == 'DEPARTMENT_HEAD'
            ↓
          Check department permission
            ↓
          Execute view logic
            ↓
          Return response
```

## Notification Flow

```
Reassignment Complete
        ↓
    ┌───┴───┐
    ↓       ↓
Student   New Advisor
    ↓       ↓
Create    Create
Notification Notification
    ↓       ↓
Save to   Save to
Database  Database
    ↓       ↓
Real-time Real-time
Update    Update
(WebSocket) (WebSocket)
```

## Error Handling Flow

```
API Request
    ↓
Try Block
    ├─ Success → Return data
    └─ Error ↓
        ├─ Network Error → "Failed to connect"
        ├─ 400 Bad Request → Show validation error
        ├─ 403 Forbidden → "Permission denied"
        ├─ 404 Not Found → "Resource not found"
        └─ 500 Server Error → "Server error occurred"
            ↓
        Display error message
            ↓
        Offer retry option
```

## Performance Optimization

```
┌─────────────────────────────────────────┐
│  Optimization Strategies                │
├─────────────────────────────────────────┤
│                                         │
│  1. Database Level                      │
│     • Indexes on foreign keys           │
│     • Annotate queries (avoid N+1)      │
│     • Select/prefetch related           │
│                                         │
│  2. API Level                           │
│     • Pagination for large lists        │
│     • Caching advisor workload          │
│     • Batch operations                  │
│                                         │
│  3. Frontend Level                      │
│     • Lazy loading components           │
│     • Debounce search inputs            │
│     • Memoize expensive calculations    │
│     • Virtual scrolling for long lists  │
│                                         │
└─────────────────────────────────────────┘
```

## Scalability Considerations

```
Current: Single Department
    ↓
    ├─ 10 advisors
    ├─ 150 students
    └─ Response time: <500ms

Future: Multiple Departments
    ↓
    ├─ 100 advisors
    ├─ 1500 students
    └─ Optimizations needed:
        • Redis caching
        • Background jobs
        • Database sharding
        • Load balancing
```

## Monitoring & Logging

```
┌─────────────────────────────────────────┐
│  Metrics to Track                       │
├─────────────────────────────────────────┤
│                                         │
│  • API response times                   │
│  • Overload detection frequency         │
│  • Reassignment success rate            │
│  • Average workload per advisor         │
│  • Workload distribution (std dev)      │
│  • User engagement (page views)         │
│  • Error rates by endpoint              │
│                                         │
└─────────────────────────────────────────┘
```

---

This diagram provides a comprehensive view of how the advisor overload resolution system works from architecture to implementation details.
