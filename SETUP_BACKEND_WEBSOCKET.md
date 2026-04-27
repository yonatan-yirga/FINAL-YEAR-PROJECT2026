# Setup Backend WebSocket Server - Step by Step

## Current Status
✅ Frontend is ready and trying to connect
❌ Backend WebSocket server is not running yet

The error you're seeing is **expected** - it means the frontend is working correctly but needs the backend WebSocket server.

## Quick Setup (Follow These Steps)

### Step 1: Install Required Packages

Open a terminal in the `Backend` folder and run:

```bash
cd Backend
pip install channels==4.0.0 channels-redis==4.1.0 daphne==4.0.0
```

### Step 2: Install Redis

**For Windows:**
```bash
# Using Chocolatey (recommended)
choco install redis-64

# Or download manually from:
# https://github.com/microsoftarchive/redis/releases
# Download Redis-x64-3.0.504.msi and install
```

**For Mac:**
```bash
brew install redis
```

**For Linux:**
```bash
sudo apt-get update
sudo apt-get install redis-server
```

### Step 3: Update Django Settings

Open `Backend/internship_system/settings.py` and add these changes:

**1. Add 'channels' to INSTALLED_APPS:**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',  # Add this line
    
    # Your apps
    'apps.accounts',
    'apps.internships',
    # ... rest of your apps
]
```

**2. Add ASGI configuration at the end of the file:**
```python
# WebSocket Configuration
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

### Step 4: Create ASGI Configuration File

Create a new file `Backend/internship_system/asgi.py` with this content:

```python
"""
ASGI config for internship_system project.
Enables WebSocket support for real-time calling.
"""
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

### Step 5: Update Message Service to Return User ID

Open `Backend/apps/messaging/views.py` and find the `MessageListView` class.

Update the `get` method to include `other_user_id`:

```python
def get(self, request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        
        # Check permission
        if request.user not in [assignment.student.user, assignment.company.user]:
            return Response({'error': 'Unauthorized'}, status=403)
        
        messages = Message.objects.filter(assignment=assignment).order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        
        # Determine other user
        if request.user == assignment.student.user:
            other_user = assignment.company.user
            other_name = assignment.company.name
        else:
            other_user = assignment.student.user
            other_name = assignment.student.user.get_full_name() or assignment.student.user.username
        
        return Response({
            'messages': serializer.data,
            'other_name': other_name,
            'other_user_id': other_user.id,  # Add this line
            'internship_title': assignment.internship.title
        })
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found'}, status=404)
```

### Step 6: Start Redis Server

Open a **new terminal** and start Redis:

```bash
redis-server
```

You should see output like:
```
[####] Server started, Redis version 3.0.504
[####] The server is now ready to accept connections on port 6379
```

**Keep this terminal running!**

### Step 7: Start Django with Daphne

Open **another new terminal**, go to Backend folder, and run:

```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 internship_system.asgi:application
```

You should see:
```
2024-XX-XX XX:XX:XX INFO     Starting server at tcp:port=8000:interface=0.0.0.0
2024-XX-XX XX:XX:XX INFO     HTTP/2 support enabled
2024-XX-XX XX:XX:XX INFO     Configuring endpoint tcp:port=8000:interface=0.0.0.0
2024-XX-XX XX:XX:XX INFO     Listening on TCP address 0.0.0.0:8000
```

**Keep this terminal running!**

### Step 8: Test the Connection

1. Go back to your browser
2. Refresh the page
3. Open browser console (F12)
4. You should see: `WebSocket connected` instead of the error

## Terminal Setup Summary

You should have **3 terminals running**:

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Django Backend:**
```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 internship_system.asgi:application
```

**Terminal 3 - Frontend:**
```bash
cd Frontend
npm run dev
```

## Testing the Call Feature

Once all 3 terminals are running:

### Test with Two Browser Windows:

1. **Window 1 (Normal):**
   - Login as Student A
   - Open chat with a company/advisor

2. **Window 2 (Incognito/Private):**
   - Login as the Company/Advisor
   - Open chat with Student A

3. **Window 1:**
   - Click the video call button (📹)
   - Allow camera/microphone access
   - You should see "Connecting..."

4. **Window 2:**
   - You should see "Incoming call..." notification
   - Click the green Accept button
   - Allow camera/microphone access

5. **Both Windows:**
   - You should now see each other's video!
   - Test mute, video on/off, and end call buttons

## Troubleshooting

### "ModuleNotFoundError: No module named 'channels'"
```bash
pip install channels channels-redis daphne
```

### "Redis connection refused"
- Make sure Redis is running: `redis-server`
- Check if Redis is on port 6379: `redis-cli ping` (should return "PONG")

### "WebSocket connection failed"
- Make sure Django is running with Daphne (not `python manage.py runserver`)
- Check the URL is correct: `ws://localhost:8000/ws/call/`
- Check browser console for specific error messages

### "Could not access camera/microphone"
- Click "Allow" when browser asks
- Check browser settings for camera/microphone permissions
- Try Chrome or Edge (best WebRTC support)

### Still not working?
1. Check all 3 terminals are running
2. Check browser console for errors
3. Check Django terminal for errors
4. Try restarting all services

## What Happens Next

Once the WebSocket connects successfully:

1. ✅ No more connection errors in console
2. ✅ You'll see "WebSocket connected" message
3. ✅ Clicking call button will work
4. ✅ Other user will receive call notification
5. ✅ Both users can see and hear each other

## Files You Created/Modified

### New Files:
- `Backend/apps/messaging/consumers.py` ✅ (already created)
- `Backend/apps/messaging/routing.py` ✅ (already created)
- `Backend/internship_system/asgi.py` ⚠️ (need to create)

### Modified Files:
- `Backend/internship_system/settings.py` ⚠️ (need to update)
- `Backend/apps/messaging/views.py` ⚠️ (need to update)

## Quick Checklist

- [ ] Installed channels, channels-redis, daphne
- [ ] Installed Redis
- [ ] Added 'channels' to INSTALLED_APPS
- [ ] Added ASGI_APPLICATION and CHANNEL_LAYERS to settings.py
- [ ] Created asgi.py file
- [ ] Updated MessageListView to return other_user_id
- [ ] Started Redis server
- [ ] Started Django with Daphne
- [ ] Frontend is running
- [ ] Tested WebSocket connection (no errors in console)
- [ ] Tested calling between two users

## Success Indicators

✅ **Redis running:** Terminal shows "ready to accept connections"
✅ **Django running:** Terminal shows "Listening on TCP address"
✅ **Frontend running:** Browser shows your app
✅ **WebSocket connected:** Console shows "WebSocket connected"
✅ **Call works:** Can see and hear each other

## Next Steps After Setup

Once everything is working:
1. Test video calls
2. Test audio calls
3. Test mute/unmute
4. Test video on/off
5. Test call duration
6. Test on different devices
7. Test on mobile browsers

You're almost there! Just follow these steps and the calling feature will work perfectly! 🚀
