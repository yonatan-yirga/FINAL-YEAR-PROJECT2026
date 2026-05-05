# 🚀 Agora Video Call - Quick Test Guide

## ⚡ Quick Start (3 Steps)

### 1️⃣ Restart Backend
```bash
# Stop current server (Ctrl+C)
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### 2️⃣ Hard Refresh Browser
Press `Ctrl + Shift + R`

### 3️⃣ Test Call
1. Open two browser windows
2. Login as different users
3. Go to Messages
4. Click video button 🎥

---

## 👥 Test Users

All passwords: `test123`

| Email | Role | Use For |
|-------|------|---------|
| student@test.com | Student | Window 1 |
| advisor@test.com | Advisor | Window 2 (Incognito) |
| o11027107@gmail.com | Student | Alternative |
| yobg234@gmail.com | Advisor | Alternative |

---

## ✅ Success Checklist

When it works, you'll see:

### Backend Console:
```
✅ Token generated successfully!
   Channel: assignment_123
   UID: 456789
   Token: 006eJxTYJgX...
```

### Browser Console (F12):
```
🚀 Initializing Agora call...
✅ Got Agora token
✅ Joined channel with UID: 456789
✅ Local video playing
👤 Remote user published: 123456 video
✅ Remote video playing
```

### UI:
- ✅ Local video in bottom-right corner
- ✅ Remote video in main area
- ✅ Call duration timer counting
- ✅ Mute/Video/End buttons working

---

## 🚨 Common Issues

### Issue: "invalid token, authorized failed"

**Cause:** Primary Certificate not enabled in Agora console

**Solution:**
1. Go to https://console.agora.io/
2. Open your project (App ID: 19fa6bc3e79140d596e36afda2045b97)
3. Enable "Primary Certificate"
4. Set value to: `2dcc1585f5104831aa3f7abb3e4d2e99`
5. Restart backend and test again

### Issue: "Failed to get Agora token"

**Cause:** Backend not running or not logged in

**Solution:**
1. Check backend is running on port 8000
2. Make sure you're logged in
3. Check browser console for errors

### Issue: Can't see remote video

**Cause:** Other user hasn't joined yet

**Solution:**
1. Make sure both users are in the same conversation
2. Both users should click the video button
3. Wait a few seconds for connection

### Issue: No audio

**Cause:** Microphone blocked or muted

**Solution:**
1. Check browser permissions (camera/microphone)
2. Check if mute button is active
3. Check system audio settings

---

## 🔍 Debug Mode

### Check Backend Logs:
Look for these messages in backend console:
```
✅ Token generated successfully!
```

### Check Frontend Logs:
Open browser console (F12) and look for:
```
✅ Joined channel with UID: 456789
```

### Check Network:
1. Open DevTools (F12)
2. Go to Network tab
3. Look for `/api/messages/agora/token/`
4. Should return 200 OK with token

---

## 📊 Expected Flow

```
User clicks video button
    ↓
Frontend requests token from backend
    ↓
Backend generates token with certificate
    ↓
Frontend joins Agora channel with token
    ↓
Frontend publishes local video/audio
    ↓
Other user joins same channel
    ↓
Both users see/hear each other! 🎉
```

---

## 🎯 Quick Troubleshooting

| Problem | Check | Fix |
|---------|-------|-----|
| Token error | Agora console | Enable certificate |
| No token | Backend running | Restart backend |
| No video | Browser permissions | Allow camera/mic |
| No remote video | Other user joined | Wait or refresh |
| No audio | Mute button | Unmute |

---

## 📞 Test Scenarios

### Scenario 1: Student calls Advisor
1. Login as student@test.com
2. Go to Messages
3. Open conversation with advisor
4. Click video button
5. Advisor should see incoming call

### Scenario 2: Audio-only call
1. Click phone button (not video)
2. Should work without video
3. Can toggle video on during call

### Scenario 3: Mute/Unmute
1. Start call
2. Click microphone button
3. Should mute/unmute audio
4. Icon should change

### Scenario 4: Video On/Off
1. Start video call
2. Click video button
3. Should turn off camera
4. Local video should show "camera off" icon

---

## ✅ Final Checklist

Before testing:
- [ ] Backend server restarted
- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] Two browser windows open
- [ ] Different users logged in
- [ ] Both on Messages page

During test:
- [ ] Click video button
- [ ] See "Connecting..." message
- [ ] See local video in corner
- [ ] Other user joins
- [ ] See remote video in main area
- [ ] Hear audio from other user
- [ ] Call duration timer counting

After test:
- [ ] Click end call button
- [ ] Call ends gracefully
- [ ] No errors in console
- [ ] Can start new call

---

**Status:** Ready to test!
**Time:** ~2 minutes to test
**Expected:** Video calls work perfectly! 🎉

