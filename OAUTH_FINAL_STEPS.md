# 🎯 OAuth Setup - Final Steps

## ✅ What You've Done
- ✅ Created Google OAuth client
- ✅ Got Client ID: `182583661503-cdom56sda7ogrm1qngcogjoscjrvu5to.apps.googleusercontent.com`
- ✅ Updated Backend/.env with Client ID
- ✅ Created Frontend/.env with Client ID

---

## 🔴 URGENT: Get Your Client Secret

When you created the OAuth client, a popup appeared with:
- **Client ID** (you have this ✅)
- **Client Secret** (you need this! ⚠️)

### If the popup is still open:
1. **COPY THE CLIENT SECRET NOW!**
2. It looks like: `GOCSPX-abc123xyz789`
3. You won't see it again!

### If you closed the popup:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client: "DMU Internship Portal Web Client"
3. Click on it
4. You'll see the Client ID
5. Look for "Client secret" - there might be a "Show" button or you may need to create a new one
6. If you need to create new: Click "Add secret" or "Reset secret"
7. **COPY IT IMMEDIATELY!**

---

## 📝 Step-by-Step Completion

### Step 1: Add Client Secret to Backend

1. Open: `Backend/.env`
2. Find this line:
   ```
   GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
   ```
3. Replace `PASTE_YOUR_CLIENT_SECRET_HERE` with your actual secret
4. Should look like:
   ```
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
   ```
5. **Save the file** (Ctrl+S)

### Step 2: Enable OAuth Buttons

**Login Page:**
1. Open: `Frontend/src/pages/auth/Login.jsx`
2. Find line ~100: `{false && (`
3. Change to: `{true && (`
4. Save

**Register Page:**
1. Open: `Frontend/src/pages/auth/Register.jsx`
2. Find line ~170: `{false && (`
3. Change to: `{true && (`
4. Save

### Step 3: Restart Servers

**Backend:**
```bash
# Stop current server (Ctrl+C)
cd Backend
python manage.py runserver
```

**Frontend:**
```bash
# Stop current server (Ctrl+C)
cd Frontend
npm run dev
```

### Step 4: Test Google Login

1. Open: http://localhost:5173/login
2. You should see "Continue with Google" button
3. Click it
4. Sign in with your Google account
5. You should be redirected back and logged in! 🎉

---

## 🐙 Optional: GitHub OAuth (Later)

If you want GitHub login too:

1. Go to: https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Name:** DMU Internship Portal
   - **Homepage:** http://localhost:5173
   - **Callback:** http://localhost:5173/auth/callback
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret"
7. **COPY THE SECRET IMMEDIATELY!**
8. Update both .env files:
   - `Backend/.env`: Add both ID and Secret
   - `Frontend/.env`: Add only the ID
9. Restart servers
10. Test!

---

## ❌ Troubleshooting

### "redirect_uri_mismatch" error

**Fix:** Check your Google Cloud Console OAuth client has these EXACT URIs:
- `http://localhost:5173/auth/callback`
- `http://localhost:8000/api/oauth/callback/`

### "Access blocked: This app's request is invalid"

**Fix:** Add yourself as a test user:
1. Google Cloud Console → OAuth consent screen
2. Test users → Add users
3. Add your email
4. Save

### "Invalid client" error

**Fix:** 
- Double-check Client ID and Secret in Backend/.env
- Make sure no extra spaces
- Make sure no quotes around values
- Restart backend server

### OAuth buttons don't appear

**Fix:**
- Check you changed `{false &&` to `{true &&` in both files
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors (F12)

### Environment variables not loading

**Fix:**
- Make sure files are named exactly `.env` (not `.env.txt`)
- Make sure they're in correct folders:
  - `Backend/.env`
  - `Frontend/.env`
- Restart BOTH servers after changing .env files

---

## 🔒 Security Reminders

- ✅ .env files are in .gitignore (won't be committed)
- ✅ Never share your Client Secret
- ✅ Frontend .env only has Client IDs (no secrets)
- ✅ If you accidentally expose secrets, regenerate them in Google Cloud Console

---

## 📁 File Checklist

```
✅ Backend/.env                          ← Has Client ID, needs Secret
✅ Frontend/.env                         ← Has Client ID
⏳ Frontend/src/pages/auth/Login.jsx    ← Change false to true
⏳ Frontend/src/pages/auth/Register.jsx ← Change false to true
```

---

## 🎯 Current Status

**Google OAuth:**
- Client ID: ✅ Added
- Client Secret: ⏳ **YOU NEED TO ADD THIS!**
- Backend config: ✅ Ready
- Frontend config: ✅ Ready
- Buttons enabled: ⏳ Need to change false to true
- Servers restarted: ⏳ After adding secret

**GitHub OAuth:**
- ⏳ Optional - set up later if needed

---

## 🚀 Quick Commands

```bash
# Restart Backend
cd Backend
python manage.py runserver

# Restart Frontend (in new terminal)
cd Frontend
npm run dev

# Test
# Open: http://localhost:5173/login
```

---

## 📞 Need Help?

If you get stuck:
1. Check the error message
2. Look in Troubleshooting section above
3. Make sure you completed ALL steps
4. Make sure servers are restarted
5. Check browser console (F12) for errors

---

**Next Action:** Get your Client Secret and add it to `Backend/.env`!
