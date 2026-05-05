# 🔧 Fix: Missing Python Packages

## The Error You're Seeing

```
ModuleNotFoundError: No module named 'rest_framework_simplejwt'
```

## What This Means

❌ **The required Python packages are not installed!**

---

## ✅ THE FIX (2 minutes)

### Quick Solution:

```bash
pip install -r requirements.txt
```

**That's it!** This installs all required packages.

---

## 🎯 Step-by-Step Fix

### Step 1: Make Sure You're in Backend Directory

```bash
cd ~/Downloads/FINAL-YEAR-PROJECT2026/backend
```

Or if you're already there:
```bash
pwd
# Should show: /c/Users/.../FINAL-YEAR-PROJECT2026/backend
```

### Step 2: Verify Virtual Environment is Active

You should see `(venv)` at the start of your prompt:
```bash
(venv) YO@YO MINGW64 ~/Downloads/FINAL-YEAR-PROJECT2026/backend (main)$
```

✅ You already have this! Good!

### Step 3: Install All Packages

```bash
pip install -r requirements.txt
```

**This will take 1-2 minutes** and install:
- Django 6.0.4
- Django REST Framework
- djangorestframework-simplejwt (the missing one!)
- psycopg2-binary (database)
- Pillow (images)
- channels (WebSockets)
- And 40+ other packages

**Expected output:**
```
Collecting Django==6.0.4
Downloading Django-6.0.4-py3-none-any.whl
Collecting djangorestframework==3.17.1
Downloading djangorestframework-3.17.1-py3-none-any.whl
Collecting djangorestframework-simplejwt==5.3.1
Downloading djangorestframework_simplejwt-5.3.1-py3-none-any.whl
...
Successfully installed Django-6.0.4 djangorestframework-3.17.1 ...
```

### Step 4: Verify Installation

```bash
pip list | grep django
```

Should show:
```
Django                        6.0.4
django-allauth                0.57.0
django-cleanup                8.0.0
django-cors-headers           4.3.1
django-extensions             3.2.3
djangorestframework           3.17.1
djangorestframework-simplejwt 5.3.1
```

### Step 5: Run Migrations

```bash
python manage.py migrate
```

**Expected output:**
```
Operations to perform:
  Apply all migrations: accounts, admin, applications, ...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying accounts.0001_initial... OK
  ...
```

### Step 6: Start the Server

```bash
python manage.py runserver
```

**Expected output:**
```
Django version 6.0.4, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ **Success!** Backend is now running!

---

## 🔍 If Installation Fails

### Issue 1: "pip: command not found"

**Try:**
```bash
python -m pip install -r requirements.txt
```

### Issue 2: "Permission denied"

**Try:**
```bash
pip install --user -r requirements.txt
```

### Issue 3: Old pip version

**Upgrade pip first:**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Issue 4: Network/Download errors

**Try with timeout:**
```bash
pip install -r requirements.txt --timeout 120
```

### Issue 5: Specific package fails

**Install manually:**
```bash
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install psycopg2-binary
pip install pillow
pip install django-cors-headers
pip install channels
pip install daphne
pip install reportlab
```

---

## 📦 What Gets Installed

### Core Packages:
- **Django 6.0.4** - Web framework
- **Django REST Framework 3.17.1** - API framework
- **djangorestframework-simplejwt 5.3.1** - JWT authentication
- **psycopg2-binary 2.9.11** - PostgreSQL database
- **Pillow 12.2.0** - Image handling

### Additional Packages:
- **channels 4.0.0** - WebSockets
- **django-cors-headers 4.3.1** - CORS support
- **reportlab 4.4.10** - PDF generation
- **redis 7.4.0** - Caching
- **gunicorn 25.3.0** - Production server
- **whitenoise 6.9.0** - Static files

### OAuth Packages:
- **django-allauth 0.57.0** - Social authentication
- **dj-rest-auth 5.0.2** - REST auth
- **requests 2.31.0** - HTTP library
- **PyJWT 2.8.0** - JWT tokens

**Total: 50+ packages**

---

## ⏱️ Installation Time

- **Fast internet**: 1-2 minutes
- **Slow internet**: 3-5 minutes
- **Very slow**: Up to 10 minutes

**Be patient!** Let it finish completely.

---

## ✅ Verification Checklist

After installation:

- [ ] No error messages during install
- [ ] `pip list` shows Django and other packages
- [ ] `python manage.py migrate` works
- [ ] `python manage.py runserver` starts successfully
- [ ] Can access http://localhost:8000/api/

---

## 🎯 Complete Command Sequence

Copy and paste these commands one by one:

```bash
# 1. Go to backend directory
cd ~/Downloads/FINAL-YEAR-PROJECT2026/backend

# 2. Activate virtual environment (if not active)
source venv/Scripts/activate  # Git Bash
# OR
venv\Scripts\activate  # CMD

# 3. Upgrade pip
python -m pip install --upgrade pip

# 4. Install all packages
pip install -r requirements.txt

# 5. Run migrations
python manage.py migrate

# 6. Start server
python manage.py runserver
```

---

## 📊 Expected Output

### During Installation:
```
Collecting Django==6.0.4
  Downloading Django-6.0.4-py3-none-any.whl (8.2 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 8.2/8.2 MB 5.2 MB/s
Collecting djangorestframework==3.17.1
  Downloading djangorestframework-3.17.1-py3-none-any.whl (1.1 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.1/1.1 MB 6.8 MB/s
...
Successfully installed Django-6.0.4 asgiref-3.11.1 ...
```

### After Migrations:
```
Operations to perform:
  Apply all migrations: accounts, admin, advisors, applications, ...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
  Applying internships.0002_internship_company_logo... OK
```

### Server Running:
```
Django version 6.0.4, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## 💡 Pro Tips

1. **Always activate venv first** - See `(venv)` in prompt
2. **Install packages before running** - Avoid this error
3. **Keep requirements.txt updated** - When adding new packages
4. **Use virtual environment** - Isolates project dependencies
5. **Check pip version** - Keep it updated

---

## 🆘 Still Having Issues?

### Check These:

1. ✅ Virtual environment activated? (see `(venv)`)
2. ✅ In correct directory? (`pwd` shows backend folder)
3. ✅ Internet connection working?
4. ✅ Enough disk space? (need ~500MB)
5. ✅ Python version 3.8+? (`python --version`)

### Get More Help:

```bash
# Check Python version
python --version

# Check pip version
pip --version

# Check if requirements.txt exists
ls requirements.txt

# Check virtual environment
which python  # Should show venv path
```

---

## ✅ Success Indicators

You'll know it worked when:

- ✅ Installation completes without errors
- ✅ `pip list` shows 50+ packages
- ✅ Migrations run successfully
- ✅ Server starts on port 8000
- ✅ Can access http://localhost:8000/api/
- ✅ No "ModuleNotFoundError" errors

---

**Run the command now and your backend will work!** 🚀

```bash
pip install -r requirements.txt
```
