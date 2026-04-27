@echo off
REM Deployment Preparation Script for Windows
REM Run this before deploying to Render.com

echo.
echo ========================================================
echo   Internship Management System - Deployment Preparation
echo ========================================================
echo.

REM Check if we're in the right directory
if not exist "Backend" (
    echo Error: Backend folder not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "Frontend" (
    echo Error: Frontend folder not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Preparing Backend...
cd Backend

echo    Installing production packages...
pip install dj-database-url gunicorn whitenoise psycopg2-binary

echo    Generating requirements.txt...
pip freeze > requirements.txt

echo Backend prepared!
echo.

cd ..

echo Step 2: Preparing Frontend...
cd Frontend

echo    Installing npm packages...
call npm install

echo Frontend prepared!
echo.

cd ..

echo Step 3: Checking Git...
if exist ".git" (
    echo Git repository already initialized
) else (
    echo    Initializing Git repository...
    git init
    echo Git initialized
)

echo.
echo ========================================================
echo   Preparation Complete!
echo ========================================================
echo.
echo Next Steps:
echo.
echo 1. Commit your changes:
echo    git add .
echo    git commit -m "Ready for deployment"
echo.
echo 2. Create a GitHub repository at: https://github.com/new
echo.
echo 3. Push to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Follow the steps in QUICK_DEPLOY_STEPS.md
echo.
echo Deployment Guide: See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
