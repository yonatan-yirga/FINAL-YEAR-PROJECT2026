# 🔑 How to Get Your Google Client Secret

## 🎯 You Need This!

Your OAuth client is created, but you need the **Client Secret** to make it work.

---

## Option 1: The Popup is Still Open ✨

If you still see the popup that says "OAuth client created":

```
┌─────────────────────────────────────────┐
│  OAuth client created                   │
│                                         │
│  Your Client ID                         │
│  182583661503-cdom56sda...             │
│                                         │
│  Your Client Secret                     │
│  GOCSPX-abc123xyz789  [📋 Copy]        │
│                                         │
│  [Download JSON]  [OK]                  │
└─────────────────────────────────────────┘
```

**DO THIS NOW:**
1. Find the "Client Secret" line
2. Click the copy icon (📋) or select and copy the text
3. It starts with `GOCSPX-`
4. Paste it somewhere safe (text file)
5. Then click "OK"

---

## Option 2: You Closed the Popup 😅

Don't worry! You can still get it:

### Step 1: Go to Credentials Page
1. Open: https://console.cloud.google.com/apis/credentials
2. Make sure your project "DMU Internship Portal" is selected (top left)

### Step 2: Find Your OAuth Client
You'll see a list of credentials. Look for:
- **Type:** OAuth 2.0 Client IDs
- **Name:** DMU Internship Portal Web Client (or similar)

### Step 3: Click on the Name
Click on "DMU Internship Portal Web Client" to open it

### Step 4: Find the Client Secret

You'll see a page with:

```
Client ID
182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com

Client secrets
┌──────────────────────────────────────────────┐
│ Secret                    Created    Actions │
│ GOCSPX-abc123xyz789     Jan 1, 2024  [...]  │
└──────────────────────────────────────────────┘
```

**The secret might be hidden!** Look for:
- A "Show" button or eye icon 👁️
- Or it might be visible already

**Copy the secret!** It starts with `GOCSPX-`

---

## Option 3: Create a New Secret 🆕

If you can't find the secret or it's not showing:

### On the OAuth Client Page:
1. Look for "Client secrets" section
2. Click "Add secret" or "Reset secret" button
3. A new secret will be generated
4. **COPY IT IMMEDIATELY!** You won't see it again
5. Click "Save" or "Done"

---

## ✅ What to Do With the Secret

Once you have the secret (looks like `GOCSPX-abc123xyz789`):

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

**IMPORTANT:**
- No spaces around the `=`
- No quotes around the value
- Just paste the secret directly

### 4. Save the File
Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)

---

## 🎯 Complete Example

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
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

Replace `GOCSPX-abc123xyz789` with YOUR actual secret!

---

## 🚨 Common Mistakes

### ❌ Wrong:
```env
GOOGLE_CLIENT_SECRET = "GOCSPX-abc123xyz789"  # Has spaces and quotes
GOOGLE_CLIENT_SECRET='GOCSPX-abc123xyz789'    # Has quotes
GOOGLE_CLIENT_SECRET= GOCSPX-abc123xyz789     # Has space after =
```

### ✅ Correct:
```env
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

---

## 🔄 After Adding the Secret

### 1. Enable OAuth Buttons

**Login.jsx:**
```javascript
// Find line ~100
{false && (  // ← Change false to true
```

**Register.jsx:**
```javascript
// Find line ~170
{false && (  // ← Change false to true
```

### 2. Restart Backend Server
```bash
# Stop with Ctrl+C, then:
cd Backend
python manage.py runserver
```

### 3. Restart Frontend Server
```bash
# Stop with Ctrl+C, then:
cd Frontend
npm run dev
```

### 4. Test!
1. Open: http://localhost:5173/login
2. Click "Continue with Google"
3. Sign in
4. Success! 🎉

---

## 🔒 Security Tips

1. **Never share your Client Secret**
2. **Never commit .env to Git** (it's already in .gitignore)
3. **If exposed, regenerate it** in Google Cloud Console
4. **Use different secrets for production**

---

## 📞 Still Stuck?

### Can't find the credentials page?
- Make sure you're logged into the correct Google account
- Make sure "DMU Internship Portal" project is selected (top left)
- Try this direct link: https://console.cloud.google.com/apis/credentials

### Can't see the secret?
- Look for a "Show" button or eye icon
- Try clicking on the OAuth client name to open details
- If all else fails, create a new secret (Option 3 above)

### Secret not working?
- Check for typos
- Check for extra spaces or quotes
- Make sure you saved the file
- Make sure you restarted the backend server

---

**Next:** Once you add the secret, follow the steps in `OAUTH_FINAL_STEPS.md`!
