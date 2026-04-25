@echo off
chcp 65001 >nul
title Love Diary
cd /d "%~dp0"

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"

if errorlevel 1 (
    echo.
    echo [!] Script ended with error
    pause
)
