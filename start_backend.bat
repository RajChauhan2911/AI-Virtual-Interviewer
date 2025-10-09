@echo off
echo 🚀 Starting AI Resume Analyzer Backend...
echo ========================================
echo.
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
