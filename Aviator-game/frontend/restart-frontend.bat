@echo off
echo ========================================
echo Restarting Frontend with New Environment
echo ========================================
echo.
echo Step 1: Clearing React cache...
rmdir /s /q node_modules\.cache 2>nul
echo Cache cleared!
echo.
echo Step 2: Starting frontend...
echo.
npm start
