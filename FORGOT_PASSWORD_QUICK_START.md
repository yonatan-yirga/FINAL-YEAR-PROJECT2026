# 🔒 Forgot Password - Quick Start Guide

## What's New?

Modern forgot password page with **TWO recovery methods**:
1. **Reset Link** - Traditional secure link (1 hour expiry)
2. **Temporary Password** - Instant password via email (NEW!)

---

## 📁 Files Created

```
Frontend/src/pages/auth/
├── ForgotPasswordModern.jsx     ← New component
└── ForgotPasswordModern.css     ← Styles

Backend/apps/accounts/
├── views.py                     ← Added SendTemporaryPasswordView
└── urls.py                      ← Added /send-temporary-password/ route

Frontend/src/services/
└── authService.js               ← Added sendTemporaryPassword() method
```

---

## ⚡ Quick Setup (2 Steps)

### Step 1: Add Route

```javascript
// In your router file (App.jsx)
import ForgotPasswordModern from './pages/auth/ForgotPasswordModern';

<Route path="/forgot-password" element={<ForgotPasswordModern />} />
```

### Step 2: Update Login Link

```javascript
// In LoginModern.jsx
<Link to="/forgot-password" className="link-secondary-modern">
  Forgot password?
</Link>
```

---

## 🎯 How It Works

### Method 1: Reset Link
```
User enters email → Receives link → Creates new password
⏱️ Link expires in 1 hour
```

### Method 2: Temporary Password (NEW!)
```
User enters email → Receives password → Logs in → Changes password
⏱️ Must change password after first login
```

---

## 📧 Email Examples

### Reset Link Email
```
Subject: Reset your password

Click this link to reset your password:
http://localhost:5173/reset-password/abc123

Expires in 1 hour.
```

### Temporary Password Email
```
Subject: Your Temporary Password

Your temporary password is: Abc123@Xyz789

IMPORTANT:
1. Log in with this password
2. Change it immediately (Settings → Change Password)
3. Valid for 24 hours
```

---

## 🧪 Testing

### Test Reset Link
1. Go to `/forgot-password`
2. Enter email
3. Select "Reset Link"
4. Check email
5. Click link
6. Create new password

### Test Temporary Password
1. Go to `/forgot-password`
2. Enter email
3. Select "Temporary Password"
4. Check email
5. Copy password
6. Log in
7. Change password

---

## 🔐 Security Features

✅ Secure token generation  
✅ Password hashing  
✅ Email validation  
✅ Rate limiting  
✅ No email enumeration  
✅ One-time use tokens  
✅ Expiration times  

---

## 🎨 UI Features

✅ Clean, modern design  
✅ Two-column layout  
✅ Visual method selection  
✅ Success confirmation  
✅ Mobile responsive  
✅ Smooth animations  
✅ Accessible  

---

## ⚙️ Configuration

### Email Settings (Backend)

```python
# Backend/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'DMU Portal <noreply@dmu.edu>'
```

### Frontend URL (Backend)

```python
# Backend/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Development
]
```

---

## 🐛 Common Issues

### Emails not sending?
```bash
# Test email configuration
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test', 'from@example.com', ['to@example.com'])
```

### Link not working?
Check `CORS_ALLOWED_ORIGINS` in `Backend/settings.py`

### Temporary password not working?
Ensure no spaces when copying password

---

## 📊 API Endpoints

```http
# Send Reset Link
POST /api/auth/forgot-password/
Body: { "email": "user@example.com" }

# Send Temporary Password (NEW!)
POST /api/auth/send-temporary-password/
Body: { "email": "user@example.com" }

# Validate Token
GET /api/auth/reset-password/{token}/validate/

# Reset Password
POST /api/auth/reset-password/
Body: { "token": "...", "new_password": "...", "confirm_password": "..." }
```

---

## ✅ Testing Checklist

- [ ] Email validation works
- [ ] Reset link sends email
- [ ] Temporary password sends email
- [ ] Reset link works
- [ ] Temporary password works
- [ ] User can change password
- [ ] Success screen displays
- [ ] Mobile responsive
- [ ] Keyboard navigation works

---

## 📚 Full Documentation

See `FORGOT_PASSWORD_FEATURE_DOCUMENTATION.md` for:
- Complete feature list
- Security details
- Troubleshooting guide
- Deployment checklist
- Analytics & monitoring

---

## 🎉 You're Done!

Your forgot password feature is ready with **two recovery methods**!

**Next Steps:**
1. Test both methods
2. Configure email settings
3. Deploy to production
4. Update user documentation

---

**Questions?** Check the full documentation or contact the dev team.

**Created**: 2026-04-23  
**Version**: 1.0.0
