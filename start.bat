@echo off
title Alvarez Catalunya — Dev Server
cd /d "%~dp0"
echo Starting Alvarez Catalunya...
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
pnpm dev
pause
