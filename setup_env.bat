@echo off
echo ========================================
echo Resume Analyzer - Environment Setup
echo ========================================
echo.

REM Check if .env file exists
if exist .env (
    echo .env file already exists!
    echo.
    set /p OVERWRITE="Do you want to overwrite it? (y/n): "
    if /i not "%OVERWRITE%"=="y" (
        echo Setup cancelled.
        pause
        exit /b
    )
)

echo.
echo Please enter your configuration details:
echo.

REM Create .env file
echo # CORS Configuration> .env
echo CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173>> .env
echo.>> .env
echo # Firebase Admin SDK>> .env
echo # Place your Firebase Admin SDK JSON credentials in the project root>> .env
echo # GOOGLE_APPLICATION_CREDENTIALS=path/to/your/firebase-admin-sdk.json>> .env

echo.
echo ========================================
echo .env file created successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Place your Firebase Admin SDK JSON in the project root
echo 2. Run: pip install -r requirements.txt
echo 3. Run: python -m uvicorn main:app --reload
echo.
echo For frontend setup:
echo 1. cd interviewer
echo 2. Create .env with Firebase client config
echo 3. npm install
echo 4. npm run dev
echo.
pause
