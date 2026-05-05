# OAuth Credentials Setup Guide

Complete step-by-step instructions to get your Google and GitHub OAuth credentials.

---

## 🔵 Part 1: Google OAuth Setup (10 minutes)

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account

### Step 2: Create a New Project

1. Click on the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"** button
3. Enter project details:
   - **Project name:** `DMU Internship Portal`
   - **Organization:** Leave as default
4. Click **"CREATE"**
5. Wait for the project to be created (takes ~30 seconds)
6. Select your new project from the dropdown

### Step 3: Enable Google+ API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. In the search bar, type: `Google+ API`
3. Click on **"Google+ API"** from results
4. Click the **"ENABLE"** button
5. Wait for it to enable (~10 seconds)

### Step 4: Configure OAuth Consent Screen

1. In the left sidebar, click **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"CREATE"**
4. Fill in the required fields:
   - **App name:** `DMU Internship Portal`
   - **User support email:** Your email
   - **Developer contact email:** Your email
5. Click **"SAVE AND CONTINUE"**
6. On "Scopes" page, click **"SAVE AND CONTINUE"** (no changes needed)
7. On "Test users" page, click **"SAVE AND CONTINUE"** (no changes needed)
8. Click **"BACK TO DASHBOARD"**

### Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. Configure the OAuth client:
   - **Application type:** Select `Web application`
   - **Name:** `DMU Internship Portal Web Client`
   
5. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**:
   - Add: `http://localhost:5173`
   - Add: `http://localhost:8000`
   
6. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**:
   - Add: `http://localhost:5173/auth/callback`
   - Add: `http://localhost:8000/api/oauth/callback/`

7. Click **"CREATE"**

### Step 6: Copy Your Credentials

1. A popup will appear with your credentials
2. **COPY** the following:
   - **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc123xyz789`)
3. Click **"OK"**

### Step 7: Save Google Credentials

Keep these credentials safe - you'll add them to your `.env` files in Part 3.

---

## ⚫ Part 2: GitHub OAuth Setup (5 minutes)

### Step 1: Go to GitHub Developer Settings

1. Open your browser and go to: **https://github.com/settings/developers**
2. Sign in to your GitHub account if needed

### Step 2: Create New OAuth App

1. Click on **"OAuth Apps"** in the left sidebar
2. Click the **"New OAuth App"** button (green button on the right)

### Step 3: Fill in Application Details

1. Enter the following information:
   - **Application name:** `DMU Internship Portal`
   - **Homepage URL:** `http://localhost:5173`
   - **Application description:** `University internship management system`
   - **Authorization callback URL:** `http://localhost:5173/auth/callback`

2. Click **"Register application"** (green button at bottom)

### Step 4: Generate Client Secret

1. You'll see your **Client ID** displayed on the page
2. Click **"Generate a new client secret"** button
3. **IMPORTANT:** Copy the secret immediately - you won't be able to see it again!

### Step 5: Copy Your Credentials

1. **COPY** the following:
   - **Client ID** (looks like: `Iv1.a1b2c3d4e5f6g7h8`)
   - **Client Secret** (looks like: `abc123def456ghi789jkl012mno345pqr678stu`)

2. Keep these credentials safe - you'll add them to your `.env` files in Part 3.

---

## 📝 Part 3: Add Credentials to Your Project (5 minutes)

### Step 1: Update Backend Environment File

1. Open your project in your code editor
2. Navigate to: `Backend/.env`
3. Find the OAuth section (or add it at the end):

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=paste_your_google_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_google_client_secret_here
GITHUB_CLIENT_ID=paste_your_github_client_id_here
GITHUB_CLIENT_SECRET=paste_your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

4. **Replace** the placeholder values with your actual credentials:
   - Replace `paste_your_google_client_id_here` with your Google Client ID
   - Replace `paste_your_google_client_secret_here` with your Google Client Secret
   - Replace `paste_your_github_client_id_here` with your GitHub Client ID
   - Replace `paste_your_github_client_secret_here` with your GitHub Client Secret

