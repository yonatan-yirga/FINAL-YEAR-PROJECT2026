# 🚀 OAuth Complete Setup Guide

## 📊 Current Status

✅ **Completed:**
- Google OAuth client created
- Client ID obtained: `182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com`
- Backend/.env updated with Client ID
- Frontend/.env created with Client ID
- OAuth buttons enabled in Login and Register pages

⚠️ **Remaining:**
- Add redirect URI to Google Cloud Console (5 minutes)
- Add Client Secret to Backend/.env (2 minutes)
- Restart servers (1 minute)
- Test (1 minute)

**Total time to complete:** ~10 minutes

---

## 🎯 Step-by-Step Instructions

### Step 1: Fix redirect_uri_mismatch Error (5 minutes)

This is the error you're currently getting. Here's how to fix it:

#### 1.1 Open Google Cloud Console
- Go to: **https://console.cloud.google.com/apis/credentials**
- Make sure "DMU Internship Portal" is selected at the top

#### 1.2 Open Your OAuth Client
- Find "DMU Internship Portal Web Client" in the list
- **Click on the name** (not the edit icon)

#### 1.3 Add JavaScript Origins
Scroll to "Authorized JavaScript origins" section:
- Click **"+ ADD URI"**
- Add: `http://localhost:5173`
- Click **"+ ADD URI"** again
- Add: `http://localhost:8000`

#### 1.4 Add Redirect URI
Scroll to "Authorized redirect URIs" section:
- Click **"+ ADD URI"**
- Add: `http://localhost:5173/auth/callback`

**IMPORTANT:** Must be EXACTLY:
- `http://` (not https)
- `localhost` (not 127.0.0.1)
- `/auth/callback` (lowercase, no trailing slash)

#### 1.5 Save
- Scroll to bottom
- Click **"SAVE"**
- Wait for confirmation message

#### 1.6 Wait
- Wait **1-2 minutes** for Google to update the configuration

---

### Step 2: Get Client Secret (2 minutes)

While on the OAuth client page, you should see your Client Secret.

#### 2.1 Find the Secret
Look for "Client secret" section. You'll see something like:
```
Client secret
GOCSPX-abc123xyz789
```

#### 2.2 Copy It
- Click the copy icon or select and copy the text
- It starts with `GOCSPX-`

#### 2.3 If You Don't See It
- Look for a "Show" button or eye icon
- Or click "Add secret" / "Reset secret" to generate a new one
- **Copy it immediately!** You won't see it again

---

### Step 3: Add Client Secret to Backend (1 minute)

#### 3.1 Open Backend/.env
In VS Code, open: `Backend/.env`

#### 3.2 Find This Line
```env
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
```

#### 3.3 Replace With Your Secret
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```
(Use YOUR actual secret, not this example)

#### 3.4 Save
Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)

**Important:**
- No spaces around the `=`
- No quotes around the value
- Just paste the secret directly

---

### Step 4: Restart Servers (1 minute)

#### 4.1 Restart Backend
In the terminal running Django:
```bash
# Press Ctrl+C to stop
cd Backend
python manage.py runserver
```

#### 4.2 Restart Frontend
In the terminal running React:
```bash
# Press Ctrl+C to stop
cd Frontend
npm run dev
```

---

### Step 5: Test OAuth Login (1 minute)

#### 5.1 Open Login Page
- Go to: **http://localhost:5173/login**

#### 5.2 Check Buttons Appear
You should see:
- "Continue with Google" button (with colorful Google logo)
- "Continue with GitHub" button
- "OR" divider
- Email/password fields below

#### 5.3 Click "Continue with Google"
- Google sign-in page should open
- Sign in with your Google account
- Google will ask: "Allow DMU Internship Portal to access..."
- Click "Allow" or "Continue"

#### 5.4 Success!
- You'll be redirected back to http://localhost:5173
- You should be logged into your dashboard
- 🎉 OAuth is working!

---

## 📋 Complete Configuration Checklist

### Google Cloud Console
- [ ] Opened https://console.cloud.google.com/apis/credentials
- [ ] Clicked on OAuth client name
- [ ] Added `http://localhost:5173` to JavaScript origins
- [ ] Added `http://localhost:8000` to JavaScript origins
- [ ] Added `http://localhost:5173/auth/callback` to redirect URIs
- [ ] Clicked SAVE
- [ ] Waited 1-2 minutes

### Backend Configuration
- [ ] Copied Client Secret from Google Cloud Console
- [ ] Opened `Backend/.env`
- [ ] Pasted Client Secret (no spaces, no quotes)
- [ ] Saved file

### Servers
- [ ] Restarted backend server
- [ ] Restarted frontend server

### Testing
- [ ] Opened http://localhost:5173/login
- [ ] Saw OAuth buttons
- [ ] Clicked "Continue with Google"
- [ ] Signed in successfully
- [ ] Redirected back and logged in

---

## 📁 File Reference

### Backend/.env (Should look like this)
```env
SECRET_KEY=django-insecure-dev-key-change-in-production-abc123xyz
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,testserver
DATABASE_URL=postgresql://postgres:205089@localhost:5432/internship
EMAIL_HOST_USER=yonyir05@gmail.com
EMAIL_HOST_PASSWORD=vkkzvwtgncpdbowx
USE_SMTP=True

# OAuth Configuration
GOOGLE_CLIENT_ID=182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here  ← CHANGE THIS!
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

### Frontend/.env (Already correct)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### Google Cloud Console OAuth Client
```
Authorized JavaScript origins:
✓ http://localhost:5173
✓ http://localhost:8000

