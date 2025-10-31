@echo off
title Aviator Backend Server
color 0A
echo.
echo ========================================
echo   STARTING AVIATOR BACKEND SERVER
echo ========================================
echo.
echo Checking configuration...
cd backend
node test-start.js
echo.
echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
node index.js
pause
