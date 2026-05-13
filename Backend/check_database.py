#!/usr/bin/env python
"""
Check current database configuration
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from django.db import connection

print("=" * 60)
print("DATABASE CONFIGURATION CHECK")
print("=" * 60)

# Get database settings
db_settings = settings.DATABASES['default']

print("\n📊 Current Database Configuration:")
print("-" * 60)
print(f"Engine: {db_settings['ENGINE']}")
print(f"Name: {db_settings['NAME']}")

if 'HOST' in db_settings and db_settings['HOST']:
    print(f"Host: {db_settings['HOST']}")
    print(f"Port: {db_settings.get('PORT', 'default')}")
    print(f"User: {db_settings.get('USER', 'N/A')}")
    print(f"Password: {'*' * len(db_settings.get('PASSWORD', ''))}")

print("-" * 60)

# Determine database type
if 'sqlite' in db_settings['ENGINE']:
    print("\n✅ Using SQLite (file-based database)")
    print(f"📁 Database file: {db_settings['NAME']}")
    print("\n💡 To view SQLite database:")
    print("   - Use DB Browser for SQLite: https://sqlitebrowser.org/")
    print("   - Or use Django shell: python manage.py shell")
    
elif 'postgresql' in db_settings['ENGINE']:
    print("\n✅ Using PostgreSQL")
    print(f"🔗 Connection: {db_settings['HOST']}:{db_settings.get('PORT', 5432)}")
    print("\n💡 To view PostgreSQL database:")
    print("   - Use pgAdmin: https://www.pgadmin.org/")
    print("   - Or use psql command line")
    print(f"   - Command: psql -h {db_settings['HOST']} -U {db_settings.get('USER')} -d {db_settings['NAME']}")
    
elif 'mysql' in db_settings['ENGINE']:
    print("\n✅ Using MySQL")
    print(f"🔗 Connection: {db_settings['HOST']}:{db_settings.get('PORT', 3306)}")
    print("\n💡 To view MySQL database:")
    print("   - Use MySQL Workbench")
    print("   - Or use mysql command line")

# Test connection
print("\n" + "=" * 60)
print("CONNECTION TEST")
print("=" * 60)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        if result:
            print("✅ Database connection successful!")
            
            # Get database version
            if 'postgresql' in db_settings['ENGINE']:
                cursor.execute("SELECT version()")
                version = cursor.fetchone()[0]
                print(f"📌 PostgreSQL Version: {version.split(',')[0]}")
            elif 'sqlite' in db_settings['ENGINE']:
                cursor.execute("SELECT sqlite_version()")
                version = cursor.fetchone()[0]
                print(f"📌 SQLite Version: {version}")
            elif 'mysql' in db_settings['ENGINE']:
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()[0]
                print(f"📌 MySQL Version: {version}")
                
except Exception as e:
    print(f"❌ Database connection failed: {e}")

# Count tables
print("\n" + "=" * 60)
print("DATABASE STATISTICS")
print("=" * 60)

try:
    from django.apps import apps
    
    # Get all models
    all_models = apps.get_models()
    
    print(f"\n📊 Total Django Models: {len(all_models)}")
    print("\n📋 Tables and Row Counts:")
    print("-" * 60)
    
    for model in all_models:
        try:
            count = model.objects.count()
            table_name = model._meta.db_table
            print(f"  {table_name:40} {count:>10} rows")
        except Exception as e:
            print(f"  {model._meta.db_table:40} Error: {str(e)[:20]}")
    
    print("-" * 60)
    
    # Summary
    from apps.accounts.models import User
    from apps.internships.models import Internship
    from apps.applications.models import Application
    
    print("\n📈 Quick Summary:")
    print(f"  Total Users: {User.objects.count()}")
    print(f"  - Students: {User.objects.filter(role='STUDENT').count()}")
    print(f"  - Companies: {User.objects.filter(role='COMPANY').count()}")
    print(f"  - Advisors: {User.objects.filter(role='ADVISOR').count()}")
    print(f"  - Department Heads: {User.objects.filter(role='DEPARTMENT_HEAD').count()}")
    print(f"  - UIL: {User.objects.filter(role='UIL').count()}")
    print(f"\n  Total Internships: {Internship.objects.count()}")
    print(f"  - Open: {Internship.objects.filter(status='OPEN', is_active=True).count()}")
    print(f"  - Closed: {Internship.objects.filter(status='CLOSED').count()}")
    print(f"  - Filled: {Internship.objects.filter(status='FILLED').count()}")
    print(f"\n  Total Applications: {Application.objects.count()}")
    print(f"  - Pending: {Application.objects.filter(status='PENDING').count()}")
    print(f"  - Accepted: {Application.objects.filter(status='ACCEPTED').count()}")
    print(f"  - Rejected: {Application.objects.filter(status='REJECTED').count()}")
    
except Exception as e:
    print(f"❌ Error getting statistics: {e}")

print("\n" + "=" * 60)
print("ENVIRONMENT VARIABLES")
print("=" * 60)

# Check for DATABASE_URL
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # Mask password in URL
    if '@' in database_url:
        parts = database_url.split('@')
        if ':' in parts[0]:
            user_pass = parts[0].split(':')
            masked_url = f"{user_pass[0]}:****@{parts[1]}"
        else:
            masked_url = database_url
    else:
        masked_url = database_url
    print(f"\n✅ DATABASE_URL is set:")
    print(f"   {masked_url}")
else:
    print("\n⚠️  DATABASE_URL not set (using default from settings.py)")

print("\n" + "=" * 60)
print("RECOMMENDATIONS")
print("=" * 60)

if 'sqlite' in db_settings['ENGINE']:
    print("\n💡 You're using SQLite (good for development)")
    print("   To view data:")
    print("   1. Download DB Browser for SQLite: https://sqlitebrowser.org/")
    print("   2. Open the database file in the browser")
    print("   3. Or use Django admin: python manage.py runserver")
    print("      Then go to: http://localhost:8000/admin/")
    
elif 'postgresql' in db_settings['ENGINE']:
    print("\n💡 You're using PostgreSQL (good for production)")
    print("   To view data:")
    print("   1. Install pgAdmin: https://www.pgadmin.org/")
    print("   2. Or use psql command line")
    print("   3. Or use Django admin: python manage.py runserver")
    print("      Then go to: http://localhost:8000/admin/")

print("\n" + "=" * 60)
