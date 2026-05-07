# Complete Deployment Guide - University Internship System

## Table of Contents
1. [Deployment Options](#deployment-options)
2. [Option 1: Deploy to Render (Recommended - Free)](#option-1-deploy-to-render)
3. [Option 2: Deploy to Railway](#option-2-deploy-to-railway)
4. [Option 3: Deploy to Heroku](#option-3-deploy-to-heroku)
5. [Option 4: Deploy to VPS (DigitalOcean/AWS)](#option-4-deploy-to-vps)
6. [Environment Variables Setup](#environment-variables-setup)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)

---

## Deployment Options

### Best Options for Your Project:

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Render** | Free tier available | Easy | Beginners, Free hosting |
| **Railway** | $5/month after trial | Easy | Quick deployment |
| **Heroku** | $5-7/month | Medium | Established platform |
| **VPS (DigitalOcean)** | $6/month | Hard | Full control |
| **Vercel + Railway** | Free + $5 | Easy | Separate frontend/backend |

**Recommendation:** Start with **Render** (free tier) for both frontend and backend.

---

## Option 1: Deploy to Render (Recommended - Free)

### Overview
- **Backend:** Django on Render Web Service
- **Frontend:** React on Render Static Site
- **Database:** PostgreSQL on Render (free tier)
- **Cost:** FREE (with limitations)

### Step-by-Step Guide

#### Part A: Prepare Your Project

##### 1. Create Production Requirements File

Create `Backend/requirements-prod.txt`:
```txt
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
Pillow==10.1.0
python-decouple==3.8
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
channels==4.0.0
channels-redis==4.1.0
daphne==4.0.0
agora-token-builder==1.0.0
```

##### 2. Create Render Build Script

Create `Backend/build.sh`:
```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements-prod.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py runserver
```

Make it executable:
```bash
chmod +x Backend/build.sh
```

##### 3. Update Django Settings for Production

Create `Backend/config/settings_prod.py`:
```python
from .settings import *
import os
import dj_database_url

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    'your-app-name.onrender.com',
    'localhost',
    '127.0.0.1',
]

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600
    )
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-name.onrender.com',
]
```

##### 4. Create render.yaml (Optional but Recommended)

Create `render.yaml` in project root:
```yaml
services:
  # Backend Service
  - type: web
    name: internship-backend
    env: python
    buildCommand: "./Backend/build.sh"
    startCommand: "cd Backend && gunicorn config.wsgi:application"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromDatabase:
          name: internship-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: DJANGO_SETTINGS_MODULE
        value: config.settings_prod

  # Database
  - type: pgsql
    name: internship-db
    databaseName: internship_db
    user: internship_user
```

#### Part B: Deploy Backend to Render

##### 1. Sign Up for Render
- Go to https://render.com
- Sign up with GitHub account
- Authorize Render to access your repository

##### 2. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `internship-db`
3. Database: `internship_db`
4. User: `internship_user`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click "Create Database"
8. **Copy the Internal Database URL** (you'll need this)

##### 3. Create Web Service for Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `internship-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `Backend`
   - **Environment:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
   - **Plan:** Free

4. Add Environment Variables:
   ```
   DATABASE_URL = [paste Internal Database URL from step 2]
   SECRET_KEY = [generate random string]
   DEBUG = False
   DJANGO_SETTINGS_MODULE = config.settings_prod
   ALLOWED_HOSTS = internship-backend.onrender.com
   ```

5. Click "Create Web Service"

##### 4. Wait for Deployment
- First deployment takes 5-10 minutes
- Watch the logs for any errors
- Once deployed, you'll get a URL like: `https://internship-backend.onrender.com`

#### Part C: Deploy Frontend to Render

##### 1. Update Frontend API URL

Update `Frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://internship-backend.onrender.com';
```

Create `Frontend/.env.production`:
```env
VITE_API_URL=https://internship-backend.onrender.com
```

##### 2. Create Build Script

Create `Frontend/build.sh`:
```bash
#!/usr/bin/env bash
set -o errexit

npm install
npm run build
```

##### 3. Create Static Site on Render
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `internship-frontend`
   - **Branch:** `main`
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add Environment Variables:
   ```
   VITE_API_URL = https://internship-backend.onrender.com
   ```

5. Click "Create Static Site"

##### 4. Update Backend CORS Settings
Go back to your backend service and update environment variables:
```
CORS_ALLOWED_ORIGINS = https://internship-frontend.onrender.com
```

#### Part D: Run Migrations and Create Superuser

1. Go to your backend service on Render
2. Click "Shell" tab
3. Run:
```bash
python manage.py migrate
python manage.py createsuperuser
```

---

## Option 2: Deploy to Railway

### Step-by-Step Guide

#### 1. Sign Up for Railway
- Go to https://railway.app
- Sign up with GitHub

#### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

#### 3. Add PostgreSQL Database
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically creates `DATABASE_URL`

#### 4. Configure Backend Service
1. Click on your service
2. Go to "Settings"
3. Set:
   - **Root Directory:** `Backend`
   - **Build Command:** `pip install -r requirements-prod.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - **Start Command:** `gunicorn config.wsgi:application`

4. Add Environment Variables:
   ```
   SECRET_KEY = [random string]
   DEBUG = False
   DJANGO_SETTINGS_MODULE = config.settings_prod
   ```

#### 5. Deploy Frontend
1. Create new service from same repo
2. Set:
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview`

3. Add Environment Variable:
   ```
   VITE_API_URL = [your backend URL]
   ```

---

## Option 3: Deploy to Heroku

### Step-by-Step Guide

#### 1. Install Heroku CLI
```bash
# Windows
choco install heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create Heroku Apps
```bash
# Backend
cd Backend
heroku create internship-backend

# Frontend
cd ../Frontend
heroku create internship-frontend
```

#### 4. Add PostgreSQL to Backend
```bash
cd Backend
heroku addons:create heroku-postgresql:mini
```

#### 5. Create Procfile for Backend

Create `Backend/Procfile`:
```
web: gunicorn config.wsgi:application
release: python manage.py migrate
```

#### 6. Deploy Backend
```bash
cd Backend
git init
heroku git:remote -a internship-backend
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### 7. Set Environment Variables
```bash
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False
heroku config:set DJANGO_SETTINGS_MODULE=config.settings_prod
```

#### 8. Deploy Frontend
```bash
cd Frontend
# Add buildpack for Node.js
heroku buildpacks:set heroku/nodejs
git init
heroku git:remote -a internship-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

---

## Option 4: Deploy to VPS (DigitalOcean/AWS)

### Prerequisites
- VPS with Ubuntu 22.04
- Domain name (optional)
- SSH access

### Step-by-Step Guide

#### 1. Create VPS
1. Sign up for DigitalOcean: https://www.digitalocean.com
2. Create Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month)
   - **Region:** Closest to you
   - **Authentication:** SSH Key (recommended)

#### 2. Connect to VPS
```bash
ssh root@your_server_ip
```

#### 3. Update System
```bash
apt update && apt upgrade -y
```

#### 4. Install Dependencies
```bash
# Python and pip
apt install python3-pip python3-dev python3-venv -y

# PostgreSQL
apt install postgresql postgresql-contrib -y

# Nginx
apt install nginx -y

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Redis (for WebSocket)
apt install redis-server -y
```

#### 5. Create Database
```bash
sudo -u postgres psql

CREATE DATABASE internship_db;
CREATE USER internship_user WITH PASSWORD 'your_password';
ALTER ROLE internship_user SET client_encoding TO 'utf8';
ALTER ROLE internship_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE internship_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE internship_db TO internship_user;
\q
```

#### 6. Clone Repository
```bash
cd /var/www
git clone https://github.com/yonatan-yirga/FINAL-YEAR-PROJECT2026.git
cd FINAL-YEAR-PROJECT2026
```

#### 7. Setup Backend
```bash
cd Backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements-prod.txt

# Create .env file
nano .env
```

Add to `.env`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://internship_user:your_password@localhost/internship_db
ALLOWED_HOSTS=your_domain.com,your_server_ip
```

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

#### 8. Setup Gunicorn
```bash
# Create systemd service
nano /etc/systemd/system/gunicorn.service
```

Add:
```ini
[Unit]
Description=Gunicorn daemon for Django
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/var/www/FINAL-YEAR-PROJECT2026/Backend
ExecStart=/var/www/FINAL-YEAR-PROJECT2026/Backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/var/www/FINAL-YEAR-PROJECT2026/Backend/gunicorn.sock \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start Gunicorn
systemctl start gunicorn
systemctl enable gunicorn
```

#### 9. Setup Frontend
```bash
cd /var/www/FINAL-YEAR-PROJECT2026/Frontend

# Install dependencies
npm install

# Build
npm run build
```

#### 10. Configure Nginx
```bash
nano /etc/nginx/sites-available/internship
```

Add:
```nginx
server {
    listen 80;
    server_name your_domain.com your_server_ip;

    # Frontend
    location / {
        root /var/www/FINAL-YEAR-PROJECT2026/Frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://unix:/var/www/FINAL-YEAR-PROJECT2026/Backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location /static/ {
        alias /var/www/FINAL-YEAR-PROJECT2026/Backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /var/www/FINAL-YEAR-PROJECT2026/media/;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/internship /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### 11. Setup SSL (Optional but Recommended)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d your_domain.com

# Auto-renewal
certbot renew --dry-run
```

---

## Environment Variables Setup

### Required Environment Variables

#### Backend (.env)
```env
# Django
SECRET_KEY=your-secret-key-here-make-it-long-and-random
DEBUG=False
DJANGO_SETTINGS_MODULE=config.settings_prod

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Allowed Hosts
ALLOWED_HOSTS=your-domain.com,your-backend-url.com

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# Agora (for video calling)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com
VITE_AGORA_APP_ID=your-agora-app-id
```

### How to Generate SECRET_KEY
```python
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

---

## Database Setup

### PostgreSQL on Render (Free)
- Automatically provided
- 90-day expiration (free tier)
- 1GB storage

### PostgreSQL on Railway
- $5/month
- 1GB storage
- No expiration

### PostgreSQL on Heroku
- $5/month (Mini plan)
- 10GB storage

---

## Post-Deployment Checklist

### 1. Test Backend
```bash
curl https://your-backend-url.com/api/
```

### 2. Test Frontend
- Open `https://your-frontend-url.com`
- Try logging in
- Check all features

### 3. Create Admin User
```bash
# On Render: Use Shell tab
# On Railway: Use terminal
# On VPS: SSH and run
python manage.py createsuperuser
```

### 4. Load Initial Data (if needed)
```bash
python manage.py loaddata initial_data.json
```

### 5. Setup Monitoring
- Enable error tracking (Sentry)
- Setup uptime monitoring (UptimeRobot)
- Configure logging

---

## Troubleshooting

### Common Issues

#### 1. Static Files Not Loading
```python
# settings.py
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

```bash
python manage.py collectstatic --no-input
```

#### 2. Database Connection Error
- Check DATABASE_URL format
- Verify database credentials
- Ensure database is running

#### 3. CORS Errors
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-url.com',
]
CORS_ALLOW_CREDENTIALS = True
```

#### 4. 502 Bad Gateway
- Check if Gunicorn is running
- Verify Nginx configuration
- Check application logs

#### 5. Build Fails
- Check Python version (3.11+)
- Verify all dependencies in requirements.txt
- Check build logs for specific errors

---

## Maintenance

### Update Deployment
```bash
# Push changes to GitHub
git add .
git commit -m "Update"
git push origin main

# Render/Railway auto-deploys
# For VPS:
cd /var/www/FINAL-YEAR-PROJECT2026
git pull
systemctl restart gunicorn
systemctl restart nginx
```

### Backup Database
```bash
# Render: Use dashboard
# Railway: Use CLI
# VPS:
pg_dump internship_db > backup.sql
```

### Monitor Logs
```bash
# Render: Dashboard → Logs
# Railway: Dashboard → Logs
# VPS:
journalctl -u gunicorn -f
tail -f /var/log/nginx/error.log
```

---

## Cost Comparison

| Platform | Monthly Cost | Pros | Cons |
|----------|-------------|------|------|
| **Render Free** | $0 | Easy, Free | Limited resources, sleeps after inactivity |
| **Render Paid** | $7 | Always on, Better performance | Cost |
| **Railway** | $5 | Easy, Good performance | Paid only |
| **Heroku** | $7 | Reliable, Established | More expensive |
| **VPS** | $6 | Full control, Best performance | Requires management |

---

## Recommended: Start with Render Free

1. Deploy to Render (free tier)
2. Test everything works
3. If you need better performance, upgrade to paid tier
4. For production with many users, consider VPS

---

## Need Help?

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Django Deployment:** https://docs.djangoproject.com/en/4.2/howto/deployment/
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

---

**Good luck with your deployment! 🚀**
