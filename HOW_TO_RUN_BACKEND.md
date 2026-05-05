# 🚀 How to Run the Backend Server

## Quick Start (If Already Set Up)

If you've already set up the backend before, just run:

```bash
cd Backend
python manage.py runserver
```

The backend will start on: **http://localhost:8000**

---

## First Time Setup

### Step 1: Check Python Installation

```bash
python --version
```

You should see Python 3.8 or higher. If not installed, download from [python.org](https://www.python.org/downloads/)

### Step 2: Navigate to Backend Directory

```bash
cd Backend
```

### Step 3: Create Virtual Environment (Optional but Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

You'll see `(venv)` in your terminal when activated.

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Django
- Django REST Framework
- PostgreSQL adapter (psycopg2)
- Pillow (for image handling)
- And more...

### Step 5: Check Database Configuration

Your `.env` file should already be configured. Let me verify:

```bash
# Check if .env exists
ls .env
```

If it exists, you're good! The database is already configured.

### Step 6: Run Migrations (If Needed)

```bash
python manage.py migrate
```

This creates/updates database tables.

### Step 7: Start the Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## ✅ Verify Backend is Running

### Method 1: Browser
Open your browser and go to:
- **http://localhost:8000/api/**

You should see a JSON response:
```json
{
  "status": "success",
  "message": "University Internship API is running",
  "version": "1.0.0"
}
```

### Method 2: Admin Panel
Go to:
- **http://localhost:8000/admin/**

You should see the Django admin login page.

---

## 🔧 Common Issues & Solutions

### Issue 1: "python: command not found"

**Solution:**
- Windows: Use `py` instead of `python`
  ```bash
  py manage.py runserver
  ```
- Mac/Linux: Install Python from python.org

### Issue 2: "No module named 'django'"

**Solution:**
```bash
pip install -r requirements.txt
```

### Issue 3: Port 8000 already in use

**Solution:**
Run on a different port:
```bash
python manage.py runserver 8001
```

Or find and kill the process using port 8000:

**Windows:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Issue 4: Database errors

**Solution:**
```bash
# Reset migrations (if needed)
python manage.py migrate --run-syncdb

# Or recreate database
python manage.py flush
python manage.py migrate
```

### Issue 5: "ModuleNotFoundError: No module named 'psycopg2'"

**Solution:**
```bash
pip install psycopg2-binary
```

---

## 📝 Useful Commands

### Check Server Status
```bash
# Test if server is responding
curl http://localhost:8000/api/
```

### Create Superuser (Admin Account)
```bash
python manage.py createsuperuser
```

### Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Collect Static Files
```bash
python manage.py collectstatic
```

### Run Tests
```bash
python manage.py test
```

### Check for Issues
```bash
python manage.py check
```

### View All URLs
```bash
python manage.py show_urls
```

---

## 🎯 Quick Test Script

Create a file `test_backend.py` in the Backend directory:

```python
import requests

try:
    response = requests.get('http://localhost:8000/api/')
    if response.status_code == 200:
        print("✅ Backend is running!")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ Backend returned status code: {response.status_code}")
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to backend. Is it running?")
except Exception as e:
    print(f"❌ Error: {e}")
```

Run it:
```bash
python test_backend.py
```

---

## 🔄 Restart Backend

If you need to restart the backend:

1. **Stop the server**: Press `Ctrl+C` in the terminal
2. **Start again**: `python manage.py runserver`

---

## 🌐 Access Points

Once the backend is running, you can access:

### API Endpoints
- **Root API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **Auth Endpoints**: http://localhost:8000/api/auth/
- **Internships**: http://localhost:8000/api/internships/
- **Applications**: http://localhost:8000/api/applications/
- **Messages**: http://localhost:8000/api/messages/
- **Partner Organizations**: http://localhost:8000/api/auth/partner-organizations/

### Media Files
- **Uploaded Files**: http://localhost:8000/media/

---

## 📊 Check Backend Logs

The terminal where you ran `python manage.py runserver` will show:
- Incoming requests
- Errors
- Database queries (if DEBUG=True)
- Email sending status

Example output:
```
[01/May/2026 10:30:15] "GET /api/auth/partner-organizations/ HTTP/1.1" 200 1234
[01/May/2026 10:30:16] "GET /api/internships/ HTTP/1.1" 200 5678
```

---

## 🛠️ Development Mode vs Production

### Development (Current Setup)
```bash
python manage.py runserver
```
- Auto-reloads on code changes
- Detailed error pages
- Serves media files
- DEBUG=True

### Production
```bash
gunicorn config.wsgi:application
```
- No auto-reload
- Generic error pages
- Requires web server (Nginx)
- DEBUG=False

---

## 🔐 Environment Variables

Your `.env` file contains:
- Database credentials
- Secret key
- Email settings
- Debug mode
- Allowed hosts

**Never commit `.env` to Git!**

---

## 📱 Test with Frontend

Once backend is running:

1. **Start Frontend** (in new terminal):
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Open Browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/

3. **Login and Test**:
   - Use existing accounts or create new ones
   - Test features like Partner Organizations, Network Stats, etc.

---

## 🎓 Sample Data

If you need sample data:

```bash
# Seed sample data
python manage.py shell < seed_sample_data.py

# Or run specific seed scripts
python seed_admin_uil.py
python seed_departments.py
```

---

## 🆘 Still Having Issues?

### Check These:
1. ✅ Python installed (3.8+)
2. ✅ Virtual environment activated
3. ✅ Dependencies installed (`pip install -r requirements.txt`)
4. ✅ Database configured (`.env` file)
5. ✅ Migrations run (`python manage.py migrate`)
6. ✅ Port 8000 available

### Get Help:
- Check error messages in terminal
- Look at `Backend/logs/` if exists
- Check Django documentation: https://docs.djangoproject.com/

---

## 📋 Complete Startup Checklist

- [ ] Navigate to Backend directory
- [ ] Activate virtual environment (if using)
- [ ] Install dependencies (first time only)
- [ ] Run migrations (first time only)
- [ ] Start server: `python manage.py runserver`
- [ ] Verify at http://localhost:8000/api/
- [ ] Check terminal for errors
- [ ] Start frontend in separate terminal
- [ ] Test the application

---

## 🎉 Success!

If you see this in your terminal:
```
Django version 4.2.x, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Your backend is running successfully!** 🚀

Now you can:
- Access the API at http://localhost:8000/api/
- Use the admin panel at http://localhost:8000/admin/
- Connect your frontend at http://localhost:5173
- Test all features including Network Stats!

---

**Need help?** Check the error messages in your terminal - they usually tell you exactly what's wrong!
