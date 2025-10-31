@echo off
echo ========================================
echo Restarting All Services
echo ========================================
echo.
echo This will restart:
echo - Backend (port 8000)
echo - Frontend (port 3000)
echo.
echo Make sure MongoDB is running!
echo.
pause

echo.
echo Step 1: Killing existing processes...
echo.

REM Kill processes on port 8000 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill processes on port 3000 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

echo Processes killed!
echo.
echo Step 2: Starting Backend...
echo.

start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 5 /nobreak >nul

echo.
echo Step 3: Starting Frontend...
echo.

start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the new terminal windows for logs.
echo.
pause
