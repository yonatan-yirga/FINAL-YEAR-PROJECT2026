# OAuth Setup - Complete Step-by-Step Guide

## 🎯 Goal
Get Google and GitHub OAuth credentials so users can login with one click.

**Time needed:** 15-20 minutes

---

## Part 1: Google OAuth Setup (10 minutes)

### Step 1: Go to Google Cloud Console
1. Open your browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account

### Step 2: Create a New Project
1. At the top of the page, click **"Select a project"** (next to Google Cloud logo)
2. In the popup, click **"NEW PROJECT"** (top right)
3. Fill in:
   - **Project name:** `DMU Internship Portal`
   - **Location:** Leave as default
4. Click **"CREATE"**
5. Wait 10-20 seconds for project creation
6. Click **"SELECT PROJECT"** when it appears

### Step 3: Configure OAuth Consent Screen
1. In the left sidebar, click **"APIs & Services"**
2. Click **"OAuth consent screen"**
3. Choose **"External"** (unless you have Google Workspace)
4. Click **"CREATE"**

**Fill in the form:**
- **App name:** `DMU Internship Portal`
- **User support email:** Your email address
- **App logo:** Skip for now
- **App domain:** Leave empty for now
- **Authorized domains:** Leave empty
- **Developer contact information:** Your email address
- Click **"SAVE AND CONTINUE"**

