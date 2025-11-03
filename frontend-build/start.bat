@echo off
REM Script de inicio para el CRM System en Windows

echo 🚀 Iniciando CRM System...
echo 📅 Fecha: %date% %time%
echo 🌐 Puerto: %PORT%
if "%PORT%"=="" echo 🌐 Puerto: 3000 (por defecto)
echo 🔗 API Backend: %NEXT_PUBLIC_API_URL%

REM Verificar que existe Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar dependencias
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install --production
)

REM Iniciar servidor
echo ✅ Iniciando servidor Next.js...
node server.js