# 🔧 Fix: Token Exchange Failed Error

## ❌ Current Error

```
Authentication Failed
Token exchange failed
Redirecting to login...
```

---

## 🎯 Root Cause

The backend is trying to exchange the OAuth code for an access token, but it's failing because:

**The Client Secret in `Backend/.env` is still a placeholder!**

Current value: `GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE`

---

## ✅ Solution (3 Steps)

### Step 1: Get Your Client Secret from Google

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials

2. **Select Your Project:**
   - Make sure "DMU Internship Portal" is selected at the top

3. **Open Your OAuth Client:**
   - Find "DMU Internship Portal Web Client" in the list
   - Click on the **name** (not the edit icon)

4. **Find the Client Secret:**
   - Look for "Client secret" section
   - You'll see something like: `GOCSPX-abc123xyz789`
   - **Copy it!** (Click the copy icon or select and copy)

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│ OAuth 2.0 Client ID                     │
├─────────────────────────────────────────┤
│                                         │
│ Client ID                               │
│ 182583661503-cdom56sda...              │
│                                         │
│ Client secret                           │
│ GOCSPX-abc123xyz789  [📋]              │ ← Copy this!
│                                         │
└─────────────────────────────────────────┘
```

**If you don't see the secret:**
- Look for a "Show" button or eye icon 👁️
- Or click "Add secret" / "Reset secret" button
- Copy it immediately (you won't see it again!)

---

### Step 2: Add Client Secret to Backend/.env

1. **Open the file:**
   - In VS Code, open: `Backend/.env`

2. **Find this line:**
   ```env
   GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
   ```

3. **Replace with your actual secret:**
   ```env
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
   ```
   (Use YOUR actual secret from Step 1, not this example!)

4. **Save the file:**
   - Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)

**CRITICAL RULES:**
- ✅ No spaces around the `=` sign
- ✅ No quotes around the value
- ✅ Must start with `GOCSPX-`
- ✅ Copy the ENTIRE secret

**Example of correct .env:**
```env
# OAuth Configuration
GOOGLE_CLIENT_ID=182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789  ← Your actual secret here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

---

### Step 3: Restart Backend Server

**IMPORTANT:** Django only reads .env files when it starts. You MUST restart the server!

1. **Go to the terminal running Django**

2. **Stop the server:**
   - Press `Ctrl+C`

3. **Restart the server:**
   ```bash
   cd Backend
   python manage.py runserver
   ```

4. **Wait for it to start:**
   - You should see: "Starting development server at http://127.0.0.1:8000/"

---

### Step 4: Test OAuth Login

1. **Open login page:**
   - Go to: http://localhost:5173/login

2. **Click "Continue with Google"**

3. **Sign in with Google:**
   - Enter your Google credentials
   - Click "Allow" when asked for permissions

4. **Success!**
   - You should be redirected back
   - You should be logged into your dashboard
   - 🎉 OAuth is working!

---

## 📋 Troubleshooting Checklist

### Before Testing:
- [ ] Opened Google Cloud Console
- [ ] Found OAuth client "DMU Internship Portal Web Client"
- [ ] Copied Client Secret (starts with `GOCSPX-`)
- [ ] Opened `Backend/.env` in VS Code
- [ ] Replaced `PASTE_YOUR_CLIENT_SECRET_HERE` with actual secret
- [ ] Saved the file (Ctrl+S)
- [ ] Stopped backend server (Ctrl+C)
- [ ] Restarted backend server (`python manage.py runserver`)
- [ ] Waited for server to fully start

### During Testing:
- [ ] Opened http://localhost:5173/login
- [ ] Saw "Continue with Google" button
- [ ] Clicked the button
- [ ] Google sign-in page opened
- [ ] Signed in successfully
- [ ] Clicked "Allow" for permissions
- [ ] Redirected back to app
- [ ] Logged into dashboard

---

## ❌ Common Mistakes

### Mistake 1: Didn't restart backend
**Symptom:** Still getting "Token exchange failed"  
**Fix:** Stop backend (Ctrl+C) and restart it

### Mistake 2: Wrong secret format
**Wrong:**
```env
GOOGLE_CLIENT_SECRET = "GOCSPX-abc123"  # Has spaces and quotes
GOOGLE_CLIENT_SECRET='GOCSPX-abc123'    # Has quotes
GOOGLE_CLIENT_SECRET= GOCSPX-abc123     # Has space after =
```

**Correct:**
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

### Mistake 3: Copied partial secret
**Fix:** Make sure you copied the ENTIRE secret, not just part of it

### Mistake 4: Still has placeholder
**Wrong:**
```env
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE  # Still placeholder!
```

**Correct:**
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789  # Actual secret
```

---

## 🔍 How to Verify It's Working

### Check Backend Console
After restarting, the backend console should show:
```
System check identified no issues (0 silenced).
January 01, 2024 - 12:00:00
Django version 4.2.x, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Check Backend Loads Secret
You can verify the secret is loaded by checking if there are any errors when the server starts. If the secret is wrong, you'll see errors in the console.

### Test the Flow
1. Click "Continue with Google"
2. Sign in
3. Check backend console for any error messages
4. If you see errors, they'll tell you what's wrong

---

## 🆘 Still Not Working?

### Check Backend Console for Errors

After clicking "Continue with Google", check the backend terminal for error messages. Common errors:

**Error: "invalid_client"**
- Client Secret is wrong
- Copy it again from Google Console
- Make sure no extra characters

**Error: "redirect_uri_mismatch"**
- This shouldn't happen anymore (you already fixed it!)
- But if it does, check the redirect URI in Google Console

**Error: "access_denied"**
- User clicked "Cancel" instead of "Allow"
- Try again and click "Allow"

### Check Browser Console

Press `F12` in your browser and check the Console tab for errors.

### Verify Client Secret

1. Go back to Google Cloud Console
2. Open your OAuth client
3. Compare the Client Secret with what's in your .env file
4. Make sure they match EXACTLY

---

## 📊 What Happens During Token Exchange

Here's what's happening behind the scenes:

```
1. User clicks "Continue with Google"
   ↓
2. Redirected to Google sign-in
   ↓
3. User signs in and clicks "Allow"
   ↓
4. Google redirects back with authorization code
   ↓
5. Frontend sends code to backend
   ↓
6. Backend exchanges code for access token
   ├─ Sends: Client ID, Client Secret, Code
   ├─ To: Google's token endpoint
   └─ Gets: Access token
   ↓
7. Backend uses access token to get user info
   ↓
8. Backend creates/logs in user
   ↓
9. User is logged in! 🎉
```

**The failure is happening at step 6** because the Client Secret is missing or wrong.

---

## 🎯 Quick Fix Summary

```bash
# 1. Get secret from Google Console
# https://console.cloud.google.com/apis/credentials

# 2. Edit Backend/.env
# Replace: GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
# With: GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret

# 3. Restart backend
cd Backend
# Press Ctrl+C to stop
python manage.py runserver

# 4. Test
# Open: http://localhost:5173/login
# Click: "Continue with Google"
# Success! 🎉
```

---

## 🔐 Security Note

**Never share your Client Secret!**
- Don't commit it to Git (it's in .gitignore)
- Don't share screenshots of your .env file
- Don't paste it in public forums
- If exposed, regenerate it in Google Console

---

**Current Status:** Client Secret is still placeholder in Backend/.env

**Next Action:** Get your Client Secret from Google Console and add it to Backend/.env

**Time Needed:** 2 minutes

**You're SO close!** Just need that secret! 💪
