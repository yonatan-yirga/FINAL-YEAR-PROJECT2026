# 🎥 Quick Test: Video Calling Feature

## ✅ Server is Running!

The ASGI server with WebSocket support is already running in the background.

## 🧪 Test Now (2 Minutes)

### Step 1: Open Two Browser Windows

**Window 1 - Regular Browser:**
```
1. Go to: http://localhost:5173
2. Login as a student
3. Click "Messages" in navigation
```

**Window 2 - Incognito/Private Mode:**
```
1. Open incognito window (Ctrl+Shift+N in Chrome)
2. Go to: http://localhost:5173
3. Login as a different user (advisor or another student)
4. Click "Messages" in navigation
```

### Step 2: Make a Video Call

**In Window 1:**
```
1. Select a conversation with the other user
2. Click the VIDEO CALL button (camera icon) at the top
3. Click "Allow" when browser asks for camera/microphone
4. Wait for other user to answer
```

**In Window 2:**
```
1. You'll see an incoming call notification
2. Click "Accept" button
3. Click "Allow" when browser asks for camera/microphone
4. You should now see each other!
```

### Step 3: Test Controls

Try these during the call:
- ✅ Click microphone icon to mute/unmute
- ✅ Click camera icon to turn video on/off
- ✅ Click "End Call" button to hang up

## ✅ What Should Work

- ✅ No WebSocket errors in browser console
- ✅ Call invitation appears for receiver
- ✅ Video streams from both users
- ✅ Audio works both ways
- ✅ Controls (mute, camera) work
- ✅ Call ends properly

## 🔍 Check Browser Console

**Good (Success):**
```
✅ WebSocket connected
✅ Connection state: connected
✅ Received remote track
```

**Bad (Problem):**
```
❌ WebSocket connection failed
❌ token=null
```

If you see errors, refresh the page (Ctrl+R) and try again.

## 🎉 That's It!

If video and audio work, the feature is fully functional! 

---

**Need Help?**
- Check `WEBRTC_SETUP_COMPLETE.md` for troubleshooting
- Make sure both users are logged in
- Grant camera/microphone permissions when asked
- Try Chrome or Edge for best compatibility
