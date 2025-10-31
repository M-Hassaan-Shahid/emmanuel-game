@echo off
echo ========================================
echo   RESTARTING ADMIN BOT
echo ========================================
echo.
echo Stopping any running admin bot processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Admin Bot*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Admin Bot with new code...
echo.
start "Admin Bot" cmd /k "node bot/adminBot.js"

echo.
echo ========================================
echo   Admin Bot Restarted!
echo ========================================
echo.
echo The bot is now running with:
echo   - Currency: Telegram Stars (⭐)
echo   - Version: 2.0.0
echo.
echo Test with: /version command in Telegram
echo.
pause
