@echo off
echo ===============================================
echo   AI Interviewer - Starting Application
echo ===============================================
echo.

echo Starting backend server...
start "Backend Server" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd interviewer && npm run dev"

echo.
echo ===============================================
echo   Application Started Successfully!
echo ===============================================
echo.
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
pause >nul
