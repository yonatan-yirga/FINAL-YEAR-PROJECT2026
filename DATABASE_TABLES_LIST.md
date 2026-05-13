# PostgreSQL Database Tables

## All Tables in Your Database

Your PostgreSQL database contains **40 tables**:

### 1. User & Authentication Tables (10 tables)

| Table Name | Purpose |
|------------|---------|
| `users` | Main user accounts table |
| `users_groups` | User group memberships |
| `users_user_permissions` | User-specific permissions |
| `student_profiles` | Student profile information |
| `company_profiles` | Company profile information |
| `advisor_profiles` | Advisor profile information |
| `department_head_profiles` | Department head profiles |
| `password_reset_tokens` | Password reset tokens |
| `authtoken_token` | API authentication tokens |
| `registration_requests` | Pending user registrations |

### 2. Department & Organization Tables (5 tables)

| Table Name | Purpose |
|------------|---------|
| `departments` | University departments |
| `department_cycles` | Academic cycles/semesters |
| `company_profiles_target_departments` | Company-department relationships |
| `registration_requests_target_departments` | Registration target departments |
| `escalations` | Issue escalations |

### 3. Internship & Application Tables (3 tables)

| Table Name | Purpose |
|------------|---------|
| `internships` | Internship postings |
| `applications` | Student applications |
| `advisor_assignments` | Advisor-student assignments |

### 4. Reports & Feedback Tables (5 tables)

| Table Name | Purpose |
|------------|---------|
| `monthly_reports` | Monthly progress reports |
| `student_monthly_reports` | Student monthly reports |
| `final_reports` | Final internship reports |
| `student_final_reports` | Student final reports |
| `feedbacks` | Feedback submissions |

### 5. Communication Tables (2 tables)

| Table Name | Purpose |
|------------|---------|
| `messages` | Chat messages |
| `notifications` | System notifications |

### 6. Certificates Table (1 table)

| Table Name | Purpose |
|------------|---------|
| `certificates` | Internship completion certificates |

### 7. Django System Tables (8 tables)

| Table Name | Purpose |
|------------|---------|
| `django_admin_log` | Admin action logs |
| `django_content_type` | Content type registry |
| `django_migrations` | Migration history |
| `django_session` | User sessions |
| `django_site` | Site configuration |
| `auth_group` | User groups |
| `auth_group_permissions` | Group permissions |
| `auth_permission` | Available permissions |

### 8. OAuth/Social Auth Tables (6 tables)

| Table Name | Purpose |
|------------|---------|
| `account_emailaddress` | Email addresses for accounts |
| `account_emailconfirmation` | Email confirmations |
| `socialaccount_socialaccount` | Social media accounts |
| `socialaccount_socialapp` | Social auth apps (Google, GitHub) |
| `socialaccount_socialapp_sites` | Social app site mappings |
| `socialaccount_socialtoken` | Social auth tokens |

---

## Table Categories Summary

| Category | Count | Tables |
|----------|-------|--------|
| **Users & Auth** | 10 | users, profiles, tokens, registrations |
| **Departments** | 5 | departments, cycles, escalations |
| **Internships** | 3 | internships, applications, assignments |
| **Reports** | 5 | monthly, final, feedback |
| **Communication** | 2 | messages, notifications |
| **Certificates** | 1 | certificates |
| **Django System** | 8 | admin, migrations, sessions |
| **OAuth** | 6 | social accounts, email verification |
| **TOTAL** | **40** | |

---

## How to View Table Data

### Method 1: Using psql

```bash
psql -h localhost -U postgres -d internship
```

Then:
```sql
-- List all tables
\dt

-- View table structure
\d users

-- View data
SELECT * FROM users LIMIT 10;

-- Count records
SELECT COUNT(*) FROM users;
```

### Method 2: Using pgAdmin

1. Open pgAdmin
2. Connect to server (localhost:5432)
3. Navigate to: internship → Schemas → public → Tables
4. Right-click table → View/Edit Data → All Rows

### Method 3: Using Django Shell

```bash
cd Backend
python manage.py shell
```

```python
from apps.accounts.models import User
from apps.internships.models import Internship

# View users
User.objects.all()

# View internships
Internship.objects.all()
```

### Method 4: Using Django Admin

```bash
cd Backend
python manage.py runserver
```

Go to: http://localhost:8000/admin/

---

## Quick Queries

### Count Records in All Tables

```bash
cd Backend
python manage.py shell
```

```python
from django.db import connection

cursor = connection.cursor()
tables = connection.introspection.table_names()

for table in sorted(tables):
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"{table:45} {count:>6} rows")
```

### View Specific Table Data

```sql
-- Users
SELECT id, email, role, is_active FROM users;

-- Companies
SELECT u.email, cp.company_name, cp.city 
FROM users u 
JOIN company_profiles cp ON u.id = cp.user_id 
WHERE u.role = 'COMPANY';

-- Internships
SELECT id, title, status, created_at 
FROM internships 
ORDER BY created_at DESC;

-- Applications
SELECT s.email as student, i.title as internship, a.status
FROM applications a
JOIN users s ON a.student_id = s.id
JOIN internships i ON a.internship_id = i.id;
```

---

## Table Relationships

### Core Relationships

```
users (main table)
├── student_profiles (1:1)
├── company_profiles (1:1)
├── advisor_profiles (1:1)
├── department_head_profiles (1:1)
├── internships (1:many) - companies post internships
├── applications (1:many) - students apply
└── advisor_assignments (1:many) - advisors assigned

internships
├── applications (1:many)
└── advisor_assignments (1:many)

applications
├── monthly_reports (1:many)
├── final_reports (1:1)
└── feedbacks (1:many)
```

---

## Database Statistics

Run this to see current data:

```bash
cd Backend
python check_database.py
```

Or manually:

```bash
cd Backend
python manage.py shell -c "
from apps.accounts.models import User
from apps.internships.models import Internship
from apps.applications.models import Application

print(f'Users: {User.objects.count()}')
print(f'Internships: {Internship.objects.count()}')
print(f'Applications: {Application.objects.count()}')
"
```

---

## Backup Database

### Full Backup

```bash
pg_dump -h localhost -U postgres -d internship -F c -f backup.dump
```

### Specific Tables

```bash
pg_dump -h localhost -U postgres -d internship -t users -t internships > backup.sql
```

### Restore

```bash
pg_restore -h localhost -U postgres -d internship backup.dump
```

---

## Useful Commands

### List Tables with Row Counts

```bash
cd Backend
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute(\"\"\"
    SELECT schemaname, tablename, n_live_tup 
    FROM pg_stat_user_tables 
    ORDER BY n_live_tup DESC
\"\"\")
for row in cursor.fetchall():
    print(f'{row[1]:40} {row[2]:>6} rows')
"
```

### Find Large Tables

```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View Table Structure

```sql
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

---

## Summary

Your database has:
- ✅ 40 tables total
- ✅ 10 user/auth tables
- ✅ 5 department tables
- ✅ 3 internship tables
- ✅ 5 report tables
- ✅ 2 communication tables
- ✅ 1 certificate table
- ✅ 8 Django system tables
- ✅ 6 OAuth tables

All tables are properly structured and working!
