# Backend URLs - Quick Reference 🚀

## 🌐 Base URL
```
http://localhost:8000
```

---

## 📋 Main Endpoints

### 🔐 Authentication
```
POST   /api/auth/login/          - Login
POST   /api/auth/register/       - Register
GET    /api/auth/profile/        - Get profile
POST   /api/auth/logout/         - Logout
```

### 💼 Internships
```
GET    /api/internships/public/  - Public list (no auth)
GET    /api/internships/         - All internships
POST   /api/internships/create/  - Create internship
GET    /api/internships/<id>/    - Internship detail
```

### 📄 Applications
```
POST   /api/applications/                    - Apply
GET    /api/applications/my-applications/    - My applications
GET    /api/applications/company-applications/ - Company apps
POST   /api/applications/<id>/accept/        - Accept
POST   /api/applications/<id>/reject/        - Reject
```

### 🏢 Departments
```
GET    /api/departments/                - List departments
GET    /api/departments/statistics/     - Statistics
GET    /api/departments/students/       - Students list
POST   /api/departments/assign-advisor/ - Assign advisor
```

### 👨‍🏫 Advisors
```
GET    /api/advisors/my-students/       - My students
POST   /api/advisors/students/<id>/evaluate/ - Evaluate
GET    /api/advisors/statistics/        - Statistics
```

### 💬 Messages
```
GET    /api/messages/           - Conversations
POST   /api/messages/           - Send message
GET    /api/messages/unread/    - Unread count
```

### 🔔 Notifications
```
GET    /api/notifications/      - List notifications
POST   /api/notifications/<id>/read/ - Mark read
POST   /api/notifications/read-all/  - Mark all read
```

---

## 🔧 Admin & Tools

```
GET    /admin/                  - Django admin panel
GET    /api/                    - API status
GET    /api-auth/login/         - DRF login
```

---

## 🧪 Quick Test

### Test if Backend is Running
```bash
curl http://localhost:8000/api/
```

### Get Public Internships
```bash
curl http://localhost:8000/api/internships/public/
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"test1234"}'
```

---

## 🔑 Authentication

Include token in header:
```
Authorization: Bearer YOUR_TOKEN
```

---

## 👥 Test Accounts

```
Student:  student@test.com / test1234
Company:  company@test.com / test1234
Advisor:  advisor@test.com / test1234
Dept Head: depthead@cs.test.com / test1234
Admin:    admin@internship.com / test1234
```

---

## 🚀 Start Backend

```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

---

## 📚 Full Documentation

See: `DJANGO_BACKEND_URLS.md`

---

## ✅ Status

**Backend URL**: http://localhost:8000
**Admin Panel**: http://localhost:8000/admin/
**API Root**: http://localhost:8000/api/
