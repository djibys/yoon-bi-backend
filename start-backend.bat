@echo off
echo ========================================
echo   DEMARRAGE BACKEND YOON-BI
echo ========================================
echo.

echo Verification des dependances...
if not exist "node_modules\multer" (
    echo [INFO] Installation de multer...
    npm install
    echo.
)

echo Verification de MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB est en cours d'execution
) else (
    echo [INFO] Demarrage de MongoDB...
    net start MongoDB 2>NUL
    if errorlevel 1 (
        echo [ATTENTION] MongoDB n'est pas demarre. Veuillez le demarrer manuellement.
        pause
    )
)

echo.
echo Demarrage du serveur Node.js...
echo.
npm run dev

pause
