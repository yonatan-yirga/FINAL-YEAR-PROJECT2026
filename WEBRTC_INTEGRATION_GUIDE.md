# WebRTC Real-Time Calling Integration Guide

## Overview
This guide explains how to complete the WebRTC integration for real-time video and audio calling between users.

## What Has Been Created

### Backend Files
1. **`Backend/apps/messaging/consumers.py`** - WebSocket consumer for call signaling
2. **`Backend/apps/messaging/routing.py`** - WebSocket URL routing

### Frontend Files
1. **`Frontend/src/services/webrtcService.js`** - Complete WebRTC service with peer-to-peer connection logic
2. **`Frontend/src/components/chat/VideoCallModal.jsx`** - Updated call modal with WebRTC integration
3. **`Frontend/src/components/chat/VideoCallModal.css`** - Updated styles with incoming call UI

## Required Backend Setup

### Step 1: Install Django Channels
```bash
cd Backend
pip install channels channels-redis daphne
```

### Step 2: Update `Backend/internship_system/settings.py`
Add to INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... existing apps
    'channels',
]
```

Add ASGI configuration:
```python
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

### Step 3: Create `Backend/internship_system/asgi.py`
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

### Step 4: Install and Start Redis
```bash
# On Windows (using Chocolatey)
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases

# Start Redis
redis-server
```

### Step 5: Run Django with Daphne
```bash
daphne -b 0.0.0.0 -p 8000 internship_system.asgi:application
```

## Frontend Integration

### Update MessagesModern.jsx

Add WebRTC initialization in useEffect:

```javascript
// Initialize WebRTC signaling
useEffect(() => {
  const initWebRTC = async () => {
    try {
      await webrtcService.connectSignaling();
      
      // Handle incoming calls
      webrtcService.onCallInvite = (data) => {
        setOtherUserId(data.caller_id);
        setOtherName(data.caller_name);
        setIsVideoCall(data.call_type === 'video');
        setIsIncomingCall(true);
        setIsCallModalOpen(true);
      };
      
      // Handle call acceptance
      webrtcService.onCallAccept = (data) => {
        console.log('Call accepted by:', data.accepter_name);
      };
      
      // Handle call rejection
      webrtcService.onCallReject = () => {
        alert('Call was rejected');
        setIsCallModalOpen(false);
      };
      
      // Handle call end
      webrtcService.onCallEnd = () => {
        setIsCallModalOpen(false);
      };
      
    } catch (error) {
      console.error('Failed to connect WebRTC signaling:', error);
    }
  };
  
  initWebRTC();
  
  return () => {
    webrtcService.disconnect();
  };
}, []);
```

Update startVideoCall and startVoiceCall:

```javascript
const startVideoCall = () => {
  if (!activeAssignment || !otherUserId) return;
  setIsVideoCall(true);
  setIsIncomingCall(false);
  setIsCallModalOpen(true);
};

const startVoiceCall = () => {
  if (!activeAssignment || !otherUserId) return;
  setIsVideoCall(false);
  setIsIncomingCall(false);
  setIsCallModalOpen(true);
};
```

Update VideoCallModal props:

```jsx
<VideoCallModal
  isOpen={isCallModalOpen}
  onClose={() => setIsCallModalOpen(false)}
  otherUserName={otherName}
  otherUserId={otherUserId}
  isVideoCall={isVideoCall}
  onCallEnd={handleCallEnd}
  isIncoming={isIncomingCall}
  onAccept={() => setIsIncomingCall(false)}
  onReject={() => setIsCallModalOpen(false)}
/>
```

### Get Other User ID

Update the openConversation function to store the other user's ID:

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

### Update Backend Message Service

Update `Backend/apps/messaging/views.py` to include other_user_id:

```python
def get(self, request, assignment_id):
    # ... existing code ...
    
    # Determine other user
    if request.user == assignment.student.user:
        other_user = assignment.company.user
        other_name = assignment.company.name
    else:
        other_user = assignment.student.user
        other_name = assignment.student.user.get_full_name()
    
    return Response({
        'messages': serializer.data,
        'other_name': other_name,
        'other_user_id': other_user.id,  # Add this
        'internship_title': assignment.internship.title
    })
```

## How It Works

### Call Flow

**1. Caller initiates call:**
- Clicks video/audio button
- WebRTC service sends call invitation via WebSocket
- Call modal opens showing "Connecting..."
- Local camera/microphone activates

**2. Receiver gets notification:**
- WebSocket receives call invitation
- Call modal opens showing "Incoming call..."
- Shows Accept/Reject buttons

**3. Receiver accepts:**
- Clicks Accept button
- Local camera/microphone activates
- Sends acceptance via WebSocket
- WebRTC peer connection established

**4. WebRTC Signaling:**
- Caller creates SDP offer
- Offer sent to receiver via WebSocket
- Receiver creates SDP answer
- Answer sent to caller via WebSocket
- ICE candidates exchanged
- Peer-to-peer connection established

**5. Call connected:**
- Both users see each other's video
- Audio streams in real-time
- Call duration timer starts
- Controls available (mute, video, end)

**6. Call ends:**
- Either user clicks End Call
- WebRTC connection closes
- Streams stop
- Call summary sent to chat

## Testing

### Test Locally (Same Computer)

1. Open two browser windows
2. Login as different users in each
3. Start a conversation
4. Click video/audio call button in one window
5. Accept the call in the other window
6. You should see/hear yourself with a slight delay

### Test on Network

1. Get your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update frontend to use IP instead of localhost
3. Open on two different devices on same network
4. Test calling between devices

## Troubleshooting

### WebSocket Connection Failed
- Ensure Redis is running
- Check Django is running with Daphne
- Verify WebSocket URL in webrtcService.js

### Camera/Microphone Not Working
- Check browser permissions
- Ensure HTTPS (or localhost for development)
- Try different browser

### No Video/Audio Stream
- Check ICE candidates are being exchanged
- Verify STUN servers are accessible
- Check firewall settings

### Call Not Connecting
- Check WebSocket messages in browser console
- Verify both users are connected to WebSocket
- Check backend logs for errors

## Production Deployment

### Requirements
1. **HTTPS**: WebRTC requires secure connection
2. **Redis**: For WebSocket channel layer
3. **TURN Server**: For NAT traversal (optional but recommended)

### Recommended TURN Servers
- **Twilio**: https://www.twilio.com/stun-turn
- **Xirsys**: https://xirsys.com/
- **coturn**: Self-hosted open-source option

### Update ICE Servers for Production

In `webrtcService.js`:
```javascript
this.iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

## Summary

You now have a complete WebRTC implementation that enables:
- ✅ Real-time video calling
- ✅ Real-time audio calling
- ✅ Incoming call notifications
- ✅ Accept/Reject functionality
- ✅ Call controls (mute, video, end)
- ✅ Call duration tracking
- ✅ Peer-to-peer communication

The caller and receiver can now actually see and hear each other in real-time!
