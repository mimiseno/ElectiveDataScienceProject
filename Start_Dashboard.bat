@echo off
REM E-commerce Analytics Dashboard Launcher
REM This script starts the Flask API server and opens the dashboard

echo ========================================
echo  E-commerce Analytics Dashboard
echo ========================================
echo.
echo Starting Flask API Server...
echo.

cd backend
start cmd /k "python api.py"

timeout /t 3 /nobreak >nul

echo.
echo Opening Dashboard in Browser...
echo.

cd ..
start "" "frontend\dashboard.html"

echo.
echo ========================================
echo  Dashboard is now running!
echo ========================================
echo.
echo - API Server: http://localhost:5000
echo - Dashboard: Open in your browser
echo.
echo To stop the server, close the API window
echo.
pause
