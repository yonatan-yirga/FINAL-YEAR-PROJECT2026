# OAuth Quick Start Guide

Get OAuth working in 3 simple steps!

---

## Step 1: Get Credentials (15 min)

### Google OAuth
1. Go to: https://console.cloud.google.com/
2. Create project → Enable Google+ API → Create OAuth Client
3. Add redirect URI: `http://localhost:5173/auth/callback`
4. Copy **Client ID** and **Client Secret**

### GitHub OAuth
1. Go to: https://github.com/settings/developers
2. New OAuth App → Fill details
3. Callback URL: `http://localhost:5173/auth/callback`
4. Copy **Client ID** and **Client Secret**

---

## Step 2: Add to .env Files (2 min)

### Backend/.env
```env
GOOGLE_CLIENT_ID=paste_here
GOOGLE_CLIENT_SECRET=paste_here
GITHUB_CLIENT_ID=paste_here
GITHUB_CLIENT_SECRET=paste_here
FRONTEND_URL=http://localhost:5173
```

### Frontend/.env
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=paste_here
VITE_GITHUB_CLIENT_ID=paste_here
```

---

## Step 3: Test (3 min)

```bash
# Terminal 1 - Backend
cd Backend
python manage.py runserver

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

Open: http://localhost:5173/login

Click "Continue with Google" or "Continue with GitHub" ✅

---

## 🎉 Done!

That's it! OAuth is now working.

**Detailed guides:**
- `OAUTH_CREDENTIALS_SETUP_GUIDE.md` - Step-by-step with screenshots
- `OAUTH_SETUP_CHECKLIST.md` - Checklist format
- `OAUTH_ENV_TEMPLATE.md` - Copy-paste templates
- `OAUTH_FINAL_SUMMARY.md` - Complete documentation

---

## 🐛 Not Working?

**"redirect_uri_mismatch"**
→ Check redirect URIs in OAuth provider match exactly

**"Invalid client"**
→ Double-check Client ID/Secret in `.env` files

**Buttons don't appear**
→ Restart frontend server, clear browser cache

**Still stuck?**
→ Check `OAUTH_CREDENTIALS_SETUP_GUIDE.md` for troubleshooting

---

**Total Time:** ~20 minutes
