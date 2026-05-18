# Advisor Overload Resolution System

## Overview
This document describes the system for detecting and resolving advisor overload situations.

## Definition of "Overloaded"

An advisor is considered **OVERLOADED** when:
- Their active student count exceeds their `max_students` limit
- Default `max_students` is typically 15
- Status indicators:
  - **Normal**: 0-10 students (Green)
  - **High Load**: 11-14 students (Orange)
  - **Overloaded**: 15+ students (Red)

## Features Implemented

### 1. Visual Indicators
- **Assign Advisor Page**: Shows workload bar with color coding
- **Advisors List**: Shows "Overloaded" badge for advisors exceeding limit
- **Dashboard**: Shows count of overloaded advisors

### 2. Assignment Warnings
- System warns when assigning to an overloaded advisor
- Department Head can still proceed (with confirmation)
- Suggests alternative advisors with lower workload

### 3. Redistribution Function
- Automatically suggests redistribution when advisors are overloaded
- Balances workload across available advisors
- Maintains student-advisor relationships when possible

## Implementation

### Backend API Endpoints

#### 1. Get Overloaded Advisors
```
GET /api/departments/advisors/overloaded/
```

Returns list of advisors who exceed their max_students limit.

#### 2. Redistribute Students
```
POST /api/departments/advisors/redistribute/
```

Request body:
```json
{
  "from_advisor_id": 5,
  "to_advisor_id": 8,
  "student_ids": [12, 15, 18]
}
```

Moves specified students from one advisor to another.

#### 3. Auto-Balance Workload
```
POST /api/departments/advisors/auto-balance/
```

Automatically redistributes students to balance workload across all advisors.

### Frontend Components

#### 1. Overload Warning Modal
Shows when attempting to assign to overloaded advisor:
- Current workload
- Recommended alternatives
- Option to proceed anyway

#### 2. Redistribution Tool
Accessible from Advisors page:
- Shows overloaded advisors
- Drag-and-drop interface to move students
- Suggests optimal distribution

#### 3. Dashboard Alert
Shows on Department Dashboard:
- Count of overloaded advisors
- Quick link to redistribution tool
- Visual indicator (red badge)

## Resolution Strategies

### Strategy 1: Manual Redistribution
1. Go to `/department/advisors`
2. Click on overloaded advisor
3. View their students
4. Select students to reassign
5. Choose new advisor
6. Confirm redistribution

### Strategy 2: Auto-Balance
1. Go to `/department/advisors`
2. Click "Auto-Balance Workload" button
3. System calculates optimal distribution
4. Review suggested changes
5. Confirm to apply

### Strategy 3: Add New Advisor
1. Go to `/department/add-advisor`
2. Register new advisor
3. System automatically suggests students to assign
4. Confirm assignments

## Business Rules

### Assignment Rules
1. **Prevent Overload**: Warn but don't block assignments to overloaded advisors
2. **Suggest Alternatives**: Always show advisors with lower workload first
3. **Maintain Continuity**: Avoid reassigning students mid-internship unless critical

### Redistribution Rules
1. **Student Consent**: Notify students when advisor changes
2. **Timing**: Prefer redistribution at cycle start/end
3. **Expertise Match**: Consider advisor expertise when redistributing
4. **Geographic Proximity**: Consider advising location when possible

### Notification Rules
1. **Advisor Notification**: Notify advisor when assigned new students
2. **Student Notification**: Notify student when advisor changes
3. **Department Head Alert**: Alert when any advisor becomes overloaded

## Database Schema

### AdvisorProfile
```python
class AdvisorProfile(models.Model):
    max_students = models.IntegerField(default=15)
    current_load = models.IntegerField(default=0)  # Cached count
    is_overloaded = models.BooleanField(default=False)  # Cached flag
```

### AdvisorAssignment
```python
class AdvisorAssignment(models.Model):
    student = models.ForeignKey(User, related_name='student_advisor_assignments')
    advisor = models.ForeignKey(User, related_name='supervised_students')
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    reassigned_from = models.ForeignKey('self', null=True, blank=True)
    reassignment_reason = models.TextField(null=True, blank=True)
```

## Monitoring & Analytics

### Metrics to Track
1. **Average Workload**: Mean students per advisor
2. **Workload Distribution**: Standard deviation
3. **Overload Duration**: How long advisors stay overloaded
4. **Reassignment Frequency**: How often students are reassigned
5. **Student Outcomes**: Performance correlation with advisor workload

### Reports
1. **Workload Report**: Shows distribution across all advisors
2. **Overload History**: Tracks overload incidents over time
3. **Redistribution Log**: Audit trail of all reassignments

## Testing Scenarios

### Test Case 1: Assign to Overloaded Advisor
1. Advisor has 15 active students (at limit)
2. Attempt to assign 16th student
3. System shows warning
4. Department Head confirms
5. Assignment succeeds with warning logged

### Test Case 2: Auto-Balance
1. Advisor A has 18 students (overloaded)
2. Advisor B has 5 students (underutilized)
3. Run auto-balance
4. System moves 6-7 students from A to B
5. Both advisors now have ~11-12 students

### Test Case 3: Add New Advisor
1. All advisors overloaded
2. Add new advisor
3. System suggests 10 students to assign
4. Department Head reviews and confirms
5. New advisor starts with balanced load

## Future Enhancements

### Phase 1: Basic (Current)
- ✅ Visual indicators
- ✅ Manual redistribution
- ✅ Warnings on assignment

### Phase 2: Advanced
- 🔄 Auto-balance algorithm
- 🔄 Predictive overload alerts
- 🔄 Student preference consideration

### Phase 3: AI-Powered
- 📋 ML-based optimal matching
- 📋 Predictive workload forecasting
- 📋 Automated redistribution suggestions

## Configuration

### System Settings
```python
# settings.py
ADVISOR_WORKLOAD_SETTINGS = {
    'DEFAULT_MAX_STUDENTS': 15,
    'WARNING_THRESHOLD': 12,  # Show warning at 80%
    'CRITICAL_THRESHOLD': 15,  # Mark as overloaded
    'AUTO_BALANCE_ENABLED': True,
    'NOTIFY_ON_OVERLOAD': True,
}
```

### Department-Specific Settings
Each department can override defaults:
- Computer Science: max_students = 20
- Engineering: max_students = 15
- Business: max_students = 25

## Support & Troubleshooting

### Common Issues

#### Issue 1: Advisor Shows as Overloaded but Count is Correct
**Cause**: Cached `is_overloaded` flag not updated
**Solution**: Run `python manage.py update_advisor_workload`

#### Issue 2: Cannot Reassign Student
**Cause**: Student has active internship
**Solution**: Wait until internship ends or use force reassign

#### Issue 3: Auto-Balance Not Working
**Cause**: All advisors at similar capacity
**Solution**: Add new advisor or increase max_students limit

## Contact & Support

For issues or questions:
- Check logs: `Backend/logs/advisor_workload.log`
- Run diagnostic: `python manage.py check_advisor_workload`
- Contact: Department Head or System Admin