**Scopes page:**
- Click **"SAVE AND CONTINUE"** (don't add scopes)

**Test users page:**
- Click **"+ ADD USERS"**
- Enter your email address (the one you'll test with)
- Click **"ADD"**
- Click **"SAVE AND CONTINUE"**

**Summary page:**
- Click **"BACK TO DASHBOARD"**

### Step 4: Create OAuth Credentials
1. In the left sidebar, click **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**

**Configure the OAuth client:**
- **Application type:** Select **"Web application"**
- **Name:** `DMU Internship Portal Web Client`

**Authorized JavaScript origins:**
- Click **"+ ADD URI"**
- Enter: `http://localhost:5173`
- Click **"+ ADD URI"** again
- Enter: `http://localhost:8000`

**Authorized redirect URIs:**
- Click **"+ ADD URI"**
- Enter: `http://localhost:5173/auth/callback`
- Click **"+ ADD URI"** again  
- Enter: `http://localhost:8000/api/oauth/callback/`

- Click **"CREATE"**

### Step 5: Copy Your Credentials
A popup will appear with your credentials:

**IMPORTANT:** Copy these values immediately!

- **Client ID:** Something like `123456789012-abc123xyz.apps.googleusercontent.com`
- **Client secret:** Something like `GOCSPX-abc123xyz789`

**Save them in a text file temporarily!**

Click **"OK"** to close the popup.

---

## Part 2: GitHub OAuth Setup (5 minutes)

### Step 1: Go to GitHub Developer Settings
1. Open your browser
2. Go to: **https://github.com/settings/developers**
3. Sign in to GitHub if needed

### Step 2: Create New OAuth App
1. Click **"OAuth Apps"** in the left sidebar
2. Click **"New OAuth App"** button (top right)

**Fill in the form:**
- **Application name:** `DMU Internship Portal`
- **Homepage URL:** `http://localhost:5173`
- **Application description:** `University internship management system` (optional)
- **Authorization callback URL:** `http://localhost:5173/auth/callback`

3. Click **"Register application"**

### Step 3: Copy Your Credentials
You'll see your new OAuth app page:

**Client ID:** Visible on the page (something like `Iv1.abc123xyz789`)

**IMPORTANT:** Copy the Client ID!

**Client Secret:**
1. Click **"Generate a new client secret"**
2. **IMMEDIATELY COPY IT!** (You won't see it again)
3. It looks like: `abc123xyz789abc123xyz789abc123xyz789abcd`

**Save both values in a text file!**

---

## Part 3: Add Credentials to Your Project (5 minutes)

### Step 1: Update Backend .env File

1. Open your project in VS Code
2. Navigate to: `Backend/.env`
3. Find these lines (they should already exist):

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

4. **Replace** with your actual credentials:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=123456789012-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
GITHUB_CLIENT_ID=Iv1.abc123xyz789
GITHUB_CLIENT_SECRET=abc123xyz789abc123xyz789abc123xyz789abcd
```

5. **Save the file** (Ctrl+S or Cmd+S)

### Step 2: Create/Update Frontend .env File

1. Navigate to: `Frontend/` folder
2. Check if `.env` file exists
   - If YES: Open it
   - If NO: Create new file named `.env` (exactly, no .txt)

3. Add these lines:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=123456789012-abc123xyz.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=Iv1.abc123xyz789
```

**IMPORTANT:** 
- Use the SAME Client IDs from Step 1
- Do NOT include the secrets in frontend .env
- Make sure there are NO spaces around the `=` sign
- Make sure there are NO quotes around the values

4. **Save the file** (Ctrl+S or Cmd+S)

---

## Part 4: Enable OAuth Buttons (2 minutes)

### Step 1: Enable in Login Page

1. Open: `Frontend/src/pages/auth/Login.jsx`
2. Find this line (around line 100):

```javascript
{false && (
```

3. Change `false` to `true`:

```javascript
{true && (
```

4. **Save the file**

### Step 2: Enable in Register Page

1. Open: `Frontend/src/pages/auth/Register.jsx`
2. Find this line (around line 170):

```javascript
{false && (
```

3. Change `false` to `true`:

```javascript
{true && (
```

4. **Save the file**

---

## Part 5: Restart Your Servers (2 minutes)

### Backend Server

1. Go to the terminal running Django
2. Press **Ctrl+C** to stop it
3. Restart with:
```bash
cd Backend
python manage.py runserver
```

### Frontend Server

1. Go to the terminal running React
2. Press **Ctrl+C** to stop it
3. Restart with:
```bash
cd Frontend
npm run dev
```

---

## Part 6: Test OAuth (2 minutes)

### Test Google Login

1. Open browser: **http://localhost:5173/login**
2. You should see **"Continue with Google"** button
3. Click it
4. You'll be redirected to Google
5. Sign in with your Google account
6. Click **"Continue"** to authorize
7. You should be redirected back and logged in!

### Test GitHub Login

1. Go to: **http://localhost:5173/login**
2. Click **"Continue with GitHub"**
3. Sign in to GitHub if needed
4. Click **"Authorize"**
5. You should be redirected back and logged in!

---

## 🎉 Success!

If you can login with Google or GitHub, OAuth is working!

---

## ❌ Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match

**Fix:**
1. Go back to Google Cloud Console
2. Go to Credentials → Your OAuth client
3. Make sure you have EXACTLY:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:8000/api/oauth/callback/`
4. No extra spaces, no https, no trailing slashes (except the last one)

### Error: "Access blocked: This app's request is invalid"

**Problem:** You're not added as a test user

**Fix:**
1. Go to Google Cloud Console
2. OAuth consent screen → Test users
3. Add your email address
4. Try again

### Error: "Application suspended"

**Problem:** GitHub app needs verification

**Fix:**
1. Go to GitHub OAuth Apps settings
2. Check if there's a warning
3. Follow GitHub's instructions

### OAuth buttons don't appear

**Problem:** .env not loaded or false still in code

**Fix:**
1. Check you changed `{false &&` to `{true &&`
2. Check .env files are saved
3. Restart both servers
4. Clear browser cache (Ctrl+Shift+R)

### "Invalid client" error

**Problem:** Credentials are wrong

**Fix:**
1. Double-check Client ID and Secret
2. Make sure no extra spaces
3. Make sure no quotes around values
4. Restart servers after changing .env

### Environment variables not loading

**Fix:**
1. Make sure file is named exactly `.env` (not `.env.txt`)
2. Make sure it's in the correct folder:
   - Backend/.env
   - Frontend/.env
3. Restart both servers
4. Check for typos in variable names

---

## 📝 Quick Reference

### File Locations
```
Backend/.env                          ← Backend credentials
Frontend/.env                         ← Frontend credentials  
Frontend/src/pages/auth/Login.jsx    ← Change false to true
Frontend/src/pages/auth/Register.jsx ← Change false to true
```

### What Goes Where

**Backend/.env:**
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

**Frontend/.env:**
- VITE_GOOGLE_CLIENT_ID (same as backend)
- VITE_GITHUB_CLIENT_ID (same as backend)
- NO SECRETS in frontend!

---

## 🔒 Security Notes

1. **Never commit .env files to Git** (they're in .gitignore)
2. **Never share your Client Secrets**
3. **Regenerate secrets if exposed**
4. **Use different credentials for production**

---

## 🚀 Production Setup (Later)

When deploying to production:

1. Create new OAuth apps with production URLs
2. Update redirect URIs to your domain
3. Update .env with production credentials
4. Enable HTTPS
5. Remove test users restriction in Google

---

Need help? Check the error message and look in the Troubleshooting section above!
