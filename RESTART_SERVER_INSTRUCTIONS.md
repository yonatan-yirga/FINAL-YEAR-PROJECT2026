# ⚠️ IMPORTANT: Restart Server with ASGI Support

## You Must Restart the Backend Server!

The WebSocket/video calling feature requires running Django with **ASGI support** (not regular WSGI).

## Steps to Restart

### 1. Stop Current Server
In the terminal where Django is running, press:
```
Ctrl + C
```

### 2. Start with ASGI Support

**On Windows:**
```bash
cd Backend
run_asgi_server.bat
```

**On Linux/Mac:**
```bash
cd Backend
chmod +x run_asgi_server.sh
./run_asgi_server.sh
```

**Alternative (any platform):**
```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

### 3. Verify It's Working

You should see:
```
Starting Django ASGI server with WebSocket support...
Server will run on: http://localhost:8000
WebSocket endpoint: ws://localhost:8000/ws/call/
```

### 4. Test in Browser

1. Refresh your frontend (F5)
2. Check browser console
3. You should see: `WebSocket connected` (no errors!)
4. Try making a video call

## What Changed?

| Before | After |
|--------|-------|
| `python manage.py runserver` | `daphne config.asgi:application` |
| HTTP only (WSGI) | HTTP + WebSocket (ASGI) |
| ❌ WebSocket errors | ✅ WebSocket works |
| ❌ Video calling broken | ✅ Video calling works |

## Troubleshooting

### "daphne: command not found"
```bash
cd Backend
pip install -r requirements.txt
```

### Port 8000 already in use
```bash
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Still seeing WebSocket errors
1. Make sure you stopped the old server completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh the page (F5)
4. Check that token exists in localStorage

---

## ✅ Once Restarted

The video/audio calling feature will work perfectly! No more WebSocket errors. 🎉
