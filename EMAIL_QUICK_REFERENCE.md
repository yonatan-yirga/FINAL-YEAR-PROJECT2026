# Email Quick Reference Card

## ✅ Status: WORKING

Your SMTP email is configured correctly and sending emails successfully!

---

## 🚀 Quick Test

```bash
cd Backend
python test_email.py
```

**Expected:** ✅ SUCCESS! Email sent successfully!

---

## 📧 Registration Emails

### When User Registers:
1. **Applicant receives:** "Registration Received"
2. **UIL staff receives:** "New Registration Request"

### Check Backend Console:
```
✅ Registration notification sent for user@example.com
✅ Email sent successfully to user@example.com
```

---

## 🔍 Troubleshooting

### Not Receiving Emails?

1. **Check Spam Folder** 📁
2. **Check Backend Logs** 📝
   ```
   Look for: ✅ or ❌ messages
   ```
3. **Run Test Script** 🧪
   ```bash
   python test_email.py
   ```
4. **Verify Email Address** ✉️

---

## 📊 Email Configuration

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=yonyir05@gmail.com
EMAIL_HOST_PASSWORD=****************
```

---

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| No email received | Check spam folder |
| Authentication error | Use Gmail App Password |
| Connection timeout | Check firewall/port 587 |
| Invalid recipient | Verify email address |

---

## 📚 Documentation

- **Full Guide:** `EMAIL_TROUBLESHOOTING_GUIDE.md`
- **Fix Summary:** `EMAIL_FIX_SUMMARY.md`
- **Test Script:** `Backend/test_email.py`

---

## ✅ Verification

- [x] SMTP test passed
- [x] Configuration correct
- [x] Logging enhanced
- [x] Error handling improved

---

## 📞 Quick Help

**Email not working?**
1. Run: `python test_email.py`
2. Check backend console
3. Read: `EMAIL_TROUBLESHOOTING_GUIDE.md`

**Email working but not receiving?**
1. Check spam folder
2. Verify email address
3. Check backend logs

---

**Status: ✅ READY TO USE**

Your email system is working! Registration emails will be sent automatically.
