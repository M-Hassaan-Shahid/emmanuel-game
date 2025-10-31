@echo off
title Aviator Frontend Server
color 0B
echo.
echo ========================================
echo   STARTING AVIATOR FRONTEND SERVER
echo ========================================
echo.
cd aviatorGameWeb
echo Starting Vite development server...
echo.
echo Frontend will be available at:
echo http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
npm run dev
pause
