@echo off
echo ========================================
echo Starting All Telegram Bots
echo ========================================
echo.

echo Starting Admin Bot...
start "Admin Bot" cmd /k "node bot/adminBot.js"
timeout /t 2 /nobreak >nul

echo Starting Stars Bot...
start "Stars Bot" cmd /k "node bot/telegramStarsBot.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All bots started!
echo ========================================
echo.
echo Check the opened windows for bot status
echo Press any key to exit...
pause >nul
