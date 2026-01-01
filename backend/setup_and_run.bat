@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo   Document Intelligence Backend Setup & Run
echo ===================================================

cd /d "%~dp0"

:: 1. Check for Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not found in your PATH.
    echo Please install Python 3.8+ and add it to your PATH.
    pause
    exit /b 1
)

:: 2. Create Virtual Env if not exists
IF NOT EXIST "venv" (
    echo [INFO] Creating virtual environment 'venv'...
    python -m venv venv
    IF %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
) ELSE (
    echo [INFO] Virtual environment found.
)

:: 3. Activate Virtual Env
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

:: 4. Upgrade pip (optional but good)
python -m pip install --upgrade pip >nul 2>&1

:: 5. Install Requirements
echo [INFO] Installing/Updating dependencies...
pip install -r requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    echo Please check the error messages above.
    pause
    exit /b 1
)

:: 6. Run Server
echo.
echo [SUCCESS] Setup complete. Starting server...
echo ---------------------------------------------------
echo API Documentation: http://localhost:8000/docs
echo ---------------------------------------------------
echo.

uvicorn main:app --reload

pause
