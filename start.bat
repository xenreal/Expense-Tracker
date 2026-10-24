@echo off
title Expense Tracker Launcher
echo ===================================================
echo    Starting Expense Tracker (FastAPI + Vite React)
echo ===================================================
echo.

:: 1. Launch FastAPI Backend in a separate window
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "Expense Tracker - Backend" cmd /k "cd /d "%~dp0Backend" && call venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: 2. Launch Vite React Frontend in a separate window
echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
start "Expense Tracker - Frontend" cmd /k "cd /d "%~dp0Frontend" && npm run dev"

echo.
echo ===================================================
echo Both servers are launching in separate windows!
echo.
echo   * Backend API:  http://127.0.0.1:8000
echo   * API Docs:     http://127.0.0.1:8000/docs
echo   * Web App:      http://localhost:5173
echo ===================================================
echo You can close this launcher window anytime.
pause

