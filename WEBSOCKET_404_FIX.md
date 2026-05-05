# 🔧 WebSocket 404 Error - Troubleshooting

## 🎯 Current Status

**Problem:** WebSocket connection returns HTTP 404
**Error:** `server rejected WebSocket connection: HTTP 404`

## ✅ What's Working

1. ✅ ASGI server is running on port 8000
2. ✅ HTTP endpoints work (tested `/api/auth/login/`)
3. ✅ ASGI configuration is correct (ProtocolTypeRouter with websocket)
4. ✅ WebSocket routing is defined (`ws/call/$`)
5. ✅ Middleware is updated to use Django Token authentication

## ❌ What's Not Working

- WebSocket connections to `ws://localhost:8000/ws/call/` return 404
- No connection attempts appear in Daphne logs

## 🔍 Possible Causes

### 1. Daphne Not Loading ASGI Application
Daphne might not be loading the ASGI application with WebSocket support.

### 2. Path Mismatch
The WebSocket path might not be matching the routing pattern.

### 3. Missing Dependency
Some required package might be missing.

## 🚀 Next Steps to Try

### Option 1: Use Django's runserver with --noreload
Django's development server has built-in ASGI support:

```bash
cd Backend
python manage.py runserver 0.0.0.0:8000 --noreload
```

### Option 2: Check if channels is properly installed
```bash
pip show channels
pip show daphne
```

### Option 3: Try a different WebSocket path
Update the routing to use a simpler pattern:

```python
# Backend/apps/messaging/routing.py
websocket_urlpatterns = [
    path('ws/call/', consumers.CallConsumer.as_asgi()),
]
```

### Option 4: Add logging to the consumer
Add print statements to see if the consumer is being called:

```python
# Backend/apps/messaging/consumers.py
async def connect(self):
    print("🔌 WebSocket connect() called!")
    # ... rest of code
```

## 📝 Manual Test

**For the user to try:**

1. **Hard refresh browser:** Ctrl+Shift+R

2. **Go to Messages page:** `http://localhost:5173/student/messages`

3. **Open browser console (F12)** and look for:
   - Does it try to connect to WebSocket?
   - What error do you see?

4. **Share the console output** so I can see exactly what's happening

## 🎯 Temporary Workaround

Until we fix the WebSocket issue, the call buttons will stay grayed out because they require WebSocket connection.

**What you can test:**
- ✅ Login/logout
- ✅ Messages (text chat)
- ✅ File uploads
- ❌ Video/audio calls (requires WebSocket)

---

**Status:** Investigating WebSocket 404 error
**Next:** Need to see browser console output from user
