# Advisor Registration Flow - Complete Process

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPARTMENT HEAD                               │
│                                                                  │
│  1. Navigates to "Add Advisor" page                            │
│     • From Advisors page (click "Add Advisor" button)          │
│     • From Dashboard (click "Add Advisor" in Quick Nav)        │
│                                                                  │
│  2. Fills in Advisor Details:                                  │
│     ✓ Full Name: "Dr. John Doe"                               │
│     ✓ Email: "advisor@university.edu"                         │
│     ✓ Phone: "+251 912 345 678"                               │
│     ✓ Staff ID: "STAFF-2024-001"                              │
│     ✓ Max Students: 15                                         │
│                                                                  │
│  3. Clicks "Register Advisor" button                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND VALIDATION                           │
│                                                                  │
│  • Check all required fields filled                             │
│  • Validate email format                                        │
│  • Show loading spinner                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API REQUEST                                   │
│                                                                  │
│  POST /api/departments/add-advisor/                             │
│  {                                                               │
│    "full_name": "Dr. John Doe",                                │
│    "email": "advisor@university.edu",                          │
│    "phone_number": "+251 912 345 678",                         │
│    "staff_id": "STAFF-2024-001",                               │
│    "max_students": 15                                           │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                            │
│                                                                  │
│  Step 1: Permission Check                                       │
│  ✓ Verify user is Department Head                              │
│                                                                  │
│  Step 2: Validation                                             │
│  ✓ Check all required fields present                           │
│  ✓ Verify email is unique                                      │
│  ✓ Verify staff ID is unique                                   │
│  ✓ Get department                                               │
│                                                                  │
│  Step 3: Generate Password                                      │
│  ✓ Create 12-character random password                         │
│  ✓ Example: "aB3dE5gH7jK9"                                     │
│                                                                  │
│  Step 4: Create User Account                                    │
│  ✓ Create User with ADVISOR role                               │
│  ✓ Set password (hashed)                                       │
│  ✓ Assign to department                                         │
│  ✓ Auto-approve (is_approved = True)                           │
│                                                                  │
│  Step 5: Create Advisor Profile                                 │
│  ✓ Link to User account                                        │
│  ✓ Store full_name, phone, staff_id                           │
│  ✓ Set max_students                                            │
│                                                                  │
│  Step 6: Send Email Notification                                │
│  ✓ Compose welcome email                                       │
│  ✓ Include login credentials                                   │
│  ✓ Send to advisor's email                                     │
│  ✓ Log any errors (graceful failure)                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL SENT                                    │
│                                                                  │
│  To: advisor@university.edu                                     │
│  Subject: Welcome to Internship Management System               │
│                                                                  │
│  Body:                                                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Dear Dr. John Doe,                                        │ │
│  │                                                            │ │
│  │ Your advisor account has been created by the              │ │
│  │ Department Head.                                           │ │
│  │                                                            │ │
│  │ Login Credentials:                                         │ │
│  │ Email: advisor@university.edu                             │ │
│  │ Password: aB3dE5gH7jK9                                    │ │
│  │                                                            │ │
│  │ Please login at: http://localhost:3000/login              │ │
│  │                                                            │ │
│  │ After logging in, we recommend changing your              │ │
│  │ password in the settings.                                  │ │
│  │                                                            │ │
│  │ Best regards,                                              │ │
│  │ Internship Management System                               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API RESPONSE                                  │
│                                                                  │
│  {                                                               │
│    "success": true,                                             │
│    "message": "Advisor Dr. John Doe has been successfully      │
│                registered. Login credentials have been sent     │
│                to advisor@university.edu.",                     │
│    "advisor": {                                                 │
│      "id": 5,                                                   │
│      "full_name": "Dr. John Doe",                              │
│      "email": "advisor@university.edu",                        │
│      "staff_id": "STAFF-2024-001",                             │
│      "max_students": 15                                         │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND SUCCESS                              │
│                                                                  │
│  • Display success alert (green)                                │
│  • Show message: "Advisor registered successfully!"            │
│  • Reset form                                                   │
│  • Auto-redirect to Advisors page (2 seconds)                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ADVISOR RECEIVES EMAIL                        │
│                                                                  │
│  1. Opens email inbox                                           │
│  2. Finds welcome email                                         │
│  3. Reads login credentials                                     │
│  4. Clicks login link or navigates to login page               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ADVISOR LOGS IN                               │
│                                                                  │
│  1. Goes to /login page                                         │
│  2. Enters email: advisor@university.edu                        │
│  3. Enters password: aB3dE5gH7jK9                              │
│  4. Clicks "Login"                                              │
│  5. Redirected to Advisor Dashboard                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ADVISOR DASHBOARD                             │
│                                                                  │
│  • Access to all advisor features                               │
│  • Can view assigned students                                   │
│  • Can submit reports                                           │
│  • Can change password in settings                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Alternative Flows

### ❌ Error Flow 1: Email Already Exists

```
Department Head fills form
        ↓
Clicks "Register Advisor"
        ↓
Backend checks email uniqueness
        ↓
Email already exists!
        ↓
API returns error:
{
  "error": "An account with this email already exists."
}
        ↓
Frontend shows error alert (red)
        ↓
Department Head corrects email
        ↓
Tries again
```

### ❌ Error Flow 2: Staff ID Already Exists

```
Department Head fills form
        ↓
Clicks "Register Advisor"
        ↓
Backend checks staff ID uniqueness
        ↓
Staff ID already exists!
        ↓
API returns error:
{
  "error": "An advisor with this staff ID already exists."
}
        ↓
Frontend shows error alert (red)
        ↓
Department Head corrects staff ID
        ↓
Tries again
```

### ⚠️ Warning Flow: Email Fails to Send

```
Department Head registers advisor
        ↓
Backend creates account successfully
        ↓
Backend tries to send email
        ↓
Email server error!
        ↓
Error logged to console
        ↓
API still returns success
        ↓
Frontend shows success message
        ↓
Department Head manually shares credentials
```

---

## 📊 Data Flow

```
┌──────────────┐
│   Frontend   │
│   Form Data  │
└──────┬───────┘
       │
       │ POST /api/departments/add-advisor/
       │ { full_name, email, phone, staff_id, max_students }
       ↓
┌──────────────┐
│   Backend    │
│   Validation │
└──────┬───────┘
       │
       │ Create User
       ↓
┌──────────────┐
│   Database   │
│   User Table │
└──────┬───────┘
       │
       │ Create Profile
       ↓
┌──────────────┐
│   Database   │
│ Advisor Table│
└──────┬───────┘
       │
       │ Send Email
       ↓
┌──────────────┐
│ Email Server │
│  SMTP Send   │
└──────┬───────┘
       │
       │ Email Delivered
       ↓
┌──────────────┐
│   Advisor    │
│   Inbox      │
└──────────────┘
```

---

## 🎯 Success Criteria

✅ **Account Created**: User and AdvisorProfile records in database
✅ **Password Generated**: Secure 12-character random password
✅ **Email Sent**: Welcome email delivered to advisor
✅ **Auto-Approved**: Advisor can login immediately
✅ **Department Assigned**: Advisor linked to correct department
✅ **Success Message**: Department Head sees confirmation
✅ **Advisor Notified**: Advisor receives credentials via email

---

## 🔐 Security Flow

```
1. Permission Check
   └─> Only Department Heads can register advisors

2. Email Validation
   └─> Must be unique in system

3. Staff ID Validation
   └─> Must be unique in system

4. Password Generation
   └─> Secure random 12-character password
   └─> Hashed before storing in database

5. Auto-Approval
   └─> Trusted by Department Head
   └─> No UIL approval needed

6. Email Delivery
   └─> Credentials sent securely via email
   └─> Advisor must have access to email to login
```

---

## 📈 Timeline

```
T+0s    Department Head clicks "Register Advisor"
T+0.1s  Frontend validation passes
T+0.2s  API request sent
T+0.3s  Backend validation passes
T+0.4s  User account created
T+0.5s  Advisor profile created
T+0.6s  Email sent to SMTP server
T+1s    API response received
T+1.1s  Success message displayed
T+3s    Auto-redirect to Advisors page
T+5s    Email delivered to advisor's inbox
T+?     Advisor opens email and logs in
```

---

## 🎨 UI States

### 1. Initial State
- Empty form
- All fields enabled
- "Register Advisor" button enabled

### 2. Filling State
- User typing in fields
- Real-time validation (email format)
- Fields turn green when valid

### 3. Submitting State
- Loading spinner on button
- Button text: "Registering..."
- All fields disabled
- Form cannot be submitted again

### 4. Success State
- Green success alert appears
- Message: "Advisor registered successfully!"
- Form resets to empty
- Auto-redirect countdown starts

### 5. Error State
- Red error alert appears
- Specific error message shown
- Form remains filled
- User can correct and retry

---

## 🔗 Integration Points

1. **Frontend → Backend**: API call to `/api/departments/add-advisor/`
2. **Backend → Database**: Create User and AdvisorProfile records
3. **Backend → Email Server**: Send welcome email via SMTP
4. **Email Server → Advisor**: Deliver email to inbox
5. **Advisor → Frontend**: Login with credentials
6. **Frontend → Backend**: Authentication request
7. **Backend → Frontend**: JWT token + user data
8. **Frontend**: Redirect to Advisor Dashboard

---

**Status**: ✅ Fully Implemented and Working
**Last Updated**: 2026-04-27
