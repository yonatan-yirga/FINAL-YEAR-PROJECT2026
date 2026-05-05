# 🚨 ERROR: Backend Server Not Running!

## The Error You're Seeing

```
GET http://localhost:8000/api/notifications/unread-count/ 
net::ERR_CONNECTION_REFUSED
```

## What This Means

❌ **The backend server is NOT running!**

The frontend is trying to connect to the backend at `http://localhost:8000`, but nothing is there.

---

## ✅ THE FIX (30 seconds)

### Open a New Terminal and Run:

```bash
cd Backend
python manage.py runserver
```

**That's it!** The error will disappear.

---

## 🎯 You Need TWO Terminals Running

### Terminal 1: Backend
```bash
cd Backend
python manage.py runserver
```
**Must stay open!** ✅ Port 8000

### Terminal 2: Frontend  
```bash
cd Frontend
npm run dev
```
**Must stay open!** ✅ Port 5173

---

## 🔍 How to Check if Backend is Running

### Method 1: Check Terminal
Look for this message:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Method 2: Open Browser
Go to: http://localhost:8000/api/

Should see:
```json
{
  "status": "success",
  "message": "University Internship API is running"
}
```

### Method 3: Check Browser Console
Press F12 → Console
- ✅ No "ERR_CONNECTION_REFUSED" = Backend running
- ❌ "ERR_CONNECTION_REFUSED" = Backend NOT running

---

## 📊 Current Status

Based on your error, here's what's happening:

```
Frontend:  ✅ RUNNING (you can see the page)
Backend:   ❌ NOT RUNNING (connection refused)

Result: Frontend can't get data from backend
```

---

## 🚀 Start Backend NOW

### Windows:
```bash
cd Backend
python manage.py runserver
```

### Mac/Linux:
```bash
cd Backend
python3 manage.py runserver
```

### Alternative (if python doesn't work):
```bash
cd Backend
py manage.py runserver
```

---

## ✅ After Starting Backend

1. **Check terminal** - Should see "Starting development server..."
2. **Refresh browser** - Errors should disappear
3. **Check console** - No more connection errors
4. **Use the app** - Everything should work!

---

## ⚠️ Important

### DON'T:
- ❌ Close the backend terminal
- ❌ Stop the backend server
- ❌ Only run frontend

### DO:
- ✅ Keep both terminals open
- ✅ Keep both servers running
- ✅ Run backend AND frontend together

---

## 🎯 Quick Checklist

Before using the app:

- [ ] Backend terminal open
- [ ] Backend running: `python manage.py runserver`
- [ ] See "Starting development server" message
- [ ] Frontend terminal open  
- [ ] Frontend running: `npm run dev`
- [ ] Browser shows no connection errors

---

## 💡 Remember

**The application needs BOTH servers:**

1. **Backend** (Port 8000) - Handles data, database, API
2. **Frontend** (Port 5173) - Shows the user interface

**If backend is not running:**
- Frontend loads but can't get data
- You see "ERR_CONNECTION_REFUSED"
- Features don't work
- Login fails
- API calls fail

---

## 🆘 Still Not Working?

### Try This:

1. **Stop everything** (Ctrl+C in all terminals)
2. **Close all terminals**
3. **Open NEW terminal 1:**
   ```bash
   cd Backend
   python manage.py runserver
   ```
4. **Open NEW terminal 2:**
   ```bash
   cd Frontend
   npm run dev
   ```
5. **Refresh browser**

---

## ✅ Success!

You'll know it's working when:

- ✅ Backend terminal shows server running
- ✅ Frontend terminal shows Vite running
- ✅ Browser console has no errors
- ✅ You can login and use features
- ✅ Data loads properly

---

**GO START YOUR BACKEND SERVER NOW!** 🚀

```bash
cd Backend
python manage.py runserver
```

**Then refresh your browser!** 🔄
