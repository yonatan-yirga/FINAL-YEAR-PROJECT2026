# Django Backend URLs - Visual Structure 🗺️

## 🌐 Base URL: `http://localhost:8000`

---

## 📊 URL Structure Tree

```
http://localhost:8000/
│
├── /api/                                    # API Root
│   ├── /auth/                              # Authentication
│   │   ├── /login/                         # POST - Login
│   │   ├── /register/                      # POST - Register
│   │   ├── /logout/                        # POST - Logout
│   │   ├── /profile/                       # GET/PUT - User profile
│   │   ├── /change-password/               # POST - Change password
│   │   └── /refresh/                       # POST - Refresh token
│   │
│   ├── /oauth/                             # OAuth
│   │   ├── /exchange-token/                # POST - Exchange token
│   │   ├── /google/                        # POST - Google OAuth
│   │   └── /github/                        # POST - GitHub OAuth
│   │
│   ├── /registrations/                     # User Registrations
│   │   ├── /                               # GET/POST - List/Create
│   │   └── /<id>/                          # GET/PUT/DELETE - Detail
│   │       ├── /approve/                   # POST - Approve
│   │       └── /reject/                    # POST - Reject
│   │
│   ├── /departments/                       # Departments
│   │   ├── /                               # GET/POST - List/Create
│   │   ├── /<id>/manage/                   # GET/PUT/DELETE - Manage
│   │   ├── /statistics/                    # GET - Statistics
│   │   ├── /students/                      # GET - Students list
│   │   ├── /advisors/                      # GET - Advisors list
│   │   ├── /companies/                     # GET - Companies list
│   │   ├── /unassigned-students/           # GET - Unassigned students
│   │   ├── /assign-advisor/                # POST - Assign advisor
│   │   ├── /add-advisor/                   # POST - Add advisor
│   │   ├── /assign-company/                # POST - Assign company
│   │   ├── /reports/                       # GET - Reports
│   │   ├── /decision-intelligence/         # GET - Decision data
│   │   ├── /validate-students/             # POST - Validate students
│   │   ├── /activity/                      # GET - Activity feed
│   │   ├── /cycles/                        # GET/POST - Cycles
│   │   └── /escalations/                   # GET/POST - Escalations
│   │
│   ├── /internships/                       # Internships
│   │   ├── /public/                        # GET - Public list (no auth)
│   │   ├── /                               # GET - All internships
│   │   ├── /create/                        # POST - Create
│   │   ├── /my-internships/                # GET - Company's internships
│   │   └── /<id>/                          # GET - Detail
│   │       ├── /update/                    # PUT - Update
│   │       ├── /delete/                    # DELETE - Delete
│   │       ├── /close/                     # POST - Close
│   │       └── /reopen/                    # POST - Reopen
│   │
│   ├── /applications/                      # Applications
│   │   ├── /                               # POST - Apply
│   │   ├── /my-applications/               # GET - Student's applications
│   │   ├── /my-feedback/                   # GET - Student's feedback
│   │   ├── /company-applications/          # GET - Company's applications
│   │   └── /<id>/                          # GET - Detail
│   │       ├── /withdraw/                  # POST - Withdraw
│   │       ├── /confirm/                   # POST - Confirm placement
│   │       ├── /accept/                    # POST - Accept (company)
│   │       └── /reject/                    # POST - Reject (company)
│   │
│   ├── /advisors/                          # Advisors
│   │   ├── /                               # GET - List advisors
│   │   ├── /my-students/                   # GET - Advisor's students
│   │   ├── /students/<id>/                 # GET - Student detail
│   │   │   └── /evaluate/                  # POST - Evaluate student
│   │   ├── /reports/                       # GET - Reports
│   │   └── /statistics/                    # GET - Statistics
│   │
│   ├── /reports/                           # Reports
│   │   ├── /                               # GET/POST - List/Create
│   │   ├── /<id>/                          # GET/PUT/DELETE - Detail
│   │   ├── /student/<id>/                  # GET - Student reports
│   │   ├── /company/<id>/                  # GET - Company reports
│   │   └── /advisor/<id>/                  # GET - Advisor reports
│   │
│   ├── /certificates/                      # Certificates
│   │   ├── /                               # GET/POST - List/Create
│   │   ├── /<id>/                          # GET - Detail
│   │   ├── /student/<id>/                  # GET - Student certificates
│   │   ├── /<id>/verify/                   # POST - Verify
│   │   └── /<id>/download/                 # GET - Download
│   │
│   ├── /notifications/                     # Notifications
│   │   ├── /                               # GET - List
│   │   ├── /<id>/                          # GET - Detail
│   │   ├── /<id>/read/                     # POST - Mark as read
│   │   ├── /read-all/                      # POST - Mark all read
│   │   └── /clear-all/                     # DELETE - Clear all
│   │
│   ├── /recommendations/                   # Recommendations
│   │   ├── /                               # GET - Get recommendations
│   │   ├── /internships/                   # GET - Recommended internships
│   │   ├── /students/                      # GET - Recommended students
│   │   └── /feedback/                      # POST - Provide feedback
│   │
│   └── /messages/                          # Messages
│       ├── /                               # GET/POST - List/Send
│       ├── /<id>/                          # GET - Conversation detail
│       ├── /unread/                        # GET - Unread count
│       ├── /<id>/read/                     # POST - Mark as read
│       └── /<id>/                          # DELETE - Delete message
│
├── /admin/                                  # Django Admin Panel
│   ├── /                                   # Admin dashboard
│   ├── /login/                             # Admin login
│   ├── /logout/                            # Admin logout
│   ├── /accounts/                          # User management
│   ├── /internships/                       # Internship management
│   ├── /applications/                      # Application management
│   ├── /departments/                       # Department management
│   └── /...                                # Other models
│
├── /api-auth/                              # DRF Authentication (Dev)
│   ├── /login/                             # DRF login page
│   └── /logout/                            # DRF logout page
│
├── /media/                                 # Media Files (Dev)
│   └── /<path>                             # Uploaded files
│
├── /media-browser/                         # Media Browser (Dev)
│   └── /<path>                             # Browse media files
│
└── /ws/                                    # WebSocket Endpoints
    ├── /chat/<room>/                       # Chat WebSocket
    ├── /notifications/                     # Notifications WebSocket
    └── /video-call/<room>/                 # Video call WebSocket
```

