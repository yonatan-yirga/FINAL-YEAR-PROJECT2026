# Django Backend URLs - Complete Reference

## 🌐 Base URL
```
Development: http://localhost:8000
Production: https://your-production-url.com
```

---

## 📋 All Available Endpoints

### 🔐 Authentication (`/api/auth/`)
```
POST   /api/auth/register/              - Register new user
POST   /api/auth/login/                 - Login user
POST   /api/auth/logout/                - Logout user
POST   /api/auth/refresh/               - Refresh token
GET    /api/auth/profile/               - Get user profile
PUT    /api/auth/profile/               - Update user profile
POST   /api/auth/change-password/       - Change password
POST   /api/auth/reset-password/        - Reset password
POST   /api/auth/verify-email/          - Verify email
```

### 🔑 OAuth (`/api/oauth/`)
```
POST   /api/oauth/exchange-token/       - Exchange OAuth token
GET    /api/oauth/callback/             - OAuth callback
POST   /api/oauth/google/               - Google OAuth
POST   /api/oauth/github/               - GitHub OAuth
```

### 📝 Registrations (`/api/registrations/`)
```
GET    /api/registrations/              - List all registrations
POST   /api/registrations/              - Create registration
GET    /api/registrations/<id>/         - Get registration detail
PUT    /api/registrations/<id>/         - Update registration
DELETE /api/registrations/<id>/         - Delete registration
POST   /api/registrations/<id>/approve/ - Approve registration
POST   /api/registrations/<id>/reject/  - Reject registration
```

### 🏢 Departments (`/api/departments/`)
```
# Department Management
GET    /api/departments/                           - List departments
POST   /api/departments/                           - Create department
GET    /api/departments/<id>/manage/               - Get department detail
PUT    /api/departments/<id>/manage/               - Update department
DELETE /api/departments/<id>/manage/               - Delete department

# Statistics & Lists
GET    /api/departments/statistics/                - Department statistics
GET    /api/departments/students/                  - List students
GET    /api/departments/advisors/                  - List advisors
GET    /api/departments/advisors/<id>/students/    - Advisor's students
GET    /api/departments/companies/                 - List companies

# Advisor Management
GET    /api/departments/unassigned-students/       - Unassigned students
POST   /api/departments/assign-advisor/            - Assign advisor to student
POST   /api/departments/add-advisor/               - Add new advisor

# Company Assignment
POST   /api/departments/assign-company/            - Assign company to student

# Reports & Intelligence
GET    /api/departments/reports/                   - Department reports
GET    /api/departments/decision-intelligence/     - Decision intelligence data

# Student Validation
POST   /api/departments/validate-students/         - Validate students

# Activity & Completion
GET    /api/departments/activity/                  - Activity feed
POST   /api/departments/students/<id>/complete/    - Mark student completed

# Cycle Management
GET    /api/departments/cycles/                    - List cycles
POST   /api/departments/cycles/create/             - Create cycle
PUT    /api/departments/<id>/cycles/update/        - Update cycle
POST   /api/departments/<id>/cycles/activate/      - Activate cycle
POST   /api/departments/<id>/cycles/close/         - Close cycle
DELETE /api/departments/<id>/cycles/delete/        - Delete cycle

# Escalation Management
GET    /api/departments/escalations/               - List escalations
POST   /api/departments/escalations/create/        - Create escalation
POST   /api/departments/<id>/escalations/resolve/  - Resolve escalation
POST   /api/departments/<id>/escalations/escalate-to-uil/ - Escalate to UIL
```

### 💼 Internships (`/api/internships/`)
```
# Public Access
GET    /api/internships/public/         - Public internships list (no auth)

# List & Create
GET    /api/internships/                - List all internships
POST   /api/internships/create/         - Create internship

# Company's Internships
GET    /api/internships/my-internships/ - Company's own internships

# Detail & Management
GET    /api/internships/<id>/           - Get internship detail
PUT    /api/internships/<id>/update/    - Update internship
DELETE /api/internships/<id>/delete/    - Delete internship

# Actions
POST   /api/internships/<id>/close/     - Close internship
POST   /api/internships/<id>/reopen/    - Reopen internship
```

