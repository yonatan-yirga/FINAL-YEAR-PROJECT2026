# 🚨 Fix: Backend Server Not Running

## The Problem

You're seeing this error:
```
GET http://localhost:8000/api/notifications/unread-count/ net::ERR_CONNECTION_REFUSED
```

This means: **The backend server is not running!**

## The Solution

You need to start the backend server. Here's how:

---

## ✅ Quick Fix - Start Backend Server

### Step 1: Open a New Terminal

Open a **new terminal window** (don't close your frontend terminal)

### Step 2: Navigate to Backend Directory

```bash
cd Backend
```

### Step 3: Start the Backend Server

```bash
python manage.py runserver
```

**Expected Output:**
```
Django version 4.2.x, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Step 4: Verify Backend is Running

Open your browser and go to:
- http://localhost:8000/api/

You should see:
```json
{
  "status": "success",
  "message": "University Internship API is running",
  "version": "1.0.0"
}
```

---

## 🎯 Complete Setup (Both Servers)

You need **TWO terminal windows** running at the same time:

### Terminal 1: Backend Server

```bash
cd Backend
python manage.py runserver
```

**Status:** ✅ Running on http://localhost:8000

### Terminal 2: Frontend Server

```bash
cd Frontend
npm run dev
```

**Status:** ✅ Running on http://localhost:5173

---

## 🔍 Verify Everything is Working

### 1. Check Backend
Open: http://localhost:8000/api/
- Should show JSON response
- Status: "success"

### 2. Check Frontend
Open: http://localhost:5173
- Should load the application
- No connection errors in console

### 3. Check Browser Console
Press F12 → Console tab
- Should NOT see "ERR_CONNECTION_REFUSED"
- Should see successful API calls

---

## 📊 Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│                  YOUR SETUP                              │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Terminal 1      │      │  Terminal 2      │        │
│  │  (Backend)       │      │  (Frontend)      │        │
│  │                  │      │                  │        │
│  │  cd Backend      │      │  cd Frontend     │        │
│  │  python manage.py│      │  npm run dev     │        │
│  │  runserver       │      │                  │        │
│  │                  │      │                  │        │
│  │  ✅ Port 8000    │      │  ✅ Port 5173    │        │
│  └──────────────────┘      └──────────────────┘        │
│                                                          │
│  Both must be running at the same time!                 │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Only Frontend Running
```
Frontend: ✅ Running
Backend:  ❌ Not running
Result:   ERR_CONNECTION_REFUSED
```

### ❌ Mistake 2: Closed Backend Terminal
```
Started backend, then closed terminal
Result: Backend stopped, connection refused
```

### ✅ Correct Setup
```
Frontend: ✅ Running (Terminal 1)
Backend:  ✅ Running (Terminal 2)
Result:   Everything works!
```

---

## 🛠️ Troubleshooting

### Issue: "python: command not found"

**Windows:**
```bash
py manage.py runserver
```

**Mac/Linux:**
```bash
python3 manage.py runserver
```

### Issue: "Port 8000 already in use"

**Find and kill the process:**

**Windows:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Issue: "No module named 'django'"

**Install dependencies:**
```bash
cd Backend
pip install -r requirements.txt
```

### Issue: Backend starts but crashes

**Check for errors in terminal**
- Read the error message
- Usually tells you what's wrong
- Common: Database not configured

---

## 📝 Checklist

Before using the application, make sure:

- [ ] Backend terminal is open
- [ ] Backend server is running (`python manage.py runserver`)
- [ ] You see "Starting development server at http://127.0.0.1:8000/"
- [ ] Frontend terminal is open
- [ ] Frontend server is running (`npm run dev`)
- [ ] You see "Local: http://localhost:5173/"
- [ ] Browser console shows no connection errors
- [ ] You can access http://localhost:8000/api/

---

## 🎯 Quick Test

Run this in a **new terminal** to test if backend is running:

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/api/ | Select-Object -ExpandProperty Content
```

**Mac/Linux:**
```bash
curl http://localhost:8000/api/
```

**Expected Response:**
```json
{"status":"success","message":"University Internship API is running","version":"1.0.0"}
```

If you get an error, backend is not running!

---

## 💡 Pro Tips

1. **Keep both terminals visible** - Use split screen or tabs
2. **Don't close terminals** - Keep them running while developing
3. **Check terminal output** - Errors show up there first
4. **Use Ctrl+C to stop** - Don't just close the terminal
5. **Restart if needed** - Stop with Ctrl+C, then start again

---

## 🚀 Start Now!

### Step-by-Step:

1. **Open Terminal 1:**
   ```bash
   cd Backend
   python manage.py runserver
   ```
   ✅ Leave this running!

2. **Open Terminal 2:**
   ```bash
   cd Frontend
   npm run dev
   ```
   ✅ Leave this running!

3. **Open Browser:**
   - Go to: http://localhost:5173
   - Check console (F12) - no errors!

4. **Start Using the App:**
   - Login
   - Test features
   - Everything should work!

---

## 📞 Still Having Issues?

### Check These:

1. ✅ Both terminals open?
2. ✅ Both servers running?
3. ✅ No error messages in terminals?
4. ✅ Can access http://localhost:8000/api/?
5. ✅ Can access http://localhost:5173?

### If Still Not Working:

1. **Stop both servers** (Ctrl+C in each terminal)
2. **Close all terminals**
3. **Open fresh terminals**
4. **Start backend first**
5. **Then start frontend**
6. **Try again**

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Backend terminal shows: "Starting development server at http://127.0.0.1:8000/"
- ✅ Frontend terminal shows: "Local: http://localhost:5173/"
- ✅ Browser loads the application
- ✅ No "ERR_CONNECTION_REFUSED" errors
- ✅ You can login and use features
- ✅ API calls work (check Network tab in browser)

---

**Remember: You need BOTH servers running at the same time!** 🚀

---

## 📚 Related Guides

- `HOW_TO_RUN_BACKEND.md` - Detailed backend setup
- `QUICK_START_BOTH_SERVERS.md` - Complete startup guide
- `COMMANDS_CHEAT_SHEET.md` - All useful commands

---

**Now go start that backend server!** 💪