---

## 🎯 Most Used Endpoints

### For Students 👨‍🎓
```
GET    /api/internships/public/              - Browse internships
POST   /api/applications/                    - Apply to internship
GET    /api/applications/my-applications/    - View my applications
GET    /api/auth/profile/                    - View my profile
GET    /api/messages/                        - View messages
```

### For Companies 🏢
```
POST   /api/internships/create/              - Post internship
GET    /api/internships/my-internships/      - View my internships
GET    /api/applications/company-applications/ - View applications
POST   /api/applications/<id>/accept/        - Accept application
POST   /api/applications/<id>/reject/        - Reject application
```

### For Advisors 👨‍🏫
```
GET    /api/advisors/my-students/            - View my students
POST   /api/advisors/students/<id>/evaluate/ - Evaluate student
GET    /api/advisors/statistics/             - View statistics
GET    /api/advisors/reports/                - View reports
```

### For Department Heads 🎓
```
GET    /api/departments/statistics/          - Department statistics
GET    /api/departments/students/            - View students
POST   /api/departments/assign-advisor/      - Assign advisor
GET    /api/departments/reports/             - View reports
POST   /api/departments/validate-students/   - Validate students
```

### For Admins 👑
```
GET    /admin/                               - Admin dashboard
GET    /api/registrations/                   - View registrations
POST   /api/registrations/<id>/approve/      - Approve registration
GET    /api/departments/                     - Manage departments
```

---

## 🔑 Authentication Flow

```
1. Register
   POST /api/auth/register/
   Body: { email, password, role, ... }
   
2. Login
   POST /api/auth/login/
   Body: { email, password }
   Response: { access_token, refresh_token }
   
3. Use Token
   Headers: { Authorization: "Bearer <access_token>" }
   
4. Refresh Token (when expired)
   POST /api/auth/refresh/
   Body: { refresh_token }
   Response: { access_token }
```

---

## 📱 Frontend → Backend Mapping

### Landing Page
```
Frontend: http://localhost:5173/
Backend:  GET /api/internships/public/
```

### Login Page
```
Frontend: http://localhost:5173/login
Backend:  POST /api/auth/login/
```

### Search Internships
```
Frontend: http://localhost:5173/student/search-internships
Backend:  GET /api/internships/public/
```

### My Applications
```
Frontend: http://localhost:5173/student/my-applications
Backend:  GET /api/applications/my-applications/
```

### Partner Organizations
```
Frontend: http://localhost:5173/partner-organizations
Backend:  GET /api/internships/public/ (grouped by company)
```

### Company Dashboard
```
Frontend: http://localhost:5173/company/dashboard
Backend:  GET /api/internships/my-internships/
          GET /api/applications/company-applications/
```

### Advisor Dashboard
```
Frontend: http://localhost:5173/advisor/dashboard
Backend:  GET /api/advisors/my-students/
          GET /api/advisors/statistics/
```

### Department Dashboard
```
Frontend: http://localhost:5173/department/dashboard
Backend:  GET /api/departments/statistics/
          GET /api/departments/students/
```

---

## 🧪 Testing URLs

### Browser Testing
```
✅ http://localhost:8000/api/
✅ http://localhost:8000/api/internships/public/
✅ http://localhost:8000/admin/
```

### cURL Testing
```bash
# Test API root
curl http://localhost:8000/api/

# Test public internships
curl http://localhost:8000/api/internships/public/

# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"test1234"}'
```

### Python Testing
```python
import requests

# Test API
response = requests.get('http://localhost:8000/api/')
print(response.json())

# Test public internships
response = requests.get('http://localhost:8000/api/internships/public/')
print(response.json())
```

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### 2. Test API
```bash
curl http://localhost:8000/api/
```

### 3. Access Admin
```
http://localhost:8000/admin/
Username: admin@internship.com
Password: test1234
```

### 4. View All URLs
```bash
cd Backend
python manage.py show_urls
```

---

## 📊 URL Statistics

- **Total API Endpoints**: ~100+
- **Public Endpoints**: 2 (no auth required)
- **Authenticated Endpoints**: ~98
- **Admin Endpoints**: ~50+
- **WebSocket Endpoints**: 3

---

## 🔒 Security

### Public Endpoints (No Auth)
```
GET /api/
GET /api/internships/public/
```

### Authenticated Endpoints (Token Required)
```
All other /api/* endpoints
```

### Admin Only
```
All /admin/* endpoints
```

---

## 📚 Documentation

**Full Details**: See `DJANGO_BACKEND_URLS.md`
**Quick Reference**: See `BACKEND_URLS_QUICK_REFERENCE.md`

---

## ✅ Summary

**Base URL**: `http://localhost:8000`
**API Root**: `http://localhost:8000/api/`
**Admin Panel**: `http://localhost:8000/admin/`
**Total Endpoints**: 100+
**Status**: ✅ All documented
