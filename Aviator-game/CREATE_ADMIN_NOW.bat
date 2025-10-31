@echo off
echo ========================================
echo Creating Admin User
echo ========================================
echo.
echo Admin Credentials:
echo Email: admin@aviator.com
echo Password: 1234
echo.
echo Make sure MongoDB is running!
echo.
pause

cd backend
node createAdmin.js
pause
