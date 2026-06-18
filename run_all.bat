@echo off
rem Wrapper para executar o script PowerShell de setup e testes
rem Uso: run_all.bat         -> executa setup_all.ps1
rem      run_all.bat docker  -> executa setup_all.ps1 -UseDocker

set SCRIPT_DIR=%~dp0

if "%1"=="docker" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%SCRIPT_DIR%setup_all.ps1' -UseDocker"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%SCRIPT_DIR%setup_all.ps1'"
)

pause
