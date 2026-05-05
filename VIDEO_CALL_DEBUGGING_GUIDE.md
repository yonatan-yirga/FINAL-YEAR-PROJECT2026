# Video Call Debugging Guide

## 🔧 Changes Made

I've added extensive logging to the WebSocket consumer to help diagnose the issue. The ASGI server has been restarted with these changes.

## 📊 What to Check

### Step 1: Open Browser Consoles
Open the browser console (F12) in BOTH browsers (student and advisor) to see the logs.

### Step 2: Check WebSocket Connection

**In Student Browser:**
After login, you should see in console:
```
WebSocket connected
Signaling message: {type: "connection_established", user_id: X}
```

**In Advisor Browser:**
After login, you should see in console:
```
WebSocket connected
Signaling message: {type: "connection_established", user_id: Y}
```

### Step 3: Check Backend Logs

Open a new terminal and check the ASGI server output:
```bash
# The server is running as background process
# Check logs to see WebSocket connections
```

You should see:
```
✅ WebSocket connected: User X (student@test.com) joined call_user_X
✅ WebSocket connected: User Y (advisor@test.com) joined call_user_Y
```

### Step 4: Make a Call

**Student clicks video button:**

**Student Console should show:**
```
startVideoCall - activeAssignment: 1 otherUserId: Y
Starting video call with user: Y
```

**Backend logs should show:**
```
📞 Call invite from X (Student Name) to Y
```

**Advisor Console should show:**
```
Signaling message: {type: "call_invite", caller_id: X, caller_name: "Student Name", ...}
```

**Advisor clicks Accept:**

**Advisor Console should show:**
```
Accepting call...
```

**Backend logs should show:**
```
✅ Call accepted by Y (Advisor Name) from X
📡 WebRTC offer from X to Y
📡 WebRTC answer from Y to X
🧊 ICE candidate from X to Y
🧊 ICE candidate from Y to X
```

**Both Consoles should show:**
```
Connection state: connecting
Received remote track
Connection state: connected
```

## ❌ Common Issues

### Issue 1: No WebSocket Connection
**Symptoms:** Console shows WebSocket error
**Solution:**
1. Check ASGI server is running: `http://localhost:8000`
2. Hard refresh browser (Ctrl+Shift+R)
3. Check token is valid in localStorage

### Issue 2: Call Invite Not Received
**Symptoms:** Student clicks call, but advisor sees nothing
**Possible Causes:**
1. **Wrong otherUserId** - Check console log shows correct user ID
2. **WebSocket not connected** - Check both users have WebSocket connected
3. **Channel layer issue** - Check backend logs for errors

**Debug:**
```javascript
// In student console after opening conversation:
console.log('otherUserId:', otherUserId);
console.log('activeAssignment:', activeAssignment);
```

### Issue 3: Call Accepted But No Video/Audio
**Symptoms:** Both see "Connecting..." but never connect
**Possible Causes:**
1. **WebRTC offer/answer not exchanged** - Check backend logs
2. **ICE candidates not exchanged** - Check backend logs
3. **Firewall blocking** - Try on same network
4. **STUN server issue** - Check internet connection

**Debug:**
Check backend logs for:
```
📡 WebRTC offer from X to Y
📡 WebRTC answer from Y to X
🧊 ICE candidate from X to Y
🧊 ICE candidate from Y to X
```

### Issue 4: Permission Denied
**Symptoms:** Browser doesn't ask for camera/microphone
**Solution:**
1. Click camera icon in address bar
2. Allow camera and microphone
3. Refresh page and try again

## 🧪 Testing Checklist

- [ ] ASGI server running (port 8000)
- [ ] Frontend dev server running (port 5173)
- [ ] Student logged in (Browser 1)
- [ ] Advisor logged in (Browser 2 - incognito)
- [ ] Both have console open (F12)
- [ ] Student opens conversation
- [ ] Console shows correct `otherUserId`
- [ ] Student clicks video button
- [ ] Advisor receives incoming call notification
- [ ] Backend logs show call invite
- [ ] Advisor clicks Accept
- [ ] Backend logs show call accepted
- [ ] Backend logs show WebRTC offer/answer
- [ ] Backend logs show ICE candidates
- [ ] Both see "Connecting..."
- [ ] Both see "Connected" with timer
- [ ] Video streams visible
- [ ] Audio working

## 🔍 Detailed Debugging Steps

### If Call Not Received:

1. **Check Student Console:**
   ```javascript
   // After opening conversation, check:
   console.log('User role:', user?.role);
   console.log('Other user ID:', otherUserId);
   console.log('Assignment ID:', activeAssignment);
   ```

2. **Check WebSocket Status:**
   ```javascript
   // In both consoles:
   console.log('WebSocket state:', webrtcService.websocket?.readyState);
   // Should be 1 (OPEN)
   ```

3. **Check Backend Logs:**
   - Look for "Call invite from X to Y"
   - If not there, WebSocket message not reaching server
   - Check middleware authentication

4. **Check Advisor WebSocket:**
   - Advisor must be connected to receive invite
   - Check advisor console for "WebSocket connected"

### If Call Accepted But Not Connecting:

1. **Check WebRTC Offer:**
   - Backend should log "WebRTC offer from X to Y"
   - If not, check student's peer connection creation

2. **Check WebRTC Answer:**
   - Backend should log "WebRTC answer from Y to X"
   - If not, check advisor's peer connection creation

3. **Check ICE Candidates:**
   - Backend should log multiple ICE candidates
   - If not, check STUN server connectivity

4. **Check Connection State:**
   ```javascript
   // In both consoles:
   console.log('Connection state:', webrtcService.peerConnection?.connectionState);
   ```

## 📝 What to Send Me

If still not working, send me:

1. **Student Console Logs** (from opening conversation to clicking call)
2. **Advisor Console Logs** (from receiving call to accepting)
3. **Backend Logs** (from ASGI server terminal)
4. **Screenshot** of both browsers showing the issue

## 🎯 Expected Flow

```
STUDENT                    BACKEND                    ADVISOR
   |                          |                          |
   |-- WebSocket Connect ---->|                          |
   |<-- connection_established-|                          |
   |                          |<-- WebSocket Connect ----|
   |                          |-- connection_established->|
   |                          |                          |
   |-- call_invite ---------->|                          |
   |                          |-- call_invite ---------->|
   |                          |                          |
   |                          |<-- call_accept ----------|
   |<-- call_accept ----------|                          |
   |                          |                          |
   |-- webrtc_offer --------->|                          |
   |                          |-- webrtc_offer --------->|
   |                          |                          |
   |                          |<-- webrtc_answer --------|
   |<-- webrtc_answer --------|                          |
   |                          |                          |
   |<====== ICE candidates exchanged via backend =======>|
   |                          |                          |
   |<========== Direct P2P Connection Established ======>|
```

---

**Next Steps:**
1. Hard refresh both browsers (Ctrl+Shift+R)
2. Login as student and advisor
3. Open consoles in both browsers
4. Try making a call
5. Check console logs and backend logs
6. Report what you see!
