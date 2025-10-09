@echo off
echo ============================================
echo Starting Resume Analyzer Backend
echo ============================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with your OPENAI_API_KEY
    pause
    exit /b 1
)

echo [1/3] Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo [2/3] Loading environment variables from .env...
type .env
echo.

echo [3/3] Starting backend server on http://localhost:8000
echo.
echo NOTE: Firebase credentials may cause warnings but the resume analyzer should still work
echo       if you have your OpenAI API key configured.
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
