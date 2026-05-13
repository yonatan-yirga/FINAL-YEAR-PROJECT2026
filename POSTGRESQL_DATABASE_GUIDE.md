# PostgreSQL Database Management Guide

## Overview

Your Django project can use either SQLite (default) or PostgreSQL. This guide shows you how to view and manage your PostgreSQL database.

## Current Database Configuration

Your project uses the `DATABASE_URL` environment variable to configure the database:

```python
# From Backend/config/settings.py
DATABASE_URL = config('DATABASE_URL', default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'))
```

**Default**: SQLite (file-based database)
**Production**: PostgreSQL (via DATABASE_URL)

---

## Method 1: Using pgAdmin (GUI - Recommended for Beginners)

### Step 1: Install pgAdmin

**Download**: https://www.pgadmin.org/download/

**Windows**:
1. Download the installer
2. Run the installer
3. Follow the installation wizard

### Step 2: Connect to Your Database

1. **Open pgAdmin**
2. **Right-click "Servers"** → **Create** → **Server**
3. **Fill in the details**:

**General Tab**:
- Name: `My Django Database` (any name)

**Connection Tab**:
- Host: `localhost` (or your server IP)
- Port: `5432` (default PostgreSQL port)
- Database: `your_database_name`
- Username: `your_username`
- Password: `your_password`

4. **Click "Save"**

### Step 3: View Your Data

1. **Expand the server** in the left panel
2. **Expand "Databases"** → Your database name
3. **Expand "Schemas"** → **"public"**
4. **Expand "Tables"** - You'll see all your Django tables

**To view data**:
- Right-click a table → **View/Edit Data** → **All Rows**

---

## Method 2: Using psql (Command Line)

### Step 1: Install PostgreSQL

**Windows**:
- Download from: https://www.postgresql.org/download/windows/
- Run the installer
- Remember the password you set for the `postgres` user

**Check if installed**:
```bash
psql --version
```

### Step 2: Connect to Database

**Option A: Using DATABASE_URL**

If you have a DATABASE_URL like:
```
postgresql://username:password@localhost:5432/database_name
```

Connect with:
```bash
psql postgresql://username:password@localhost:5432/database_name
```

**Option B: Using separate parameters**

```bash
psql -h localhost -p 5432 -U your_username -d your_database_name
```

Enter password when prompted.

### Step 3: Common psql Commands

Once connected, you can use these commands:

```sql
-- List all databases
\l

-- Connect to a specific database
\c database_name

-- List all tables
\dt

-- Describe a table structure
\d table_name

-- View all data in a table
SELECT * FROM table_name;

-- Count rows in a table
SELECT COUNT(*) FROM table_name;

-- View specific columns
SELECT id, email, role FROM accounts_user;

-- Filter data
SELECT * FROM accounts_user WHERE role = 'COMPANY';

-- Exit psql
\q
```

---

## Method 3: Using DBeaver (Universal Database Tool)

### Step 1: Install DBeaver

**Download**: https://dbeaver.io/download/

**Features**:
- Free and open-source
- Works with PostgreSQL, MySQL, SQLite, etc.
- User-friendly interface
- SQL editor with autocomplete

### Step 2: Create Connection

1. **Open DBeaver**
2. **Click "New Database Connection"** (plug icon)
3. **Select "PostgreSQL"**
4. **Fill in connection details**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `your_database_name`
   - Username: `your_username`
   - Password: `your_password`
5. **Click "Test Connection"**
6. **Click "Finish"**

### Step 3: Browse Data

1. **Expand your connection** in the left panel
2. **Expand "Databases"** → Your database
3. **Expand "Schemas"** → **"public"**
4. **Expand "Tables"**
5. **Double-click a table** to view data

---

## Method 4: Using Django Shell

### Access Database via Django ORM

```bash
cd Backend
python manage.py shell
```

### Common Queries

```python
# Import models
from apps.accounts.models import User
from apps.internships.models import Internship
from apps.applications.models import Application

# Count all users
User.objects.count()

# List all users
users = User.objects.all()
for user in users:
    print(f"{user.email} - {user.role}")

# Filter users by role
companies = User.objects.filter(role='COMPANY')
print(f"Total companies: {companies.count()}")

# Get specific user
user = User.objects.get(email='company@test.com')
print(f"User: {user.email}, Role: {user.role}")

# List all internships
internships = Internship.objects.all()
for i in internships:
    print(f"{i.title} - {i.company.email} - Status: {i.status}")

# Count open internships
open_count = Internship.objects.filter(status='OPEN', is_active=True).count()
print(f"Open internships: {open_count}")

# Get applications
applications = Application.objects.all()
for app in applications:
    print(f"{app.student.email} applied to {app.internship.title}")

# Complex queries
from django.db.models import Count

# Companies with internship count
companies_with_count = User.objects.filter(
    role='COMPANY'
).annotate(
    internship_count=Count('posted_internships')
)

for company in companies_with_count:
    print(f"{company.email}: {company.internship_count} internships")
```

