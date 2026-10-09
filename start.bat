@echo off
title ORBITLY Launcher
echo ====================================================
echo 🛰️  ORBITLY — Space Intelligence Platform
echo ====================================================

echo Starting Backend on http://localhost:8000 ...
start "ORBITLY Backend" cmd /k "cd backend && set PYTHONUTF8=1 && python main.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "ORBITLY Frontend" cmd /k "cd frontend && npm run dev"

echo ====================================================
echo ✅ Both servers launched in separate windows!
echo 👉 Open: http://localhost:5173
echo ====================================================
