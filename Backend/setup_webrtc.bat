@echo off
REM WebRTC Setup Script for Backend (Windows)

echo =========================================
echo WebRTC Real-Time Calling Setup
echo =========================================
echo.

REM Install required packages
echo Installing Django Channels and Redis support...
pip install channels channels-redis daphne

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Install Redis:
echo    choco install redis-64
echo    (Or download from: https://github.com/microsoftarchive/redis/releases)
echo.
echo 2. Start Redis:
echo    redis-server
echo.
echo 3. Run Django with Daphne:
echo    daphne -b 0.0.0.0 -p 8000 internship_system.asgi:application
echo.
echo 4. Update settings.py with CHANNEL_LAYERS configuration
echo    (See WEBRTC_INTEGRATION_GUIDE.md for details)
echo.
echo =========================================
pause
