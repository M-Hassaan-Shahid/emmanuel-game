@echo off
echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

echo Step 1: Killing existing backend process...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a 2>nul
)
echo Backend process killed!

echo.
echo Step 2: Starting backend...
echo.

npm start
