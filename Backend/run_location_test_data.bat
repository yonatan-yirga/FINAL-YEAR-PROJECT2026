@echo off
echo ========================================
echo Creating Location-Based Test Data
echo ========================================
echo.

REM Activate virtual environment if it exists
if exist "..\\.venv\\Scripts\\activate.bat" (
    echo Activating virtual environment...
    call "..\\.venv\\Scripts\\activate.bat"
)

REM Run the test data script
echo Running test data creation script...
python create_location_test_data.py

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Press any key to exit...
pause > nul
