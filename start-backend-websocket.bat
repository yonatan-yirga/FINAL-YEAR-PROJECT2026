@echo off
echo ========================================
echo Starting Django Backend with WebSocket Support
echo ========================================
echo.
echo Make sure Redis is running in another terminal!
echo If not, open a new terminal and run: redis-server
echo.
echo Press any key to start Django with Daphne...
pause > nul

cd Backend
echo.
echo Starting Daphne ASGI server...
daphne -b 0.0.0.0 -p 8000 config.asgi:application
