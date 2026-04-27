# WebRTC Real-Time Calling - Quick Start Guide

## What You Have Now

✅ **Complete WebRTC Implementation**
- Real peer-to-peer video/audio calling
- Caller and receiver can see and hear each other
- Incoming call notifications
- Accept/Reject functionality
- Full call controls

## Quick Setup (5 Minutes)

### Step 1: Install Backend Dependencies
```bash
cd Backend
pip install channels channels-redis daphne
```

### Step 2: Install Redis

**Windows:**
```bash
choco install redis-64
```
Or download from: https://github.com/microsoftarchive/redis/releases

**Mac:**
```bash
brew install redis
```

**Linux:**
```bash
sudo apt-get install redis-server
```

### Step 3: Update Django Settings

Add to `Backend/internship_system/settings.py`:

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps ...
    'channels',
]

# Add at the end of file
ASGI_APPLICATION = 'internship_system.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### Step 4: Create ASGI Configuration

Create `Backend/internship_system/asgi.py`:

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.messaging.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'internship_system.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
```

### Step 5: Update Message Service Backend

In `Backend/apps/messaging/views.py`, update the `get` method to include `other_user_id`:

```python
# In MessageListView.get() method
return Response({
    'messages': serializer.data,
    'other_name': other_name,
    'other_user_id': other_user.id,  # Add this line
    'internship_title': assignment.internship.title
})
```

### Step 6: Update Frontend MessagesModern Component

Add to `Frontend/src/pages/common/MessagesModern.jsx`:

**1. Add state for other user ID:**
```javascript
const [otherUserId, setOtherUserId] = useState(null);
const [isIncomingCall, setIsIncomingCall] = useState(false);
```

**2. Add WebRTC initialization:**
```javascript
// Add this useEffect after other useEffects
useEffect(() => {
  const initWebRTC = async () => {
    try {
      await webrtcService.connectSignaling();
      
      webrtcService.onCallInvite = (data) => {
        setOtherUserId(data.caller_id);
        setOtherName(data.caller_name);
        setIsVideoCall(data.call_type === 'video');
        setIsIncomingCall(true);
        setIsCallModalOpen(true);
      };
      
      webrtcService.onCallAccept = (data) => {
        console.log('Call accepted');
      };
      
      webrtcService.onCallReject = () => {
        alert('Call was rejected');
        setIsCallModalOpen(false);
      };
      
      webrtcService.onCallEnd = () => {
        setIsCallModalOpen(false);
      };
    } catch (error) {
      console.error('WebRTC connection failed:', error);
    }
  };
  
  initWebRTC();
  
  return () => {
    webrtcService.disconnect();
  };
}, []);
```

**3. Update openConversation to get other user ID:**
```javascript
const openConversation = useCallback(async (assignmentId) => {
  setActiveAssignment(assignmentId);
  const res = await messageService.getMessages(assignmentId);
  if (res.success) {
    setMessages(res.data.messages);
    setOtherName(res.data.other_name);
    setOtherUserId(res.data.other_user_id); // Add this
    setInternshipTitle(res.data.internship_title);
    setConversations(prev =>
      prev.map(c => c.assignment_id === assignmentId ? { ...c, unread_count: 0 } : c)
    );
  }
}, []);
```

**4. Update VideoCallModal props:**
```jsx
<VideoCallModal
  isOpen={isCallModalOpen}
  onClose={() => setIsCallModalOpen(false)}
  otherUserName={otherName}
  otherUserId={otherUserId}  // Add this
  isVideoCall={isVideoCall}
  onCallEnd={handleCallEnd}
  isIncoming={isIncomingCall}  // Add this
  onAccept={() => setIsIncomingCall(false)}  // Add this
  onReject={() => setIsCallModalOpen(false)}  // Add this
