@echo off
echo ========================================
echo Starting Aviator Game Backend Server
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create a .env file with the following content:
    echo.
    echo PORT=8000
    echo MONGODB_URI=mongodb://localhost:27017/aviator-game
    echo JWT_SECRET=your-secret-key
    echo.
    echo Copy .env.example to .env and update the values.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
echo Backend will run on: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

node index.js
