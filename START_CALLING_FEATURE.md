# Start Real-Time Calling Feature

## ✅ What I've Done For You

1. ✅ Installed Django Channels, channels-redis, and daphne
2. ✅ Added 'channels' to INSTALLED_APPS in settings.py
3. ✅ Added ASGI_APPLICATION and CHANNEL_LAYERS configuration
4. ✅ Created Backend/config/asgi.py file
5. ✅ Updated messaging views to return other_user_id
6. ✅ Created WebSocket consumer (Backend/apps/messaging/consumers.py)
7. ✅ Created WebSocket routing (Backend/apps/messaging/routing.py)

## ⚠️ What You Need To Do

### Step 1: Install Redis (One Time Only)

**Option A - Using Chocolatey (Recommended):**
```bash
choco install redis-64
```

**Option B - Manual Download:**
1. Go to: https://github.com/microsoftarchive/redis/releases
2. Download: Redis-x64-3.0.504.msi
3. Install it

**Option C - Using WSL (Windows Subsystem for Linux):**
```bash
wsl --install
# After WSL is installed:
wsl
sudo apt-get update
sudo apt-get install redis-server
```

### Step 2: Start Redis

Open a **NEW terminal** and run:
```bash
redis-server
```

You should see:
```
[####] Server started, Redis version 3.0.504
[####] The server is now ready to accept connections on port 6379
```

**Keep this terminal running!**

### Step 3: Start Django with Daphne

Open **ANOTHER new terminal** and run:
```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

You should see:
```
INFO     Starting server at tcp:port=8000:interface=0.0.0.0
INFO     Listening on TCP address 0.0.0.0:8000
```

**Keep this terminal running!**

### Step 4: Start Frontend (If Not Running)

Open **ANOTHER new terminal** and run:
```bash
cd Frontend
npm run dev
```

**Keep this terminal running!**

## Testing

1. Open browser and go to your app
2. Login as a user
3. Open chat with another user
4. Click the video call button
5. Open another browser window (incognito mode)
6. Login as the other user
7. You should see "Incoming call..." notification
8. Click Accept
9. **Both users can now see and hear each other!**

## Troubleshooting

### "redis-server: command not found"
- Redis is not installed. Follow Step 1 above.

### "WebSocket connection failed"
- Make sure Redis is running (Step 2)
- Make sure Django is running with Daphne (Step 3)
- Check the terminal for error messages

### "Could not access camera/microphone"
- Click "Allow" when browser asks
- Check browser settings for permissions
- Try Chrome or Edge browser

## Quick Check

Run these commands to verify everything is set up:

```bash
# Check if Redis is installed
redis-cli --version

# Check if Daphne is installed
daphne --version

# Check if channels is installed
python -c "import channels; print(channels.__version__)"
```

All should return version numbers without errors.

## Summary

**You have 3 terminals running:**
1. Terminal 1: `redis-server`
2. Terminal 2: `cd Backend && daphne -b 0.0.0.0 -p 8000 config.asgi:application`
3. Terminal 3: `cd Frontend && npm run dev`

**Then test the calling feature in your browser!**

The calling feature is now fully configured and ready to work once you start Redis! 🚀
