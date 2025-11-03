@echo off
echo ========================================
echo  CRM System - Servidor Local Python
echo ========================================
echo.
echo Iniciando servidor en puerto 8080...
echo URL: http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

cd build
python -m http.server 8080