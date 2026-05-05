# 🔍 WebSocket Debugging - Enhanced Logging

## ✅ Changes Made

I've added extensive logging to the WebRTC service to help diagnose the WebSocket issue:

### New Logs You'll See:

**When WebSocket Connects:**
```
🔌 Connecting to WebSocket: ws://localhost:8000/ws/call/?token=...
🔑 Token: abc123...
✅ WebSocket connected successfully!
```

**When Starting a Call:**
```
🎬 Starting call...
  Target User ID: 92
  Call Type: video
  WebSocket state: 1
🎥 Initializing media...
✅ Media initialized
📤 Sending call invite: {type: "call_invite", ...}
📡 Sending signaling message: {type: "call_invite", ...}
  WebSocket state: 1
  Message string: {"type":"call_invite",...}
✅ Message sent successfully
✅ Call invite sent
```

**When Receiving Messages:**
```
📨 WebSocket message received: {"type":"connection_established",...}
Signaling message: {type: "connection_established", ...}
```

## 🧪 Test Now

### Step 1: Hard Refresh BOTH Browsers
Press **Ctrl+Shift+R** in both browsers.

### Step 2: Open Console in BOTH Browsers
Press **F12** to open developer console.

### Step 3: Login Again
- Student: `o11027107@gmail.com` / `test123`
- Advisor: `yobg234@gmail.com` / `test123`

### Step 4: Go to Messages
Navigate to Messages page in both browsers.

### Step 5: Check WebSocket Connection
Look in the console for:
```
🔌 Connecting to WebSocket: ws://localhost:8000/ws/call/?token=...
✅ WebSocket connected successfully!
📨 WebSocket message received: {"type":"connection_established",...}
```

**If you DON'T see this:**
- WebSocket is NOT connecting
- Check if ASGI server is running
- Check if token is valid (not null)

### Step 6: Make a Call
Student clicks video button.

### Step 7: Check Console Logs
You should see:
```
🎬 Starting call...
  Target User ID: 92
  WebSocket state: 1
🎥 Initializing media...
✅ Media initialized
📤 Sending call invite: ...
📡 Sending signaling message: ...
✅ Message sent successfully
```

**If WebSocket state is NOT 1:**
- WebSocket is not connected
- State 0 = CONNECTING
- State 1 = OPEN (good!)
- State 2 = CLOSING
- State 3 = CLOSED

### Step 8: Check Advisor Console
Advisor should see:
```
📨 WebSocket message received: {"type":"call_invite",...}
Signaling message: {type: "call_invite", caller_id: X, ...}
```

## 🔍 What to Look For

### Problem 1: WebSocket Not Connecting
**Symptoms:**
- No "🔌 Connecting to WebSocket" message
- No "✅ WebSocket connected successfully!" message

**Causes:**
- ASGI server not running
- Token is null
- WebRTC not initialized

**Solution:**
- Check ASGI server is running on port 8000
- Check localStorage has valid token
- Hard refresh browser

### Problem 2: WebSocket Connects But No Messages
**Symptoms:**
- "✅ WebSocket connected successfully!" appears
- But no "📨 WebSocket message received" for connection_established

**Causes:**
- Backend consumer not sending connection_established
- WebSocket connection dropped immediately

**Solution:**
- Check backend logs
- Check middleware authentication

### Problem 3: Call Invite Sent But Not Received
**Symptoms:**
- Student console shows "✅ Message sent successfully"
- Advisor console shows NO "📨 WebSocket message received"

**Causes:**
- Advisor WebSocket not connected
- Channel layer not working
- Wrong target_user_id

**Solution:**
- Check advisor has WebSocket connected
- Check target_user_id is correct (should be 92 in your case)
- Check backend logs for "Call invite from X to Y"

### Problem 4: WebSocket State Not 1
**Symptoms:**
- "WebSocket state: 0" or "WebSocket state: 3"

**Causes:**
- WebSocket still connecting (0)
- WebSocket closed (3)

**Solution:**
- Wait for connection to complete
- Reconnect if closed
- Check ASGI server

## 📊 Expected Console Output

### Student Console (Full Flow):
```
🔌 Connecting to WebSocket: ws://localhost:8000/ws/call/?token=abc...
🔑 Token: abc123...
✅ WebSocket connected successfully!
📨 WebSocket message received: {"type":"connection_established","user_id":123}
Signaling message: {type: "connection_established", user_id: 123}

Opening conversation - User role: STUDENT
Set otherUserId to: 92

startVideoCall - activeAssignment: 19 otherUserId: 92
Starting video call with user: 92
🎬 Starting call...
  Target User ID: 92
  Call Type: video
  WebSocket state: 1
🎥 Initializing media...
✅ Media initialized
📤 Sending call invite: {type: "call_invite", target_user_id: 92, ...}
📡 Sending signaling message: {type: "call_invite", ...}
  WebSocket state: 1
✅ Message sent successfully
✅ Call invite sent
```

### Advisor Console (Full Flow):
```
🔌 Connecting to WebSocket: ws://localhost:8000/ws/call/?token=xyz...
🔑 Token: xyz789...
✅ WebSocket connected successfully!
📨 WebSocket message received: {"type":"connection_established","user_id":92}
Signaling message: {type: "connection_established", user_id: 92}

📨 WebSocket message received: {"type":"call_invite","caller_id":123,...}
Signaling message: {type: "call_invite", caller_id: 123, caller_name: "yonatan", ...}
```

## 🎯 Action Items

1. **Hard refresh both browsers** (Ctrl+Shift+R)
2. **Open console in both** (F12)
3. **Login again**
4. **Go to Messages**
5. **Look for WebSocket connection logs**
6. **Make a call**
7. **Check all the logs above**
8. **Take screenshot of console** if still not working

---

**Status:** ✅ Enhanced logging added - Ready to debug!
**Next:** Hard refresh and check console logs
