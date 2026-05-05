# OAuth Setup Checklist ✅

Quick checklist to set up OAuth credentials in 20 minutes.

---

## 🔵 Google OAuth Setup

### Part 1: Google Cloud Console
- [ ] Go to https://console.cloud.google.com/
- [ ] Create new project: "DMU Internship Portal"
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add redirect URIs:
  - [ ] `http://localhost:5173/auth/callback`
  - [ ] `http://localhost:8000/api/oauth/callback/`
- [ ] Copy Client ID
- [ ] Copy Client Secret

**Your Google Credentials:**
```
Client ID: _________________________________
Client Secret: _____________________________
```

---

## ⚫ GitHub OAuth Setup

### Part 2: GitHub Developer Settings
- [ ] Go to https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in details:
  - [ ] Name: "DMU Internship Portal"
  - [ ] Homepage: `http://localhost:5173`
  - [ ] Callback: `http://localhost:5173/auth/callback`
- [ ] Register application
- [ ] Copy Client ID
- [ ] Generate and copy Client Secret

**Your GitHub Credentials:**
```
Client ID: _________________________________
Client Secret: _____________________________
```

---

## 📝 Add Credentials to Project

### Part 3: Backend Configuration
- [ ] Open `Backend/.env`
- [ ] Add/Update these lines:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
FRONTEND_URL=http://localhost:5173
```
- [ ] Save file

### Part 4: Frontend Configuration
- [ ] Create/Open `Frontend/.env`
- [ ] Add these lines:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```
- [ ] Save file

---

## 🧪 Test OAuth

### Part 5: Testing
- [ ] Stop all servers (Ctrl+C)
- [ ] Start backend: `cd Backend && python manage.py runserver`
- [ ] Start frontend: `cd Frontend && npm run dev`
- [ ] Open browser: `http://localhost:5173/login`
- [ ] Test Google OAuth:
  - [ ] Click "Continue with Google"
  - [ ] Sign in with Google
  - [ ] Authorize app
  - [ ] Redirected to dashboard ✅
- [ ] Test GitHub OAuth:
  - [ ] Click "Continue with GitHub"
  - [ ] Authorize app
  - [ ] Redirected to dashboard ✅

---

## ✅ Success Criteria

You're done when:
- ✅ Both OAuth buttons appear on login page
- ✅ Google OAuth redirects and logs you in
- ✅ GitHub OAuth redirects and logs you in
- ✅ No console errors
- ✅ User is redirected to correct dashboard

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "redirect_uri_mismatch" | Check redirect URIs in OAuth provider settings |
| "Invalid client" | Verify Client ID/Secret in `.env` files |
| Buttons don't appear | Restart frontend server, clear cache |
| "Cannot read property" | Check `oauthService.js` exists |

---

## 📞 Quick Help

**If stuck:**
1. Check `OAUTH_CREDENTIALS_SETUP_GUIDE.md` for detailed steps
2. Review browser console for errors
3. Check Django server logs
4. Verify `.env` files have correct values

---

**Total Time:** ~20 minutes

**Status:** [ ] Not Started  [ ] In Progress  [ ] Complete ✅