### 📄 Applications (`/api/applications/`)
```
# Student Endpoints
POST   /api/applications/               - Apply to internship
GET    /api/applications/my-applications/ - Student's applications
GET    /api/applications/my-feedback/   - Student's feedback
GET    /api/applications/<id>/          - Application detail
POST   /api/applications/<id>/withdraw/ - Withdraw application
POST   /api/applications/<id>/confirm/  - Confirm placement

# Company Endpoints
GET    /api/applications/company-applications/ - Company's applications
POST   /api/applications/<id>/accept/   - Accept application
POST   /api/applications/<id>/reject/   - Reject application
```

### 👨‍🏫 Advisors (`/api/advisors/`)
```
GET    /api/advisors/                   - List advisors
GET    /api/advisors/my-students/       - Advisor's students
GET    /api/advisors/students/<id>/     - Student detail
POST   /api/advisors/students/<id>/evaluate/ - Evaluate student
GET    /api/advisors/reports/           - Advisor reports
GET    /api/advisors/statistics/        - Advisor statistics
```

### 📊 Reports (`/api/reports/`)
```
GET    /api/reports/                    - List reports
POST   /api/reports/                    - Create report
GET    /api/reports/<id>/               - Report detail
PUT    /api/reports/<id>/               - Update report
DELETE /api/reports/<id>/               - Delete report
GET    /api/reports/student/<id>/       - Student reports
GET    /api/reports/company/<id>/       - Company reports
GET    /api/reports/advisor/<id>/       - Advisor reports
```

### 🎓 Certificates (`/api/certificates/`)
```
GET    /api/certificates/               - List certificates
POST   /api/certificates/               - Create certificate
GET    /api/certificates/<id>/          - Certificate detail
GET    /api/certificates/student/<id>/  - Student certificates
POST   /api/certificates/<id>/verify/   - Verify certificate
GET    /api/certificates/<id>/download/ - Download certificate
```

### 🔔 Notifications (`/api/notifications/`)
```
GET    /api/notifications/              - List notifications
GET    /api/notifications/<id>/         - Notification detail
POST   /api/notifications/<id>/read/    - Mark as read
POST   /api/notifications/read-all/     - Mark all as read
DELETE /api/notifications/<id>/         - Delete notification
DELETE /api/notifications/clear-all/    - Clear all notifications
```

### 🤖 Recommendations (`/api/recommendations/`)
```
GET    /api/recommendations/            - Get recommendations
GET    /api/recommendations/internships/ - Recommended internships
GET    /api/recommendations/students/   - Recommended students
POST   /api/recommendations/feedback/   - Provide feedback
```

### 💬 Messages (`/api/messages/`)
```
GET    /api/messages/                   - List conversations
POST   /api/messages/                   - Send message
GET    /api/messages/<id>/              - Conversation detail
GET    /api/messages/unread/            - Unread messages count
POST   /api/messages/<id>/read/         - Mark as read
DELETE /api/messages/<id>/              - Delete message
```

### 🔧 Admin Panel
```
GET    /admin/                          - Django admin panel
```

### 🔐 DRF Auth (Development)
```
GET    /api-auth/login/                 - DRF login page
GET    /api-auth/logout/                - DRF logout page
```

### 📁 Media Files (Development)
```
GET    /media/<path>                    - Serve media files
GET    /media-browser/                  - Media browser (custom)
GET    /media-browser/<path>            - Browse media files
```

### 🏠 Root API
```
GET    /api/                            - API status & info
```

---

## 🔌 WebSocket Endpoints

### Real-time Messaging
```
WS     ws://localhost:8000/ws/chat/<room_name>/     - Chat WebSocket
WS     ws://localhost:8000/ws/notifications/        - Notifications WebSocket
WS     ws://localhost:8000/ws/video-call/<room>/    - Video call WebSocket
```

---

## 📝 Request Examples

