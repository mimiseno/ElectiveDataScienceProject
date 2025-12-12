@echo off
REM ================================================================
REM SETUP SCRIPT - ANALYTIX E-COMMERCE DASHBOARD
REM ================================================================
REM Automated setup for team members cloning the repository
REM ================================================================

echo.
echo ================================================================
echo ANALYTIX - SETUP WIZARD
echo ================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from: https://www.python.org/
    pause
    exit /b 1
)

echo [1/6] Checking prerequisites...
node --version
python --version
echo.

REM Setup root dependencies
echo [2/6] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)
echo.

REM Setup frontend
echo [3/6] Installing frontend dependencies...
cd frontend
if not exist .env.local (
    echo [SETUP] Creating frontend/.env.local from template...
    copy .env.local.example .env.local
    echo.
    echo ================================================================
    echo ACTION REQUIRED: Configure Frontend Environment Variables
    echo ================================================================
    echo Please edit frontend\.env.local and add your Supabase credentials:
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo.
    echo Get these from: Supabase Dashboard -^> Project Settings -^> API
    echo ================================================================
    echo.
    pause
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..
echo.

REM Setup backend
echo [4/6] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo.

REM Check environment variables
echo [5/6] Verifying configuration...
if not exist frontend\.env.local (
    echo [WARNING] frontend\.env.local not configured!
    echo Please setup Supabase credentials before starting the app.
    echo.
)
echo.

REM Setup complete
echo [6/6] Setup complete!
echo.
echo ================================================================
echo NEXT STEPS
echo ================================================================
echo 1. Configure frontend\.env.local with Supabase credentials
echo 2. Run database schema in Supabase SQL Editor:
echo    File: supabase_schema.sql
echo 3. Start the application:
echo    npm run both
echo.
echo For detailed instructions, see QUICKSTART.md
echo ================================================================
echo.
pause
