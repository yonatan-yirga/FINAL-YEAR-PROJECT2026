# 🚨 URGENT: Add Your Client Secret

## 🎉 Good News!

You successfully fixed the redirect_uri_mismatch error! The OAuth flow is working, but now it's failing because the backend needs your **Client Secret** to complete the login.

---

## ❌ Current Error

```
POST http://localhost:8000/api/oauth/exchange-token/ 400 (Bad Request)
```

**Why:** The backend is trying to exchange the OAuth code for an access token, but it needs your Google Client Secret to do that.

---

## ✅ The Fix (2 minutes)

### Step 1: Get Your Client Secret

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Click on **"DMU Internship Portal Web Client"**
3. Look for **"Client secret"** section
4. You'll see something like: `GOCSPX-abc123xyz789`
5. **Copy it!**

**If you don't see it:**
- Look for a "Show" button or eye icon 👁️
- Or click "Add secret" / "Reset secret" to generate a new one
- **Copy it immediately!** You won't see it again

---

### Step 2: Add to Backend/.env

1. **Open:** `Backend/.env` in VS Code

2. **Find this line:**
```env
GOOGLE_CLIENT_SECRET=YOUR_REAL_SECRET_HERE_FROM_GOOGLE_CONSOLE
```

3. **Replace with your actual secret:**
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```
(Use YOUR actual secret, not this example!)

4. **Save the file** (Ctrl+S or Cmd+S)

**IMPORTANT:**
- No spaces around the `=`
- No quotes around the value
- Just paste the secret directly
- It should start with `GOCSPX-`

---

### Step 3: Restart Backend Server

The backend needs to be restarted to load the new environment variable:

```bash
# In the terminal running Django:
# Press Ctrl+C to stop the server

# Then restart:
cd Backend
python manage.py runserver
```

---

### Step 4: Test Again

1. Go to: **http://localhost:5173/login**
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. Click **"Allow"** when Google asks for permission
5. You should be redirected back and logged in! 🎉

---

## 📋 Quick Checklist

- [ ] Opened https://console.cloud.google.com/apis/credentials
- [ ] Clicked on OAuth client name
- [ ] Copied the Client Secret (starts with `GOCSPX-`)
- [ ] Opened `Backend/.env`
- [ ] Replaced `YOUR_REAL_SECRET_HERE_FROM_GOOGLE_CONSOLE` with actual secret
- [ ] Saved the file
- [ ] Restarted backend server (Ctrl+C then `python manage.py runserver`)
- [ ] Tested login again

---

## 🎯 What Your Backend/.env Should Look Like

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

---

## ❌ Common Mistakes

### ❌ Wrong:
```env
GOOGLE_CLIENT_SECRET = "GOCSPX-abc123xyz789"  # Has spaces and quotes
GOOGLE_CLIENT_SECRET='GOCSPX-abc123xyz789'    # Has quotes
GOOGLE_CLIENT_SECRET= GOCSPX-abc123xyz789     # Has space after =
GOOGLE_CLIENT_SECRET=YOUR_REAL_SECRET_HERE... # Still placeholder!
```

### ✅ Correct:
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

---

## 🔍 How to Find Client Secret in Google Console

When you open your OAuth client, you'll see:

```
┌─────────────────────────────────────────┐
│ OAuth 2.0 Client ID                     │
├─────────────────────────────────────────┤
│                                         │
│ Client ID                               │
│ 182583661503-cdom56sda...              │
│                                         │
│ Client secret                           │
│ GOCSPX-abc123xyz789  [📋 Copy]         │ ← Copy this!
│                                         │
│ Authorized JavaScript origins           │
│ • http://localhost:5173                 │
│ • http://localhost:8000                 │
│                                         │
│ Authorized redirect URIs                │
│ • http://localhost:5173/auth/callback   │
└─────────────────────────────────────────┘
```

---

## 🎉 You're Almost There!

You've already:
- ✅ Created OAuth client
- ✅ Added redirect URIs (that's why you got past the first error!)
- ✅ OAuth flow is working

You just need to:
- ⏳ Add Client Secret to Backend/.env
- ⏳ Restart backend server
- ⏳ Test login

**Time needed:** 2 minutes!

---

## 🚀 After Adding the Secret

Once you add the secret and restart the backend:

1. The OAuth flow will complete successfully
2. Google will send the authorization code
3. Backend will exchange it for an access token (using the Client Secret)
4. Backend will get your user info from Google
5. Backend will create/login your user
6. You'll be redirected to your dashboard
7. Success! 🎉

---

## 📞 Still Having Issues?

### Backend console shows error?
- Check the backend terminal for error messages
- Make sure the secret is correct (no typos)
- Make sure you restarted the server

### Frontend still shows error?
- Clear browser cache (Ctrl+Shift+R)
- Check browser console (F12) for error details
- Make sure backend server is running

### "Invalid client" error?
- Double-check the Client Secret
- Make sure no extra spaces or quotes
- Try copying the secret again from Google Console

---

**Next Action:** Get your Client Secret from Google Console and add it to `Backend/.env`!

**You're 95% done!** Just this one step left! 💪
