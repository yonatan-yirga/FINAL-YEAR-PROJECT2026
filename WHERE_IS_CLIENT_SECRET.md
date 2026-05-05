# 🔍 Where to Find Your Client Secret

## 🎯 Quick Answer

Your Client Secret is in the Google Cloud Console, on the same page where you see your Client ID.

---

## 📍 Step-by-Step Location

### Step 1: Open Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

### Step 2: Find Your OAuth Client
Look for this in the list:
```
┌────────────────────────────────────────┐
│ Credentials                            │
├────────────────────────────────────────┤
│ OAuth 2.0 Client IDs                   │
│                                        │
│ Name                          Type     │
│ DMU Internship Portal Web...  OAuth... │ ← Click this name!
└────────────────────────────────────────┘
```

### Step 3: You'll See This Page
```
┌─────────────────────────────────────────────────┐
│ OAuth 2.0 Client ID                             │
│ DMU Internship Portal Web Client                │
├─────────────────────────────────────────────────┤
│                                                 │
│ Client ID                                       │
│ 182583661503-cdom56sda7ogrm1qngcogjoscjrvu5... │
│ [📋 Copy]                                       │
│                                                 │
│ Client secret                                   │
│ GOCSPX-abc123xyz789                            │ ← HERE!
│ [📋 Copy]                                       │
│                                                 │
│ Creation date                                   │
│ Jan 1, 2024, 12:00:00 PM                       │
│                                                 │
│ Authorized JavaScript origins                   │
│ • http://localhost:5173                         │
│ • http://localhost:8000                         │
│                                                 │
│ Authorized redirect URIs                        │
│ • http://localhost:5173/auth/callback           │
│                                                 │
│ [SAVE] [CANCEL]                                 │
└─────────────────────────────────────────────────┘
```

### Step 4: Copy the Client Secret
- Click the copy icon [📋] next to the secret
- Or select the text and copy it
- It starts with `GOCSPX-`

---

## 🔍 Can't See the Secret?

### Option 1: Look for "Show" Button
Some versions of Google Console hide the secret by default:
```
Client secret
••••••••••••••••  [Show] [📋]  ← Click "Show"
```

### Option 2: Look for Eye Icon
```
Client secret
••••••••••••••••  [👁️]  ← Click the eye icon
```

### Option 3: Generate New Secret
If you can't find it:
1. Look for "Add secret" or "Reset secret" button
2. Click it
3. A new secret will be generated
4. **Copy it immediately!** (You won't see it again)

---

## 📋 What to Do With It

Once you have the secret:

### 1. Open Backend/.env
```bash
# In VS Code, open: Backend/.env
```

### 2. Find This Line
```env
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
```

### 3. Replace With Your Secret
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

### 4. Save
Press `Ctrl+S` or `Cmd+S`

### 5. Restart Backend
```bash
# In terminal:
# Press Ctrl+C to stop
cd Backend
python manage.py runserver
```

---

## ✅ How to Verify You Got It Right

Your `Backend/.env` should look like this:

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
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789  ← Should start with GOCSPX-
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

**Check:**
- ✅ Starts with `GOCSPX-`
- ✅ No spaces around `=`
- ✅ No quotes
- ✅ Not the placeholder text

---

## 🎯 Quick Visual Guide

```
Google Cloud Console
│
├─ APIs & Services
│  │
│  └─ Credentials
│     │
│     └─ OAuth 2.0 Client IDs
│        │
│        └─ DMU Internship Portal Web Client  ← Click here
│           │
│           ├─ Client ID: 182583661503-cdom56sda...
│           │
│           └─ Client secret: GOCSPX-abc123xyz789  ← Copy this!
│
└─ Paste into Backend/.env
```

---

## 🆘 Troubleshooting

### "I don't see any OAuth clients"
- Make sure "DMU Internship Portal" project is selected (top left)
- Go to: APIs & Services → Credentials
- Look under "OAuth 2.0 Client IDs" section

### "I see the Client ID but not the secret"
- Make sure you clicked on the **name** of the OAuth client
- Not just hovering or clicking the edit icon
- The secret is on the details page

### "The secret is hidden (dots)"
- Look for "Show" button or eye icon
- Click it to reveal the secret

### "I lost my secret"
- You can generate a new one
- Click "Add secret" or "Reset secret"
- Copy the new secret immediately

---

## 🔐 Security Reminder

**Your Client Secret is sensitive!**
- Don't share it
- Don't commit it to Git
- Don't post screenshots of it
- If exposed, regenerate it

---

## 🎉 After You Add It

1. Save `Backend/.env`
2. Restart backend server
3. Go to http://localhost:5173/login
4. Click "Continue with Google"
5. Sign in
6. Success! 🎉

---

**Need more help?** Read: `OAUTH_TOKEN_EXCHANGE_ERROR.md`

**Time needed:** 2 minutes

**You can do this!** 💪
