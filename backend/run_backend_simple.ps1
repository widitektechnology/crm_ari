# Script para ejecutar el backend CRM en Docker (Windows PowerShell)

Write-Host "🐳 Ejecutando contenedor CRM Backend..." -ForegroundColor Green

# Limpiar contenedores anteriores si existen
Write-Host "Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker stop crm_ari_backend 2>$null
docker rm crm_ari_backend 2>$null

# Ejecutar contenedor
Write-Host "Iniciando contenedor..." -ForegroundColor Yellow
docker run -d `
  --name crm_ari_backend `
  --restart unless-stopped `
  -p 8000:8000 `
  --network bridge `
  --add-host host.docker.internal:host-gateway `
  -e ENVIRONMENT=production `
  -e DB_HOST=172.17.0.1 `
  -e DB_PORT=3306 `
  -e DB_USERNAME=crm_user `
  -e DB_PASSWORD=crm_password_secure_2025 `
  -e DB_DATABASE=crm_ari `
  -e DB_CHARSET=utf8mb4 `
  -e SECRET_KEY=crm-ari-super-secret-key-2025-production-ready `
  -e JWT_SECRET_KEY=crm_ari_jwt_secret_key_2025_change_in_production `
  -e JWT_ALGORITHM=HS256 `
  -e JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480 `
  -e BCRYPT_ROUNDS=12 `
  -e APP_NAME="CRM ARI Family Assets" `
  -e APP_VERSION=2.0.0 `
  -e DEBUG=false `
  -e CORS_ORIGINS="https://crm.arifamilyassets.com,http://localhost:3000" `
  backend_backend:latest

# Verificar que se ejecutó correctamente
Start-Sleep -Seconds 3
$containerRunning = docker ps | Select-String "crm_ari_backend"

if ($containerRunning) {
    Write-Host "✅ Contenedor ejecutándose correctamente" -ForegroundColor Green
    Write-Host "🌐 API disponible en: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📚 Documentación en: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "💓 Health check: http://localhost:8000/health" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "📊 Ver logs del contenedor:" -ForegroundColor Blue
    Write-Host "docker logs -f crm_ari_backend" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔍 Verificar estado:" -ForegroundColor Blue
    Write-Host "docker ps | Select-String crm_ari_backend" -ForegroundColor White
} else {
    Write-Host "❌ Error: El contenedor no se ejecutó correctamente" -ForegroundColor Red
    Write-Host "Ver logs: docker logs crm_ari_backend" -ForegroundColor Yellow
}