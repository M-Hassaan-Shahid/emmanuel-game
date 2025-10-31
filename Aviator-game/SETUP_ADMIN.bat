@echo off
cls
echo ========================================
echo Admin Setup Wizard
echo ========================================
echo.
echo This will:
echo 1. Check if admin exists
echo 2. Create admin if needed
echo.
echo Make sure MongoDB is running!
echo.
pause

echo.
echo Step 1: Checking for existing admin...
echo.
cd backend
node checkAdmin.js

echo.
echo ========================================
echo.
set /p create="Do you want to create a new admin? (Y/N): "

if /i "%create%"=="Y" (
    echo.
    echo Creating admin user...
    echo.
    node createAdmin.js
    echo.
    echo ========================================
    echo.
    echo Admin created! You can now login with:
    echo Email: admin@aviator.com
    echo Password: 1234
    echo.
) else (
    echo.
    echo Skipping admin creation.
    echo.
)

cd ..
pause
