@echo off
chcp 65001 >nul
title Stop Love Diary
cd /d "%~dp0"

PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$conns = Get-NetTCPConnection -LocalPort 1314 -ErrorAction SilentlyContinue;" ^
  "if ($conns) {" ^
    "$conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {" ^
      "try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Host '已停止 PID ' $_ -ForegroundColor Green } catch {}" ^
    "}" ^
  "} else { Write-Host '当前没有运行中的服务' -ForegroundColor Yellow };" ^
  "Start-Sleep 2"

timeout /t 3 /nobreak >nul
