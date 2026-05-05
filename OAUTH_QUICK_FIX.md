# ⚡ OAuth Quick Fix - redirect_uri_mismatch

## 🎯 The Problem

Error: `redirect_uri_mismatch`

## ✅ The Solution

Add this URI to your Google OAuth client:

```
http://localhost:5173/auth/callback
```

---

## 📍 Where to Add It

1. **Go here:** https://console.cloud.google.com/apis/credentials

2. **Click on:** "DMU Internship Portal Web Client"

3. **Find:** "Authorized redirect URIs" section

4. **Click:** "+ ADD URI"

5. **Paste:** `http://localhost:5173/auth/callback`

6. **Also add to "Authorized JavaScript origins":**
   - `http://localhost:5173`
   - `http://localhost:8000`

7. **Click:** "SAVE" at the bottom

8. **Wait:** 1-2 minutes

9. **Test:** Go to http://localhost:5173/login and click "Continue with Google"
o
---

## ⚠️ Important Rules

✅ **DO:**
- Use `http://` (not https)
- Use `localhost` (not 127.0.0.1)
- Use lowercase
- Copy exactly as shown

❌ **DON'T:**
- Add trailing slash: `http://localhost:5173/auth/callback/` ← Wrong!
- Use https: `https://localhost:5173/auth/callback` ← Wrong!
- Use IP: `http://127.0.0.1:5173/auth/callback` ← Wrong!
- Forget /auth: `http://localhost:5173/callback` ← Wrong!

---

## 🎨 Visual Guide

```
Google Cloud Console
│
├─ APIs & Services
│  └─ Credentials
│     └─ OAuth 2.0 Client IDs
│        └─ DMU Internship Portal Web Client  ← Click here!
│           │
│           ├─ Authorized JavaScript origins
│           │  ├─ http://localhost:5173  ← Add this
│           │  └─ http://localhost:8000  ← Add this
│           │
│           └─ Authorized redirect URIs
│              └─ http://localhost:5173/auth/callback  ← Add this
│
└─ Click SAVE
```

---

## 🔄 After Saving

1. Wait 1-2 minutes for Google to update
2. Clear browser cache (Ctrl+Shift+R)
3. Go to: http://localhost:5173/login
4. Click "Continue with Google"
5. Should work! 🎉

---

## 📸 Screenshot Guide

### What You Should See:

**Step 1:** Credentials page
```
┌────────────────────────────────────┐
│ Credentials                        │
│                                    │
│ OAuth 2.0 Client IDs               │
│ ┌────────────────────────────────┐ │
│ │ DMU Internship Portal Web...   │ │ ← Click this
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Step 2:** OAuth client details
```
┌────────────────────────────────────┐
│ OAuth 2.0 Client ID                │
│                                    │
│ Authorized JavaScript origins      │
│ [+ ADD URI]                        │
│                                    │
│ Authorized redirect URIs           │
│ [+ ADD URI]                        │
│                                    │
│ [SAVE]                             │
└────────────────────────────────────┘
```

**Step 3:** After adding URIs
```
┌────────────────────────────────────┐
│ Authorized JavaScript origins      │
│ • http://localhost:5173            │
│ • http://localhost:8000            │
│                                    │
│ Authorized redirect URIs           │
│ • http://localhost:5173/auth/...   │
│                                    │
│ [SAVE] ← Click this!               │
└────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Error persists after adding URI?

1. **Check spelling:** Must be EXACTLY `http://localhost:5173/auth/callback`
2. **Check you saved:** Click the SAVE button
3. **Wait longer:** Can take up to 5 minutes
4. **Clear cache:** Ctrl+Shift+R
5. **Check error details:** Click "see error details" on Google error page

### Can't find OAuth client?

1. Make sure "DMU Internship Portal" project is selected (top left)
2. Go to: APIs & Services → Credentials
3. Look under "OAuth 2.0 Client IDs" section

### Don't see "Authorized redirect URIs"?

1. Make sure you clicked on the OAuth client NAME (not the edit icon)
2. Scroll down on the page

---

## ✅ Success Checklist

After completing these steps, you should have:

- [x] OAuth client opened in Google Cloud Console
- [x] Added `http://localhost:5173` to JavaScript origins
- [x] Added `http://localhost:8000` to JavaScript origins  
- [x] Added `http://localhost:5173/auth/callback` to redirect URIs
- [x] Clicked SAVE
- [x] Waited 1-2 minutes
- [x] Tested login

---

## 🎉 What Success Looks Like

1. Click "Continue with Google" on login page
2. Google sign-in page opens
3. Sign in with your Google account
4. Google asks "Allow DMU Internship Portal to access..."
5. Click "Allow"
6. Redirected back to http://localhost:5173
7. You're logged in! 🎉

---

**Current Status:** Need to add redirect URI to Google Cloud Console

**Next Action:** Follow the steps above to add the URI!

**Time needed:** 5 minutes

**Difficulty:** Easy - just copy/paste!
