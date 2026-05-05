@echo off
REM Run Django with ASGI support for WebSocket connections
REM This enables real-time video/audio calling features

echo Starting Django ASGI server with WebSocket support...
echo.
echo Server will run on: http://localhost:8000
echo WebSocket endpoint: ws://localhost:8000/ws/call/
echo.
echo Press Ctrl+C to stop the server
echo.

daphne -b 0.0.0.0 -p 8000 config.asgi:application
