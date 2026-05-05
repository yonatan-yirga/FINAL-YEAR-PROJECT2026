# OAuth Environment Variables Template

Copy and paste these templates into your `.env` files, then replace the placeholder values with your actual credentials.

---

## 📁 Backend/.env

Add these lines to your `Backend/.env` file:

```env
# ═══════════════════════════════════════════════════════════
# OAUTH CONFIGURATION
# ═══════════════════════════════════════════════════════════

# Google OAuth Credentials
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth Credentials
# Get from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173
```

---

## 📁 Frontend/.env

Create a new file `Frontend/.env` and add these lines:

```env
# ═══════════════════════════════════════════════════════════
# API CONFIGURATION
# ═══════════════════════════════════════════════════════════

VITE_API_URL=http://localhost:8000

# ═══════════════════════════════════════════════════════════
# OAUTH CONFIGURATION
# ═══════════════════════════════════════════════════════════

# Google OAuth Client ID
# Get from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# GitHub OAuth Client ID
# Get from: https://github.com/settings/developers
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

---

## 📝 Example (with fake credentials)

### Backend/.env Example:
```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789def456ghi789
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678stu
FRONTEND_URL=http://localhost:5173
```

### Frontend/.env Example:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
```

---

## ⚠️ Important Notes

1. **Never commit `.env` files to Git!**
   - They contain sensitive credentials
   - Already added to `.gitignore`

2. **Frontend only needs Client IDs**
   - NOT Client Secrets
   - Secrets stay on backend only

3. **Restart servers after updating `.env`**
   - Backend: Stop and run `python manage.py runserver`
   - Frontend: Stop and run `npm run dev`

4. **No quotes needed**
   - ✅ Correct: `GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com`
   - ❌ Wrong: `GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"`

5. **No spaces around `=`**
   - ✅ Correct: `GOOGLE_CLIENT_ID=value`
   - ❌ Wrong: `GOOGLE_CLIENT_ID = value`

---

## 🔒 Security Best Practices

1. **Keep credentials secret**
   - Don't share in screenshots
   - Don't commit to version control
   - Don't post in public forums

2. **Use different credentials for production**
   - Development: `localhost` URLs
   - Production: Your domain URLs

3. **Rotate credentials if exposed**
   - Generate new Client Secret
   - Update `.env` files
   - Restart servers

---

## 🚀 Production Configuration

For production deployment, update to:

### Backend/.env (Production):
```env
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_secret
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_secret
FRONTEND_URL=https://yourdomain.com
```

### Frontend/.env.production:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_GITHUB_CLIENT_ID=your_production_github_client_id
```

**Remember to update redirect URIs in OAuth providers to:**
- `https://yourdomain.com/auth/callback`

---

## ✅ Verification

After adding credentials, verify they're loaded:

### Backend:
```bash
cd Backend
python manage.py shell
>>> from django.conf import settings
>>> settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
# Should print your Google Client ID
```

### Frontend:
```bash
cd Frontend
npm run dev
# Check browser console:
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
# Should print your Google Client ID
```

---

**Need help?** See `OAUTH_CREDENTIALS_SETUP_GUIDE.md` for detailed instructions.
