# Install Real-Time Calling Feature - Simple Guide

## What You're Seeing

The error `WebSocket connection failed` means:
- ✅ Your frontend is working perfectly
- ❌ The backend WebSocket server isn't running yet

## Fix It in 3 Steps

### Step 1: Install Packages (2 minutes)

Open terminal in `Backend` folder:

```bash
cd Backend
pip install channels==4.0.0 channels-redis==4.1.0 daphne==4.0.0
```

### Step 2: Install Redis (2 minutes)

**Windows:**
```bash
choco install redis-64
```
Or download: https://github.com/microsoftarchive/redis/releases

**Mac:**
```bash
brew install redis
```

**Linux:**
```bash
sudo apt-get install redis-server
```

### Step 3: Update 2 Files (1 minute)

**File 1: `Backend/internship_system/settings.py`**

Add `'channels'` to INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    'channels',  # Add this line
    # ... rest of apps ...
]
```

Add at the END of the file:
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

**File 2: `Backend/apps/messaging/views.py`**

In the `MessageListView.get()` method, add `other_user_id` to the response:

```python
return Response({
    'messages': serializer.data,
    'other_name': other_name,
    'other_user_id': other_user.id,  # Add this line
    'internship_title': assignment.internship.title
})
```

## Run It

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

## Test It

1. Open two browser windows
2. Login as different users
3. Start a chat
4. Click call button
5. Accept in other window
6. **You can now see and hear each other!** 🎉

## That's It!

The WebSocket error will be gone and calling will work.

For detailed troubleshooting, see `SETUP_BACKEND_WEBSOCKET.md`
