# 🔧 Fix redirect_uri_mismatch Error

## The Problem

You're getting this error:
```
Error 400: redirect_uri_mismatch
```

This means Google doesn't recognize the redirect URI your app is using.

---

## The Solution (5 minutes)

### Step 1: Open Google Cloud Console

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Sign in if needed
3. Make sure "DMU Internship Portal" is selected at the top

### Step 2: Find Your OAuth Client

You'll see a list that looks like this:

```
Credentials
┌─────────────────────────────────────────────────┐
│ Name                              Type          │
├─────────────────────────────────────────────────┤
│ DMU Internship Portal Web Client  OAuth 2.0... │  ← Click this!
└─────────────────────────────────────────────────┘
```

**Click on the name** "DMU Internship Portal Web Client"

### Step 3: Edit the OAuth Client

You'll see a page with your credentials. Look for two sections:

#### Section 1: Authorized JavaScript origins

Click **"+ ADD URI"** and add these TWO URIs:

```
http://localhost:5173
```

```
http://localhost:8000
```

**Important:** 
- Use `http://` (not https)
- No trailing slash
- Exactly as shown

#### Section 2: Authorized redirect URIs

Click **"+ ADD URI"** and add this ONE URI:

```
http://localhost:5173/auth/callback
```

**Important:**
- Use `http://` (not https)
- Use `localhost` (not 127.0.0.1)
- Include `/auth/callback` at the end
- No trailing slash after callback

### Step 4: Save

1. Scroll to the bottom
2. Click **"SAVE"** button
3. Wait for "OAuth client updated" message

---

## ✅ What It Should Look Like

After adding the URIs, your OAuth client should show:

```
┌─────────────────────────────────────────────────┐
│ OAuth 2.0 Client ID                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Client ID                                       │
│ 182583661503-cdom56sda7ogrm1qngcogjoscjrvu5... │
│                                                 │
│ Client secret                                   │
│ GOCSPX-abc123xyz789                            │
│                                                 │
│ Authorized JavaScript origins                   │
│ ┌─────────────────────────────────────────┐   │
│ │ 1. http://localhost:5173                 │   │
│ │ 2. http://localhost:8000                 │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Authorized redirect URIs                        │
│ ┌─────────────────────────────────────────┐   │
│ │ 1. http://localhost:5173/auth/callback   │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ [SAVE]                                          │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Test It

1. **Wait 1-2 minutes** for Google to update
2. Go to: **http://localhost:5173/login**
3. Click **"Continue with Google"**
4. It should work now! 🎉

---

## ❌ Still Not Working?

### Check These:

1. **Exact match:** The URI must be EXACTLY `http://localhost:5173/auth/callback`
   - No extra spaces
   - No capital letters
   - No trailing slash
   - `http` not `https`

2. **Saved:** Make sure you clicked "SAVE"

3. **Wait:** Changes can take 1-2 minutes

4. **Clear cache:** Press `Ctrl+Shift+R` in your browser

5. **Check error details:** On the Google error page, click "see error details" to see what URI it expected

---

## 📋 Quick Checklist

- [ ] Opened https://console.cloud.google.com/apis/credentials
- [ ] Clicked on OAuth client name
- [ ] Added `http://localhost:5173` to JavaScript origins
- [ ] Added `http://localhost:8000` to JavaScript origins
- [ ] Added `http://localhost:5173/auth/callback` to redirect URIs
- [ ] Clicked SAVE
- [ ] Waited 1-2 minutes
- [ ] Tested at http://localhost:5173/login

---

## 🎯 Common Mistakes

### ❌ Wrong:
```
https://localhost:5173/auth/callback  ← https instead of http
http://127.0.0.1:5173/auth/callback   ← 127.0.0.1 instead of localhost
http://localhost:5173/auth/callback/  ← trailing slash
http://localhost:5173/callback        ← missing /auth
```

### ✅ Correct:
```
http://localhost:5173/auth/callback
```

---

## 🔍 How to See Error Details

When you get the error, Google shows:

```
Error 400: redirect_uri_mismatch

[see error details]  ← Click this!
```

Click "see error details" and you'll see:

```
The redirect URI in the request:
http://localhost:5173/auth/callback

Does not match the ones authorized for the OAuth client.
```

This tells you exactly what URI your app is sending and what Google expects.

---

## 📞 Need More Help?

If you're still stuck:

1. Take a screenshot of your OAuth client page (the one with JavaScript origins and redirect URIs)
2. Take a screenshot of the error details
3. Share them so I can see what's wrong

---

**Next:** After adding the URIs and saving, wait 1-2 minutes then try again!
