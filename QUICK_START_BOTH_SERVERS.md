# 🚀 Quick Start - Run Both Servers

## The Simplest Way to Start Everything

### Step 1: Open Two Terminals

You need **2 terminal windows** (or tabs):
- Terminal 1: For Backend
- Terminal 2: For Frontend

---

## Terminal 1: Start Backend

```bash
# Navigate to Backend folder
cd Backend

# Start the server
python manage.py runserver
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ **Backend is running on: http://localhost:8000**

---

## Terminal 2: Start Frontend

```bash
# Navigate to Frontend folder (from project root)
cd Frontend

# Start the development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Frontend is running on: http://localhost:5173**

---

## 🎯 Access Your Application

### Main Application
Open your browser and go to:
- **http://localhost:5173**

### Test Accounts

**Company Account:**
- Email: `company1@test.com`
- Password: `Test@123` (or your password)

**Student Account:**
- Email: `student1@test.com`
- Password: `Test@123` (or your password)

**Admin Account:**
- Email: `admin@test.com`
- Password: `Test@123` (or your password)

---

## 🧪 Test the New Features

### 1. Partner Organizations
1. Login as company user
2. Go to: http://localhost:5173/partner-organizations
3. You should see 4 partner companies

### 2. Network Stats
1. Login as company user
2. Go to: http://localhost:5173/company/dashboard
3. Click "Network Stats" card
4. View comprehensive statistics

### 3. Company Messages
1. Login as company user
2. Go to: http://localhost:5173/company/messages
3. Chat with students and advisors

---

## 🛑 Stop the Servers

### Stop Backend (Terminal 1)
Press: `Ctrl + C`

### Stop Frontend (Terminal 2)
Press: `Ctrl + C`

---

## 🔄 Restart Servers

Just run the same commands again:

**Backend:**
```bash
cd Backend
python manage.py runserver
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

---

## ⚠️ Common Issues

### Issue: "Port already in use"

**Backend (Port 8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Issue: "Module not found"

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd Frontend
npm install
```

---

## 📊 Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                            │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Terminal 1     │         │   Terminal 2     │         │
│  │                  │         │                  │         │
│  │  cd Backend      │         │  cd Frontend     │         │
│  │  python manage.py│         │  npm run dev     │         │
│  │  runserver       │         │                  │         │
│  │                  │         │                  │         │
│  │  ✅ Backend      │         │  ✅ Frontend     │         │
│  │  Port 8000       │         │  Port 5173       │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│                   ┌────▼────┐                               │
│                   │ Browser │                               │
│                   │         │                               │
│                   │ localhost:5173                          │
│                   └─────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Complete Workflow

### 1. Start Servers (Every Time)
```bash
# Terminal 1
cd Backend && python manage.py runserver

# Terminal 2
cd Frontend && npm run dev
```

### 2. Open Browser
- Go to: http://localhost:5173

### 3. Login
- Use any test account

### 4. Test Features
- Partner Organizations
- Network Stats
- Messages
- Dashboard

### 5. Stop Servers (When Done)
- Press `Ctrl+C` in both terminals

---

## 📝 Quick Reference

| What | Where | Command |
|------|-------|---------|
| Backend | Terminal 1 | `cd Backend && python manage.py runserver` |
| Frontend | Terminal 2 | `cd Frontend && npm run dev` |
| Backend URL | Browser | http://localhost:8000 |
| Frontend URL | Browser | http://localhost:5173 |
| Stop Server | Terminal | `Ctrl + C` |

---

## 🎉 That's It!

You now have:
- ✅ Backend running on port 8000
- ✅ Frontend running on port 5173
- ✅ Full application accessible at localhost:5173
- ✅ All features working (Partner Organizations, Network Stats, Messages)

**Happy coding!** 🚀

---

## 💡 Pro Tips

1. **Keep both terminals open** while developing
2. **Backend auto-reloads** when you change Python files
3. **Frontend auto-reloads** when you change React files
4. **Check terminal logs** if something doesn't work
5. **Use Ctrl+C** to stop servers cleanly

---

## 🆘 Need More Help?

- **Backend Issues**: See `HOW_TO_RUN_BACKEND.md`
- **Frontend Issues**: See `README.md`
- **Feature Docs**: See `NETWORK_STATS_FEATURE.md`
- **Quick Start**: See `NETWORK_STATS_QUICK_START.md`
