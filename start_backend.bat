@echo off
echo ================================================
echo   Starting Backend Server
echo ================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found!
    echo The server may not work properly without environment variables.
    echo Run setup_env.bat to create .env file.
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
)

echo [1/2] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python 3.8+
    pause
    exit /b 1
)
python --version
echo.

echo [2/2] Starting backend server on http://localhost:8000
echo.
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo NOTE: Firebase credentials may cause warnings but the server should still work
echo       if you have your OpenAI API key configured in .env
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

echo.
echo Backend server stopped.
pause
