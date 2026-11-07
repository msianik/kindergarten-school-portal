@echo off
chcp 65001 > nul
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0sync-to-github.ps1"
echo.
pause