---

## Method 5: Using Django Admin Panel

### Step 1: Create Superuser

```bash
cd Backend
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### Step 2: Access Admin Panel

1. **Start the server**:
   ```bash
   python manage.py runserver
   ```

2. **Open browser**: http://localhost:8000/admin/

3. **Login** with superuser credentials

4. **Browse data**: Click on any model to view/edit data

---

## Method 6: Using TablePlus (Modern GUI)

### Step 1: Install TablePlus

**Download**: https://tableplus.com/

**Features**:
- Modern, clean interface
- Fast and lightweight
- Multi-database support
- Native apps for Windows, Mac, Linux

### Step 2: Create Connection

1. **Open TablePlus**
2. **Click "Create a new connection"**
3. **Select "PostgreSQL"**
4. **Fill in details**:
   - Name: `Django Database`
   - Host: `localhost`
   - Port: `5432`
   - User: `your_username`
   - Password: `your_password`
   - Database: `your_database_name`
5. **Click "Connect"**

---

## Checking Your Current Database

### Method 1: Check DATABASE_URL

```bash
cd Backend
python manage.py shell
```

```python
from django.conf import settings
print(settings.DATABASES['default'])
```

### Method 2: Check .env File

```bash
cd Backend
cat .env
```

Look for `DATABASE_URL` line.

### Method 3: Using Django Command

```bash
cd Backend
python manage.py dbshell
```

This opens the database shell for your configured database.

---

## Common PostgreSQL Queries for Django

### View All Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### View Table Structure

```sql
\d accounts_user
```

Or:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'accounts_user';
```

### Count Records in All Tables

```sql
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### View Recent Internships

```sql
SELECT id, title, company_id, status, created_at
FROM internships_internship
ORDER BY created_at DESC
LIMIT 10;
```

### View Companies with Internship Count

```sql
SELECT 
    u.email,
    u.role,
    COUNT(i.id) as internship_count
FROM accounts_user u
LEFT JOIN internships_internship i ON u.id = i.company_id
WHERE u.role = 'COMPANY'
GROUP BY u.id, u.email, u.role
ORDER BY internship_count DESC;
```

---

## Setting Up PostgreSQL for Your Project

### Step 1: Install PostgreSQL

**Windows**:
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Set password for `postgres` user
4. Remember the port (default: 5432)

### Step 2: Create Database

**Using psql**:
```bash
psql -U postgres
```

```sql
CREATE DATABASE internship_db;
CREATE USER internship_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE internship_db TO internship_user;
\q
```

### Step 3: Update .env File

Create or update `Backend/.env`:

```env
DATABASE_URL=postgresql://internship_user:your_password@localhost:5432/internship_db
```

### Step 4: Run Migrations

```bash
cd Backend
python manage.py migrate
```

### Step 5: Create Superuser

```bash
python manage.py createsuperuser
```

---

## Backup and Restore

### Backup Database

```bash
pg_dump -U your_username -d your_database_name -F c -f backup.dump
```

Or with DATABASE_URL:
```bash
pg_dump postgresql://username:password@localhost:5432/database_name > backup.sql
```

### Restore Database

```bash
pg_restore -U your_username -d your_database_name backup.dump
```

Or:
```bash
psql -U your_username -d your_database_name < backup.sql
```

---

## Troubleshooting

### Problem: "psql: command not found"

**Solution**: Add PostgreSQL to PATH

**Windows**:
1. Find PostgreSQL bin directory (e.g., `C:\Program Files\PostgreSQL\15\bin`)
2. Add to System PATH environment variable
3. Restart terminal

### Problem: "Connection refused"

**Solution**: Check if PostgreSQL is running

**Windows**:
```bash
# Check service status
sc query postgresql-x64-15
```

**Start service**:
```bash
net start postgresql-x64-15
```

### Problem: "Authentication failed"

**Solution**: Check credentials

1. Verify username and password
2. Check `pg_hba.conf` file
3. Restart PostgreSQL service

---

## Quick Reference

| Tool | Type | Best For |
|------|------|----------|
| **pgAdmin** | GUI | Comprehensive management |
| **psql** | CLI | Quick queries, scripts |
| **DBeaver** | GUI | Universal, free |
| **TablePlus** | GUI | Modern, fast |
| **Django Shell** | CLI | Django ORM queries |
| **Django Admin** | Web | Quick data editing |

---

## Recommended Setup

For development, I recommend:

1. **pgAdmin** or **DBeaver** for visual database management
2. **Django Shell** for quick data queries
3. **Django Admin** for data editing

For production:
1. Use environment variables for DATABASE_URL
2. Regular backups with `pg_dump`
3. Monitor with pgAdmin or cloud provider tools

---

## Next Steps

1. Choose a tool from above (pgAdmin recommended for beginners)
2. Install and connect to your database
3. Explore your Django tables
4. Try some queries

Need help? Check the specific tool's documentation or ask for assistance!
