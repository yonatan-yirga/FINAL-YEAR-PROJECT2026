@echo off
REM Automatic GitHub Setup Script for Windows
REM This script will prepare and push your code to GitHub

echo.
echo ========================================================
echo   GitHub Setup - Internship Management System
echo ========================================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Error: Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

echo Git is installed!
echo.

REM Check if already initialized
if exist ".git" (
    echo Git repository already initialized.
    echo.
) else (
    echo Initializing Git repository...
    git init
    echo Git initialized!
    echo.
)

REM Add all files
echo Adding all files to Git...
git add .
echo Files added!
echo.

REM Create commit
echo Creating commit...
git commit -m "Initial commit - Internship Management System ready for deployment"
if errorlevel 1 (
    echo Note: No changes to commit or already committed.
) else (
    echo Commit created!
)
echo.

echo ========================================================
echo   Next Steps:
echo ========================================================
echo.
echo 1. Create a GitHub repository:
echo    Go to: https://github.com/new
echo.
echo 2. Repository settings:
echo    - Name: internship-management-system
echo    - Description: Complete Internship Management System
echo    - Visibility: Public or Private
echo    - DO NOT check any boxes
echo.
echo 3. After creating the repository, run these commands:
echo    (Replace YOUR_USERNAME with your GitHub username)
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/internship-management-system.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. When prompted, enter:
echo    - Username: Your GitHub username
echo    - Password: Your Personal Access Token
echo      (Create at: https://github.com/settings/tokens)
echo.
echo ========================================================
echo.
echo For detailed instructions, see: GITHUB_SETUP_GUIDE.md
echo.
pause
