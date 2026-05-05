# OAuth Quick Setup Guide - Fix "OAuth client was not found" Error

## The Problem

You're getting "Error 401: invalid_client" because the OAuth credentials are not configured yet.

## Quick Fix (2 Options)

### Option 1: Disable OAuth Buttons (Temporary - 2 minutes)

If you want to use the system without OAuth for now, simply comment out the OAuth buttons:

**In `Frontend/src/pages/auth/Login.jsx`:**
```javascript
// Comment out the OAuth buttons section
{/* 
<div className="oauth-buttons">
  <button onClick={handleGoogleLogin} ...>
    Continue with Google
  </button>
  <button onClick={handleGitHubLogin} ...>
    Continue with GitHub
  </button>
</div>
<div className="login-divider">
  <span>OR</span>
</div>
*/}
```

**In `Frontend/src/pages/auth/Register.jsx`:**
```javascript
// Comment out the OAuth section
{/*
<div className="register-oauth-section">
  ...
</div>
*/}
```

### Option 2: Set Up OAuth Credentials (15 minutes)

Follow these steps to get real OAuth working:

## Step-by-Step: Google OAuth Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a Project
- Click "Select a project" → "New Project"
- Name: "DMU Internship Portal"
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Create OAuth Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- If prompted, configure consent screen:
  - User Type: External
  - App name: DMU Internship Portal
  - User support email: your email
  - Developer contact: your email
  - Click "Save and Continue"
  - Scopes: Skip for now
  - Test users: Add your email
  - Click "Save and Continue"

### 5. Configure OAuth Client
- Application type: **Web application**
- Name: DMU Internship Portal
- Authorized JavaScript origins:
  - `http://localhost:5173`
  - `http://localhost:8000`
- Authorized redirect URIs:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:8000/api/oauth/callback/`
- Click "Create"

### 6. Copy Credentials
You'll see:
- **Client ID**: Something like `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123xyz`

**IMPORTANT:** Copy both values!

## Step-by-Step: GitHub OAuth Setup

### 1. Go to GitHub Settings
Visit: https://github.com/settings/developers

### 2. Create New OAuth App
- Click "New OAuth App"
- Application name: `DMU Internship Portal`
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:5173/auth/callback`
- Click "Register application"

### 3. Copy Credentials
- **Client ID**: Visible on the page
- Click "Generate a new client secret"
- **Client Secret**: Copy immediately (you won't see it again!)

## Configure Your Application

### Backend Configuration

**Edit `Backend/.env`:**
```env
# Replace these with your actual credentials
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

**Create `Frontend/.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## Restart Your Servers

After updating .env files:

```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd Backend
python manage.py runserver

# Restart frontend (in new terminal)
cd Frontend
npm run dev
```

## Test OAuth

1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. You should see Google's login page
4. Sign in with your Google account
5. Authorize the app
6. You'll be redirected back and logged in!

## Common Issues

### "redirect_uri_mismatch"
**Fix:** Make sure the redirect URI in Google Console exactly matches:
- `http://localhost:5173/auth/callback`

### "Access blocked: This app's request is invalid"
**Fix:** Add your email as a test user in Google Console:
- OAuth consent screen → Test users → Add users

### Environment variables not loading
**Fix:** 
- Make sure .env files are in the correct directories
- Restart both servers after changing .env
- Check file names are exactly `.env` (not `.env.txt`)

### Still getting "invalid_client"
**Fix:**
- Double-check Client ID and Secret are copied correctly
- No extra spaces or quotes in .env file
- Make sure you're using the Web application credentials (not Android/iOS)

## Quick Test Without Full Setup

If you just want to test the UI without OAuth working:

**Frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=test_client_id
VITE_GITHUB_CLIENT_ID=test_client_id
```

**Backend/.env:**
```env
GOOGLE_CLIENT_ID=test_client_id
GOOGLE_CLIENT_SECRET=test_secret
GITHUB_CLIENT_ID=test_client_id
GITHUB_CLIENT_SECRET=test_secret
```

The buttons will appear but won't work until you add real credentials.

## Need Help?

If you're still stuck:
1. Check the browser console for errors (F12)
2. Check Django server logs for errors
3. Verify .env files are loaded: `echo $VITE_GOOGLE_CLIENT_ID` (frontend)
4. Make sure both servers restarted after .env changes

---

**Recommended:** Use Option 1 (disable OAuth) for now if you want to continue development, then set up OAuth later when you have time.