/>
```

### Step 7: Start Everything

**Terminal 1 - Start Redis:**
```bash
redis-server
```

**Terminal 2 - Start Django:**
```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 internship_system.asgi:application
```

**Terminal 3 - Start Frontend:**
```bash
cd Frontend
npm run dev
```

## Test the Calling Feature

### Test with Two Browser Windows:

1. **Window 1:** Login as User A
2. **Window 2:** Login as User B (use incognito/private mode)
3. **Window 1:** Open chat with User B
4. **Window 1:** Click video call button
5. **Window 2:** See incoming call notification
6. **Window 2:** Click Accept
7. **Both Windows:** You should now see and hear each other!

### What You Should See:

**Caller (Window 1):**
- Clicks video button
- Sees "Connecting..." with their own video
- When accepted, sees the other person's video

**Receiver (Window 2):**
- Sees "Incoming call..." notification
- Sees Accept (green) and Reject (red) buttons
- Clicks Accept
- Sees their own video and the caller's video

**Both Users:**
- Can mute/unmute microphone
- Can turn camera on/off (video calls)
- Can end the call
- See call duration timer
- Call summary sent to chat when ended

## Troubleshooting

### "WebSocket connection failed"
- Make sure Redis is running: `redis-server`
- Make sure Django is running with Daphne (not `python manage.py runserver`)

### "Could not access camera/microphone"
- Click "Allow" when browser asks for permissions
- Check browser settings for camera/microphone access
- Try a different browser (Chrome/Edge recommended)

### "No video/audio"
- Check both users accepted permissions
- Verify WebSocket is connected (check browser console)
- Make sure you're using HTTPS or localhost

### "Call not connecting"
- Check browser console for errors
- Verify both users are logged in
- Check backend logs for WebSocket errors

## Architecture

```
User A (Caller)                    Backend (Django + Channels)                    User B (Receiver)
     |                                        |                                          |
     |------ Click Call Button -------------->|                                          |
     |                                        |                                          |
     |                                        |------- Call Invitation ---------------->|
     |                                        |                                          |
     |                                        |<------ Accept Call ---------------------|
     |<------ Call Accepted ------------------|                                          |
     |                                        |                                          |
     |------ WebRTC Offer ------------------->|------- Forward Offer ------------------>|
     |                                        |                                          |
     |<------ WebRTC Answer ------------------|<------ Forward Answer -------------------|
     |                                        |                                          |
     |<====== ICE Candidates Exchange =======>|<====== ICE Candidates Exchange ========>|
     |                                        |                                          |
     |<==================== Direct Peer-to-Peer Connection ==========================>|
     |                                        |                                          |
     |                    Video/Audio Streams Flow Directly                             |
```

## What's Included

### Backend:
- ✅ WebSocket consumer for signaling
- ✅ Call invitation handling
- ✅ Accept/Reject handling
- ✅ WebRTC offer/answer exchange
- ✅ ICE candidate exchange

### Frontend:
- ✅ WebRTC service with full peer connection logic
- ✅ Call modal with video/audio UI
- ✅ Incoming call notifications
- ✅ Call controls (mute, video, end)
- ✅ Call duration tracking
- ✅ Responsive design

## Next Steps

Once basic calling works, you can add:
- 📱 Push notifications for incoming calls
- 📞 Call history and logs
- 🔔 Ring tone for incoming calls
- 📊 Call quality indicators
- 🎥 Screen sharing
- 💬 In-call chat
- 👥 Group calls

## Support

For detailed information, see:
- `WEBRTC_INTEGRATION_GUIDE.md` - Complete technical documentation
- `REAL_TIME_CALLING_IMPLEMENTATION.md` - Feature overview

## Summary

You now have a **fully functional real-time calling system** where:
- Users can call each other with video or audio
- Calls work peer-to-peer (direct connection)
- Both users can see and hear each other in real-time
- Professional UI with all necessary controls
- Works on desktop and mobile browsers

The caller and receiver can now **actually communicate like a real phone call**! 🎉
