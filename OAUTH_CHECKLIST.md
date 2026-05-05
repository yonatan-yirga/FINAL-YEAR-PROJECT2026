# ✅ OAuth Setup Checklist

## Quick Reference - Do These in Order

### ✅ Done
- [x] Created Google OAuth client in Google Cloud Console
- [x] Got Client ID: `182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com`
- [x] Updated `Backend/.env` with Client ID
- [x] Created `Frontend/.env` with Client ID

---

### 🔴 TODO - Do These Now

#### 1. Get Client Secret
- [ ] Go to: https://console.cloud.google.com/apis/credentials
- [ ] Click on your OAuth client
- [ ] Copy the Client Secret (starts with `GOCSPX-`)
- [ ] See `GET_CLIENT_SECRET_GUIDE.md` for detailed help

#### 2. Add Secret to Backend
- [ ] Open: `Backend/.env`
- [ ] Find: `GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE`
- [ ] Replace with your actual secret
- [ ] Save file (Ctrl+S)

#### 3. Enable OAuth Buttons in Login
- [ ] Open: `Frontend/src/pages/auth/Login.jsx`
- [ ] Find line ~100: `{false && (`
- [ ] Change to: `{true && (`
- [ ] Save file

#### 4. Enable OAuth Buttons in Register
- [ ] Open: `Frontend/src/pages/auth/Register.jsx`
- [ ] Find line ~170: `{false && (`
- [ ] Change to: `{true && (`
- [ ] Save file

#### 5. Restart Backend Server
- [ ] Stop current server (Ctrl+C in terminal)
- [ ] Run: `cd Backend && python manage.py runserver`

#### 6. Restart Frontend Server
- [ ] Stop current server (Ctrl+C in terminal)
- [ ] Run: `cd Frontend && npm run dev`

#### 7. Test Google Login
- [ ] Open: http://localhost:5173/login
- [ ] See "Continue with Google" button
- [ ] Click it
- [ ] Sign in with Google
- [ ] Get redirected back and logged in

---

## 📁 Files to Edit

```
Backend/.env                          ← Add Client Secret here
Frontend/src/pages/auth/Login.jsx    ← Change false to true (line ~100)
Frontend/src/pages/auth/Register.jsx ← Change false to true (line ~170)
```

---

## 🎯 What Each File Should Look Like

### Backend/.env
```env
# OAuth Configuration
GOOGLE_CLIENT_ID=182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here  ← CHANGE THIS!
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

### Frontend/.env
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### Login.jsx (line ~100)
```javascript
// BEFORE:
{false && (
  <>
    <div className="oauth-buttons">

// AFTER:
{true && (
  <>
    <div className="oauth-buttons">
```

### Register.jsx (line ~170)
```javascript
// BEFORE:
{false && (
  <div className="register-oauth-section">

// AFTER:
{true && (
  <div className="register-oauth-section">
```

---

## 🚀 Quick Commands

```bash
# Terminal 1 - Backend
cd Backend
python manage.py runserver

# Terminal 2 - Frontend
cd Frontend
npm run dev

# Browser
# Open: http://localhost:5173/login
```

---

## ❌ Common Issues

### "redirect_uri_mismatch"
**Fix:** Check Google Cloud Console OAuth client has:
- `http://localhost:5173/auth/callback`
- `http://localhost:8000/api/oauth/callback/`

### "Access blocked"
**Fix:** Add yourself as test user in Google Cloud Console

### "Invalid client"
**Fix:** Check Client ID and Secret in Backend/.env (no spaces, no quotes)

### Buttons don't appear
**Fix:** 
- Changed false to true? ✓
- Saved files? ✓
- Restarted servers? ✓
- Cleared browser cache? (Ctrl+Shift+R)

---

## 📚 Detailed Guides

- **GET_CLIENT_SECRET_GUIDE.md** - How to find/copy your Client Secret
- **OAUTH_FINAL_STEPS.md** - Complete step-by-step instructions
- **OAUTH_SETUP_STEP_BY_STEP.md** - Original full setup guide

---

## 🎉 Success Criteria

You'll know it's working when:
1. ✅ Login page shows "Continue with Google" button
2. ✅ Clicking it opens Google sign-in
3. ✅ After signing in, you're redirected back
4. ✅ You're logged into the dashboard

---

**Current Status:** Need to add Client Secret to Backend/.env

**Next Step:** Follow `GET_CLIENT_SECRET_GUIDE.md` to get your secret!