### 1. Get Public Internships (No Auth)
```bash
curl http://localhost:8000/api/internships/public/
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test1234"
  }'
```

### 3. Get My Applications (With Auth)
```bash
curl http://localhost:8000/api/applications/my-applications/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create Internship (Company)
```bash
curl -X POST http://localhost:8000/api/internships/create/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer Intern",
    "description": "Full-stack development internship",
    "location": "Addis Ababa",
    "duration_months": 6,
    "available_slots": 5
  }'
```

### 5. Apply to Internship (Student)
```bash
curl -X POST http://localhost:8000/api/applications/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "internship_id": 1,
    "cover_letter": "I am interested in this position..."
  }'
```

---

## 🔑 Authentication

### Token-Based Authentication
Most endpoints require authentication. Include the token in the header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Getting a Token
1. Login: `POST /api/auth/login/`
2. Response includes: `access_token` and `refresh_token`
3. Use `access_token` for subsequent requests
4. Refresh when expired: `POST /api/auth/refresh/`

---

## 👥 User Roles & Permissions

### Student
- View public internships
- Apply to internships
- View own applications
- Submit reports
- Message advisors/companies

### Company
- Create/manage internships
- View applications
- Accept/reject applications
- Message students

### Advisor
- View assigned students
- Evaluate students
- Submit reports
- Message students

### Department Head
- Manage department
- Assign advisors
- View statistics
- Manage students
- Generate reports

### UIL Admin
- Full system access
- Manage all departments
- Approve registrations
- System configuration

---

## 🧪 Testing Endpoints

### Using Browser
```
http://localhost:8000/api/
http://localhost:8000/api/internships/public/
http://localhost:8000/admin/
```

### Using Postman
1. Import collection
2. Set base URL: `http://localhost:8000`
3. Add Authorization header
4. Test endpoints

### Using Python
```python
import requests

# Get public internships
response = requests.get('http://localhost:8000/api/internships/public/')
print(response.json())

# Login
response = requests.post('http://localhost:8000/api/auth/login/', json={
    'email': 'student@test.com',
    'password': 'test1234'
})
token = response.json()['access_token']

# Get my applications
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/applications/my-applications/', headers=headers)
print(response.json())
```

---

## 🚀 Starting the Backend

### Development Server
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### With ASGI (for WebSockets)
```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### List Response
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10,
  "next": "http://localhost:8000/api/internships/?page=2",
  "previous": null
}
```

---

## 🔍 Filtering & Pagination

### Filtering
```
GET /api/internships/?status=OPEN
GET /api/internships/?location=Addis Ababa
GET /api/applications/?status=PENDING
```

### Pagination
```
GET /api/internships/?page=1
GET /api/internships/?page=2&page_size=20
```

### Ordering
```
GET /api/internships/?ordering=-created_at
GET /api/applications/?ordering=status
```

### Search
```
GET /api/internships/?search=software
GET /api/companies/?search=tech
```

---

## 📚 Documentation

### Swagger/OpenAPI
```
http://localhost:8000/swagger/
http://localhost:8000/redoc/
```

### Django Admin
```
http://localhost:8000/admin/
Username: admin@internship.com
Password: test1234
```

---

## 🐛 Debugging

### Check if Backend is Running
```bash
curl http://localhost:8000/api/
```

### View All URLs
```bash
cd Backend
python manage.py show_urls
```

### Test Specific Endpoint
```bash
curl -v http://localhost:8000/api/internships/public/
```

---

## 📞 Support

For issues or questions:
1. Check logs: `Backend/logs/`
2. Check Django admin: `http://localhost:8000/admin/`
3. Review documentation files in project root

---

## ✅ Quick Reference

**Base URL**: `http://localhost:8000`

**Most Used Endpoints**:
- Public internships: `/api/internships/public/`
- Login: `/api/auth/login/`
- My applications: `/api/applications/my-applications/`
- My internships: `/api/internships/my-internships/`
- Department stats: `/api/departments/statistics/`

**Authentication**: `Authorization: Bearer TOKEN`

**Status**: ✅ All endpoints documented
