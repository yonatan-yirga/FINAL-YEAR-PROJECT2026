# 🚀 Deployment Guide - Internship Management System

## 📋 Deployment Options

I'll provide 3 deployment options from easiest to most advanced:

1. **Render.com** (Easiest - Free tier available) ⭐ RECOMMENDED
2. **Railway.app** (Easy - Free tier available)
3. **DigitalOcean/AWS** (Advanced - Paid)

---

## ⭐ OPTION 1: Render.com (RECOMMENDED - Easiest)

### Why Render?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy database setup
- ✅ Auto-deploy from Git
- ✅ No credit card required for free tier

### Step-by-Step Deployment:

#### STEP 1: Prepare Your Code

1. **Create `.gitignore` if not exists**:
```bash
# In project root
echo "*.pyc
__pycache__/
.env
*.sqlite3
node_modules/
dist/
build/
.venv/
venv/" > .gitignore
```

2. **Create `requirements.txt`**:
```bash
cd Backend
pip freeze > requirements.txt
```

3. **Create `build.sh` for Render**:
```bash
# In Backend folder
cat > build.sh << 'EOF'
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
EOF

chmod +x build.sh
```

4. **Update Django Settings for Production**:

Create `Backend/core/production_settings.py`:
```python
from .settings import *
import os
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['.onrender.com', 'localhost', '127.0.0.1']

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600
    )
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

5. **Install production dependencies**:
```bash
cd Backend
pip install dj-database-url gunicorn whitenoise psycopg2-binary
pip freeze > requirements.txt
```

6. **Update `Backend/core/settings.py`**:
```python
# Add at the top
import os

# Add whitenoise to middleware (after SecurityMiddleware)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... rest of middleware
]

# Add at the bottom
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### STEP 2: Push to GitHub

1. **Initialize Git** (if not already):
```bash
git init
git add .
git commit -m "Initial commit for deployment"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., "internship-management-system")
   - Don't initialize with README (you already have code)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### STEP 3: Deploy Backend on Render

1. **Go to Render**: https://render.com
2. **Sign up** with GitHub
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: internship-backend
     Region: Choose closest to you
     Branch: main
     Root Directory: Backend
     Runtime: Python 3
     Build Command: ./build.sh
     Start Command: gunicorn core.wsgi:application
     ```

4. **Add Environment Variables**:
   ```
   PYTHON_VERSION=3.11.0
   SECRET_KEY=your-secret-key-here-generate-random-string
   DATABASE_URL=(Render will auto-fill this)
   DJANGO_SETTINGS_MODULE=core.production_settings
   ```

5. **Create PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: internship-db
   - Copy the "Internal Database URL"
   - Add it to your web service as `DATABASE_URL`

6. **Deploy**: Click "Create Web Service"

#### STEP 4: Deploy Frontend on Render

1. **Update Frontend API URL**:

Edit `Frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api/';
```

2. **Create `Frontend/.env.production`**:
```
VITE_API_URL=https://your-backend-url.onrender.com/api/
```

3. **Create `Frontend/render.yaml`**:
```yaml
services:
  - type: web
    name: internship-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

4. **Deploy Frontend**:
   - Click "New +" → "Static Site"
   - Connect same GitHub repository
   - Configure:
     ```
     Name: internship-frontend
     Branch: main
     Root Directory: Frontend
     Build Command: npm install && npm run build
     Publish Directory: dist
     ```

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api/
   ```

#### STEP 5: Update Backend CORS

Update your backend environment variables on Render:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

#### STEP 6: Create Superuser

1. Go to Render Dashboard → Your Backend Service
2. Click "Shell" tab
3. Run:
```bash
python manage.py createsuperuser
```

---

## 🎯 OPTION 2: Railway.app (Alternative)

### Quick Deploy:

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → "Deploy from GitHub repo"
4. **Add PostgreSQL**: Click "New" → "Database" → "PostgreSQL"
5. **Configure Backend**:
   - Root Directory: `Backend`
   - Build Command: `pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `gunicorn core.wsgi:application`
6. **Configure Frontend**:
   - Root Directory: `Frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

---

## 🌐 OPTION 3: Free Hosting Alternatives

### A. Vercel (Frontend) + Render (Backend)

**Frontend on Vercel**:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: Frontend
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable: `VITE_API_URL`

**Backend on Render**: Follow Option 1 steps for backend

### B. Netlify (Frontend) + Railway (Backend)

**Frontend on Netlify**:
1. Go to https://netlify.com
2. "Add new site" → "Import from Git"
3. Configure:
   - Base directory: `Frontend`
   - Build command: `npm run build`
   - Publish directory: `Frontend/dist`
4. Add environment variable: `VITE_API_URL`

---

## 📝 Quick Setup Script

I'll create a script to help you prepare for deployment:

```bash
#!/bin/bash
# Save this as deploy-prep.sh

echo "🚀 Preparing for deployment..."

# Backend preparation
echo "📦 Preparing Backend..."
cd Backend
pip install dj-database-url gunicorn whitenoise psycopg2-binary
pip freeze > requirements.txt

# Create build script
cat > build.sh << 'EOF'
#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
EOF
chmod +x build.sh

# Frontend preparation
echo "📦 Preparing Frontend..."
cd ../Frontend
npm install

echo "✅ Preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Sign up on Render.com"
echo "3. Follow deployment steps in DEPLOYMENT_GUIDE.md"
```

---

## 🔐 Environment Variables Needed

### Backend (.env):
```
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_HOSTS=.onrender.com,localhost
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend-url.onrender.com/api/
```

---

## 🎉 After Deployment

### Your URLs will be:
- **Frontend**: `https://your-app-name.onrender.com`
- **Backend**: `https://your-backend-name.onrender.com`
- **Admin Panel**: `https://your-backend-name.onrender.com/admin`

### Share with Friends:
```
🎓 Internship Management System
🌐 URL: https://your-app-name.onrender.com

Login Credentials:
📧 Email: [provide email]
🔑 Password: [provide password]
```

---

## 🐛 Troubleshooting

### Issue: "Application Error"
**Solution**: Check Render logs for detailed error

### Issue: "CORS Error"
**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS`

### Issue: "Database Connection Error"
**Solution**: Verify `DATABASE_URL` environment variable

### Issue: "Static Files Not Loading"
**Solution**: Run `python manage.py collectstatic`

---

## 💰 Cost Estimate

### Free Tier (Render):
- ✅ Backend: Free (sleeps after 15 min inactivity)
- ✅ Frontend: Free
- ✅ Database: Free (90 days, then $7/month)
- ⚠️ Note: Free tier has limitations

### Paid Tier (Recommended for production):
- Backend: $7/month
- Database: $7/month
- Frontend: Free
- **Total**: ~$14/month

---

## 📞 Need Help?

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Check database connection
4. Review CORS settings
5. Test API endpoints

---

**Ready to Deploy?** Follow Option 1 (Render.com) for the easiest deployment!
