# Department Head Final Report Approval & Certificate Issuance Workflow

## Overview

This document describes the new functionality added to allow Department Heads to review final reports and issue certificates to students who have completed their internships.

## New Workflow Steps

### Previous Workflow
1. Company submits final evaluation
2. Advisor completes final evaluation
3. System generates final report PDF
4. ~~Certificate automatically issued~~ ❌

### New Enhanced Workflow
1. Company submits final evaluation
2. Advisor completes final evaluation  
3. **NEW:** System sends final report to Department Head for review
4. **NEW:** Department Head reviews and approves/rejects the report
5. **NEW:** Department Head issues official certificate to student
6. Student receives certificate notification

## Database Changes

### FinalReport Model Updates
```python
# New fields added to FinalReport model:
department_head = models.ForeignKey(User, ...)  # Who reviewed
department_review = models.TextField(...)       # Review comments
department_approved = models.BooleanField(...)  # Approval status
department_reviewed_at = models.DateTimeField(...)  # When reviewed

# Certificate tracking
certificate_issued = models.BooleanField(...)
certificate_issued_at = models.DateTimeField(...)
certificate_issued_by = models.ForeignKey(User, ...)

# Updated status choices
STATUS_CHOICES = [
    ('PENDING_ADVISOR', 'Pending Advisor Review'),
    ('SUBMITTED_TO_DEPARTMENT', 'Submitted to Department Head'),  # NEW
    ('APPROVED_BY_DEPARTMENT', 'Approved by Department Head'),    # NEW
    ('CERTIFICATE_ISSUED', 'Certificate Issued'),                 # NEW
    ('COMPLETED', 'Completed'),
]
```

## API Endpoints

### New Department Head Endpoints

#### 1. Approve/Reject Final Report
```
PATCH /api/reports/final/{id}/department-approve/
```
**Body:**
```json
{
  "action": "approve",  // or "reject"
  "review_comments": "Excellent work. Approved for certificate."
}
```

#### 2. Issue Certificate
```
POST /api/reports/final/{id}/issue-certificate/
```
**Response:**
```json
{
  "message": "Certificate issued successfully!",
  "certificate_id": "CERT-2026-CS-001",
  "verification_code": "ABC123XYZ789",
  "student_name": "John Doe",
  "pdf_url": "/media/certificates/cert_001.pdf"
}
```

#### 3. Get Department Certificates
```
GET /api/reports/certificates/department/
```

#### 4. Get Pending Approvals
```
GET /api/reports/final/department/pending-approvals/
```

## Frontend Updates

### DepartmentFinalReports.jsx
- Added approval/rejection interface
- Added certificate issuance functionality  
- Updated status badges and statistics
- Enhanced detail panel with approval actions

### New UI Features
1. **Two-step approval process:**
   - Step 1: Review and approve/reject report
   - Step 2: Issue certificate (only after approval)

2. **Enhanced status tracking:**
   - Pending Advisor → Ready for Review → Approved → Certificate Issued

3. **Notification system:**
   - Advisors notified when reports are rejected
   - Students notified when reports are approved/rejected
   - Students notified when certificates are issued

## Notification Flow

### When Advisor Submits Final Report
```
Advisor completes evaluation
    ↓
System sends to Department Head
    ↓
Department Head receives notification:
"Final Report Ready for Review"
```

### When Department Head Approves
```
Department Head approves report
    ↓
Student receives notification:
"Final Report Approved"
    ↓
Advisor receives notification:
"Final Report Approved by Department"
```

### When Department Head Rejects
```
Department Head rejects report
    ↓
Report status → PENDING_ADVISOR
    ↓
Advisor receives notification:
"Final Report Requires Revision"
    ↓
Student receives notification:
"Final Report Requires Revision"
```

### When Certificate is Issued
```
Department Head issues certificate
    ↓
Certificate PDF generated
    ↓
Student receives notification:
"🎉 Certificate Issued!"
    ↓
Advisor receives notification:
"Certificate Issued"
```

## Email Notifications

### New Email Templates Added
1. `send_final_report_pending_department_head_email()`
2. `send_final_report_completed_email()` (updated)

### Email Content Examples

**To Department Head:**
```
Subject: Final Report Review Required — John Doe

A final internship report is ready for your review and approval.

Student: John Doe
Advisor: Dr. Smith  
Department: Computer Science
Final Grade: A

Please review the report and approve it for certificate generation.
[Review Report Button]
```

**To Student (Approval):**
```
Subject: Final Report Approved

Your final internship report has been approved by the Department Head. 
Your certificate will be issued soon.
```

**To Student (Certificate Issued):**
```
Subject: 🎉 Certificate Issued!

Congratulations! Your internship certificate (CERT-2026-CS-001) has been issued.
You can download it from your dashboard.

Certificate ID: CERT-2026-CS-001
Verification Code: ABC123XYZ789
```

## Migration

Run the following to apply database changes:
```bash
cd Backend
python manage.py migrate
```

## Security & Permissions

- Only Department Heads can approve/reject reports in their department
- Only Department Heads can issue certificates  
- Cross-department access is prevented
- All actions are logged with timestamps and user tracking

## Testing the Workflow

1. **Setup:** Ensure you have a Department Head user in the system
2. **Create test data:** Complete internship with final evaluations
3. **Test approval:** Login as Department Head and approve a report
4. **Test certificate:** Issue certificate and verify PDF generation
5. **Test notifications:** Check that all parties receive appropriate notifications

## Benefits

1. **Quality Control:** Department Head review ensures academic standards
2. **Institutional Oversight:** Proper approval chain for official certificates  
3. **Audit Trail:** Complete tracking of who approved what and when
4. **Flexibility:** Reports can be sent back for revision if needed
5. **Professional Process:** Matches real-world academic certification workflows