Authorized redirect URIs:
✓ http://localhost:5173/auth/callback
```

---

## ❌ Troubleshooting

### Error: redirect_uri_mismatch
**Cause:** Redirect URI not added to Google Cloud Console  
**Fix:** Follow Step 1 above to add the URI

### Error: Invalid client
**Cause:** Client Secret is wrong or missing  
**Fix:** 
- Check `Backend/.env` has correct Client Secret
- No spaces, no quotes
- Restart backend server

### Buttons don't appear
**Cause:** Frontend not updated or cache issue  
**Fix:**
- Check `Login.jsx` and `Register.jsx` have `{true &&` (not `{false &&`)
- Clear browser cache (Ctrl+Shift+R)
- Check browser console (F12) for errors

### "Access blocked" error
**Cause:** Not added as test user  
**Fix:**
- Go to Google Cloud Console → OAuth consent screen
- Click "Test users" → "Add users"
- Add your email address
- Save

### OAuth flow starts but fails at callback
**Cause:** Backend not configured properly  
**Fix:**
- Check Client Secret in `Backend/.env`
- Make sure backend server is running
- Check backend console for errors

---

## 🎨 What You'll See

### Login Page (Before OAuth)
```
┌────────────────────────────┐
│ Sign In                    │
│                            │
│ Email: [___________]       │
│ Password: [___________]    │
│                            │
│ [Login]                    │
└────────────────────────────┘
```

### Login Page (After OAuth)
```
┌────────────────────────────┐
│ Sign In                    │
│                            │
│ [🔵 Continue with Google]  │
│ [⚫ Continue with GitHub]   │
│                            │
│ ──────── OR ────────       │
│                            │
│ Email: [___________]       │
│ Password: [___________]    │
│                            │
│ [Login]                    │
└────────────────────────────┘
```

---

## 🔐 Security Notes

✅ **Safe:**
- `.env` files are in `.gitignore` (won't be committed)
- Client Secret only in backend (never exposed to browser)
- Frontend only has Client ID (safe to expose)
- OAuth flow uses state parameter (CSRF protection)

⚠️ **Important:**
- Never share your Client Secret
- Never commit `.env` files to Git
- If secret is exposed, regenerate it in Google Cloud Console
- Use different credentials for production

---

## 🎯 Success Criteria

You'll know OAuth is working when:

1. ✅ Login page shows "Continue with Google" button
2. ✅ Button has Google colors (blue, red, yellow, green)
3. ✅ Clicking button opens Google sign-in
4. ✅ After signing in, Google asks for permission
5. ✅ After allowing, redirected back to your app
6. ✅ You're logged into the dashboard
7. ✅ No errors in browser console (F12)
8. ✅ No errors in backend console

---

## 📚 Documentation Files

I've created several guides to help you:

### Quick Guides
- **OAUTH_QUICK_FIX.md** - Fast solution for redirect_uri_mismatch
- **OAUTH_CHECKLIST.md** - Simple task checklist
- **FIX_REDIRECT_URI_ERROR.md** - Detailed redirect URI fix

### Detailed Guides
- **GET_CLIENT_SECRET_GUIDE.md** - How to find Client Secret
- **OAUTH_FINAL_STEPS.md** - Complete instructions
- **OAUTH_SETUP_STEP_BY_STEP.md** - Original full guide

### Visual Guides
- **OAUTH_VISUAL_GUIDE.md** - Diagrams and progress bars
- **START_HERE_OAUTH.md** - Quick start guide

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

## 📞 Need Help?

### For redirect_uri_mismatch error:
Read: `OAUTH_QUICK_FIX.md` or `FIX_REDIRECT_URI_ERROR.md`

### For finding Client Secret:
Read: `GET_CLIENT_SECRET_GUIDE.md`

### For complete walkthrough:
Read: `OAUTH_FINAL_STEPS.md`

### For visual diagrams:
Read: `OAUTH_VISUAL_GUIDE.md`

---

## 🎉 After OAuth Works

### Optional: Add GitHub OAuth
1. Go to: https://github.com/settings/developers
2. Create new OAuth App
3. Get Client ID and Secret
4. Add to both `.env` files
5. Restart servers
6. Test!

### For Production Deployment
1. Create new OAuth clients with production URLs
2. Update redirect URIs to your domain (e.g., https://yourdomain.com/auth/callback)
3. Update `.env` files with production credentials
4. Enable HTTPS
5. Remove test user restrictions in Google Cloud Console
6. Publish OAuth consent screen

---

## 📊 Progress Tracker

```
Setup Progress: ████████████░░░░░░░░ 60%

✅ Completed:
- OAuth client created
- Client ID obtained
- Backend/.env prepared
- Frontend/.env created
- OAuth buttons enabled

⏳ Remaining:
- Add redirect URI to Google Cloud Console
- Add Client Secret to Backend/.env
- Restart servers
- Test OAuth login

Estimated time: 10 minutes
```

---

## 🎯 Your Next Actions

1. **Right now:** Open https://console.cloud.google.com/apis/credentials
2. **Add URIs:** Follow Step 1 above
3. **Get secret:** Follow Step 2 above
4. **Update .env:** Follow Step 3 above
5. **Restart:** Follow Step 4 above
6. **Test:** Follow Step 5 above
7. **Celebrate:** You did it! 🎉

---

**Current Status:** OAuth buttons visible, need to configure Google Cloud Console

**Next Step:** Add redirect URI to Google Cloud Console (5 minutes)

**Documentation:** Read `OAUTH_QUICK_FIX.md` for fastest solution

Good luck! You're almost there! 💪
