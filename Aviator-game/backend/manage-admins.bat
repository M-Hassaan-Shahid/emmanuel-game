@echo off
:menu
cls
echo ========================================
echo Admin Management Menu
echo ========================================
echo.
echo 1. Create New Admin
echo 2. List All Admins
echo 3. Hash a Password
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto create
if "%choice%"=="2" goto list
if "%choice%"=="3" goto hash
if "%choice%"=="4" goto end

echo Invalid choice! Please try again.
pause
goto menu

:create
cls
echo Creating New Admin...
echo.
node createAdmin.js
pause
goto menu

:list
cls
echo Listing All Admins...
echo.
node listAdmins.js
pause
goto menu

:hash
cls
echo Hash Password...
echo.
node hashPassword.js
pause
goto menu

:end
echo.
echo Goodbye!
exit