5. **Save** the file

### Step 2: Create/Update Frontend Environment File

1. Navigate to: `Frontend/` folder
2. Create a new file named `.env` (if it doesn't exist)
3. Add the following content:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=paste_your_google_client_id_here
VITE_GITHUB_CLIENT_ID=paste_your_github_client_id_here
```

4. **Replace** the placeholder values:
   - Replace `paste_your_google_client_id_here` with your Google Client ID
   - Replace `paste_your_github_client_id_here` with your GitHub Client ID
   - **Note:** Only Client IDs are needed in frontend, NOT secrets!

5. **Save** the file

---

## ✅ Part 4: Test Your OAuth Setup (5 minutes)

### Step 1: Restart Your Servers

1. **Stop** both backend and frontend servers (Ctrl+C)

2. **Start Backend:**
   ```bash
   cd Backend
   python manage.py runserver
   ```

3. **Start Frontend** (in a new terminal):
   ```bash
   cd Frontend
   npm run dev
   ```

### Step 2: Test Google OAuth

1. Open your browser and go to: `http://localhost:5173/login`
2. You should see the **"Continue with Google"** button
3. Click the button
4. You should be redirected to Google's login page
5. Sign in with your Google account
6. Grant permissions to the app
7. You should be redirected back to your dashboard

### Step 3: Test GitHub OAuth

1. Go back to: `http://localhost:5173/login`
2. Click the **"Continue with GitHub"** button
3. You should be redirected to GitHub's authorization page
4. Click **"Authorize"**
5. You should be redirected back to your dashboard

---

## 🎉 Success!

If both OAuth flows work, you're all set! Users can now sign in with Google or GitHub.

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in OAuth provider.

**Solution:**
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Make sure these URIs are added:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:8000/api/oauth/callback/`
4. Save and try again

### Error: "Invalid client"

**Problem:** Client ID or Secret is incorrect.

**Solution:**
1. Double-check your `.env` files
2. Make sure there are no extra spaces
3. Make sure you copied the complete ID/Secret
4. Restart your servers after updating `.env`

### Error: "Application not found"

**Problem:** GitHub OAuth app not properly configured.

**Solution:**
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click on your app
3. Verify the callback URL is: `http://localhost:5173/auth/callback`
4. Save and try again

### OAuth button doesn't appear

**Problem:** Frontend environment variables not loaded.

**Solution:**
1. Make sure `.env` file is in `Frontend/` folder (not `Frontend/src/`)
2. Restart the frontend server
3. Clear browser cache
4. Check browser console for errors

### "Cannot read property 'getGoogleAuthUrl'"

**Problem:** OAuth service not imported correctly.

**Solution:**
1. Check that `Frontend/src/services/oauthService.js` exists
2. Restart the frontend server
3. Clear browser cache

---

## 📋 Quick Reference

### Google OAuth URLs
- Console: https://console.cloud.google.com/
- Credentials: https://console.cloud.google.com/apis/credentials

### GitHub OAuth URLs
- Settings: https://github.com/settings/developers
- OAuth Apps: https://github.com/settings/developers

### Your Redirect URIs
- Frontend: `http://localhost:5173/auth/callback`
- Backend: `http://localhost:8000/api/oauth/callback/`

---

## 🚀 Production Deployment

When deploying to production, you'll need to:

1. **Create production OAuth apps** (separate from development)
2. **Update redirect URIs** to your production domain:
   - `https://yourdomain.com/auth/callback`
3. **Update environment variables** with production credentials
4. **Enable HTTPS** (required for OAuth in production)

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error message in browser console
3. Check Django server logs for backend errors
4. Verify all environment variables are set correctly

---

**Estimated Total Time:** 20-25 minutes

**You're done!** 🎉 Your OAuth authentication is now fully configured and ready to use!
