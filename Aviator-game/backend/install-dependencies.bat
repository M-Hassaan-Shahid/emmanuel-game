@echo off
echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.
echo This will install all required packages including bcryptjs
echo.
pause

echo.
echo Installing dependencies...
echo.
npm install

echo.
echo ========================================
echo.
echo Verifying bcryptjs installation...
echo.

if exist "node_modules\bcryptjs" (
    echo ✅ bcryptjs is installed!
) else (
    echo ❌ bcryptjs not found, installing separately...
    npm install bcryptjs
)

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
pause
