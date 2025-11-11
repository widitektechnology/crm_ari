# 🚀 REBUILD FRONTEND CON CORRECCIONES HTTPS (PowerShell)

Write-Host "🔧 RECONSTRUYENDO FRONTEND CON CORRECCIONES HTTPS..." -ForegroundColor Cyan

Set-Location frontend

Write-Host ""
Write-Host "📋 1. Instalando dependencias..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "⚙️ 2. Construyendo para producción con HTTPS..." -ForegroundColor Yellow
$env:VITE_API_BASE_URL = "https://crm.arifamilyassets.com"
npm run build

Write-Host ""
Write-Host "📦 3. Verificando build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "✅ Build creado en frontend/dist/" -ForegroundColor Green
    Write-Host "📁 Contenido:" -ForegroundColor Blue
    Get-ChildItem dist/ | Format-Table
} else {
    Write-Host "❌ Error: No se pudo crear el build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗜️ 4. Comprimiendo build para deploy..." -ForegroundColor Yellow
Compress-Archive -Path "dist\*" -DestinationPath "crm-build-https-fix.zip" -Force

Write-Host ""
Write-Host "📊 5. Información del archivo:" -ForegroundColor Yellow
Get-ChildItem crm-build-https-fix.zip | Format-List

Write-Host ""
Write-Host "✅ FRONTEND REBUILDEADO CON CORRECCIONES HTTPS" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Subir crm-build-https-fix.zip al servidor"
Write-Host "2. Extraer en /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/"
Write-Host "3. Verificar que las URLs usen HTTPS"
Write-Host ""
Write-Host "🌐 Comando de deploy sugerido:" -ForegroundColor Cyan
Write-Host 'scp frontend/crm-build-https-fix.zip root@57.129.144.154:/tmp/'
Write-Host 'ssh root@57.129.144.154 "cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ && rm -rf * && unzip /tmp/crm-build-https-fix.zip && chown -R psaadm:psaadm . && chmod -R 755 ."'

Set-Location ..