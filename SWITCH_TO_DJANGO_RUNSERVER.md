# 🔧 Switch to Django Runserver for WebSocket

## 🎯 Problem

Daphne is returning 404 for WebSocket connections, even though the configuration is correct.

## ✅ Solution

Use Django's built-in development server which has ASGI support.

## 🚀 Steps

### 1. Stop Daphne Server

The Daphne server is currently running. We need to stop it.

### 2. Start Django Runserver

```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

This will start Django's development server with ASGI support for WebSockets.

### 3. Test WebSocket Connection

After starting the server, test the WebSocket connection:

```bash
python Backend/test_websocket.py
```

### 4. Test in Browser

1. Hard refresh browser (Ctrl+Shift+R)
2. Go to Messages page
3. Check console for WebSocket connection

## 📝 Why This Might Work

Django's `runserver` command has built-in support for ASGI and WebSockets when `channels` is installed. It might handle the WebSocket routing better than Daphne in development mode.

## 🎯 Expected Result

WebSocket should connect successfully and you should see:
```
✅ WebSocket connected successfully!
✅ WebRTC is now ready for calls!
```

---

**Status:** Ready to try Django runserver
**Action:** Stop Daphne and start Django runserver
