# View Your PostgreSQL Database - Quick Guide

## Your Current Database

Based on the check, here's your configuration:

```
Database: PostgreSQL 18.3
Host: localhost
Port: 5432
User: postgres
Database Name: internship
```

## Your Database Statistics

- **Total Users**: 40
  - Students: 14
  - Companies: 7
  - Advisors: 8
  - Department Heads: 5
  - UIL: 1

- **Total Internships**: 17
  - Open: 13
  - Closed: 3
  - Filled: 0

- **Total Applications**: 9
- **Total Messages**: 99
- **Total Notifications**: 278

---

## Method 1: Using psql (Command Line) - FASTEST

### Connect to Your Database

```bash
psql -h localhost -U postgres -d internship
```

Enter your PostgreSQL password when prompted.

### Useful Commands Once Connected

```sql
-- List all tables
\dt

-- View all users
SELECT id, email, role, is_active FROM users;

-- View all companies
SELECT email, role FROM users WHERE role = 'COMPANY';

-- View all internships
SELECT id, title, status, created_at FROM internships ORDER BY created_at DESC;

-- View open internships
SELECT id, title, status FROM internships WHERE status = 'OPEN' AND is_active = true;

-- View companies with their internship count
SELECT 
    u.email,
    COUNT(i.id) as internship_count
FROM users u
LEFT JOIN internships i ON u.id = i.company_id
WHERE u.role = 'COMPANY'
GROUP BY u.id, u.email
ORDER BY internship_count DESC;

-- View recent applications
SELECT 
    s.email as student,
    i.title as internship,
    a.status,
    a.created_at
FROM applications a
JOIN users s ON a.student_id = s.id
JOIN internships i ON a.internship_id = i.id
ORDER BY a.created_at DESC
LIMIT 10;

-- Exit
\q
```

---

## Method 2: Using pgAdmin (GUI) - RECOMMENDED

### Step 1: Download and Install

**Download**: https://www.pgadmin.org/download/pgadmin-4-windows/

### Step 2: Open pgAdmin

After installation, pgAdmin will open in your browser.

### Step 3: Add Server

1. **Right-click "Servers"** in the left panel
2. **Select "Register" → "Server"**
3. **Fill in the details**:

**General Tab**:
- Name: `Django Internship Database` (any name you like)

**Connection Tab**:
- Host name/address: `localhost`
- Port: `5432`
- Maintenance database: `internship`
- Username: `postgres`
- Password: `your_postgres_password`
- Save password: ✓ (check this)

4. **Click "Save"**

### Step 4: Browse Your Data

1. **Expand** "Django Internship Database" in left panel
2. **Expand** "Databases" → "internship"
3. **Expand** "Schemas" → "public"
4. **Expand** "Tables"

You'll see all your tables:
- `users` - All user accounts
- `company_profiles` - Company details
- `student_profiles` - Student details
- `internships` - Internship posts
- `applications` - Student applications
- `messages` - Chat messages
- `notifications` - System notifications
- etc.

### Step 5: View Table Data

**Right-click any table** → **View/Edit Data** → **All Rows**

---

## Method 3: Using Django Admin (Web Interface) - EASIEST

### Step 1: Create Superuser (if not already done)

```bash
cd Backend
python manage.py createsuperuser
```

Follow the prompts.

### Step 2: Start Server

```bash
python manage.py runserver
```

### Step 3: Access Admin Panel

Open browser: **http://localhost:8000/admin/**

Login with your superuser credentials.

### Step 4: Browse Data

Click on any model to view/edit data:
- Users
- Internships
- Applications
- Companies
- Students
- etc.

---

## Method 4: Using Django Shell (Python)

### Start Shell

```bash
cd Backend
python manage.py shell
```

### Query Examples

```python
# Import models
from apps.accounts.models import User
from apps.internships.models import Internship
from apps.applications.models import Application

# View all companies
companies = User.objects.filter(role='COMPANY')
for c in companies:
    profile = c.company_profile
    print(f"{profile.company_name} - {c.email}")

# View all open internships
open_internships = Internship.objects.filter(status='OPEN', is_active=True)
for i in open_internships:
    print(f"{i.title} - {i.company.email}")

# View specific company's internships
company = User.objects.get(email='two306702@gmail.com')  # navigated.tec
internships = Internship.objects.filter(company=company)
print(f"{company.company_profile.company_name} has {internships.count()} internships")
for i in internships:
    print(f"  - {i.title} ({i.status})")

# View applications
applications = Application.objects.all()
for app in applications:
    print(f"{app.student.email} → {app.internship.title} ({app.status})")

# Exit
exit()
```

---

## Method 5: Using DBeaver (Free Universal Tool)

### Step 1: Download and Install

**Download**: https://dbeaver.io/download/

### Step 2: Create Connection

1. **Open DBeaver**
2. **Click** "New Database Connection" (plug icon)
3. **Select** "PostgreSQL"
4. **Fill in**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `internship`
   - Username: `postgres`
   - Password: `your_password`
5. **Click** "Test Connection"
6. **Click** "Finish"

### Step 3: Browse Data

1. **Expand** your connection
2. **Expand** "internship" → "Schemas" → "public" → "Tables"
3. **Double-click** any table to view data

---

## Quick SQL Queries for Your Database

### View All Companies with Internships

```sql
SELECT 
    cp.company_name,
    u.email,
    COUNT(i.id) as total_internships,
    SUM(CASE WHEN i.status = 'OPEN' AND i.is_active = true THEN 1 ELSE 0 END) as open_internships
FROM users u
JOIN company_profiles cp ON u.id = cp.user_id
LEFT JOIN internships i ON u.id = i.company_id
WHERE u.role = 'COMPANY'
GROUP BY cp.company_name, u.email
ORDER BY total_internships DESC;
```

### View Students with Applications

```sql
SELECT 
    sp.full_name,
    u.email,
    COUNT(a.id) as total_applications,
    SUM(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN applications a ON u.id = a.student_id
WHERE u.role = 'STUDENT'
GROUP BY sp.full_name, u.email
ORDER BY total_applications DESC;
```

### View Recent Activity

```sql
SELECT 
    'Internship' as type,
    title as description,
    created_at
FROM internships
UNION ALL
SELECT 
    'Application' as type,
    CONCAT('Application to internship #', internship_id) as description,
    created_at
FROM applications
ORDER BY created_at DESC
LIMIT 20;
```

---

## Backup Your Database

### Create Backup

```bash
pg_dump -h localhost -U postgres -d internship -F c -f backup_$(date +%Y%m%d).dump
```

Or simpler:
```bash
pg_dump -h localhost -U postgres -d internship > backup.sql
```

### Restore Backup

```bash
pg_restore -h localhost -U postgres -d internship backup_20260501.dump
```

Or:
```bash
psql -h localhost -U postgres -d internship < backup.sql
```

---

## Recommended Tools

For your setup, I recommend:

1. **pgAdmin** - Best for comprehensive database management
   - Visual interface
   - Query builder
   - Data editing
   - Download: https://www.pgadmin.org/

2. **Django Admin** - Best for quick data editing
   - Already built-in
   - User-friendly
   - No installation needed

3. **psql** - Best for quick queries
   - Fast
   - Command-line
   - Already installed with PostgreSQL

---

## Next Steps

1. **Install pgAdmin** (recommended)
2. **Connect to your database** using the credentials above
3. **Browse your tables** and data
4. **Try some SQL queries**

Your database is working perfectly with:
- 40 users
- 17 internships
- 9 applications
- All data properly stored

Need help with specific queries? Just ask!
