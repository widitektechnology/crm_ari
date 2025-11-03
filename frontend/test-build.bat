@echo off
echo ========================================
echo  CRM System - Servidor Local de Prueba
echo ========================================
echo.
echo Iniciando servidor en puerto 8080...
echo URL: http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

cd build
npx serve -s . -l 8080