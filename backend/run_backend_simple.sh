#!/bin/bash

# Script para ejecutar el backend CRM en Docker sin problemas de volúmenes

echo "🐳 Ejecutando contenedor CRM Backend..."

# Limpiar contenedores anteriores si existen
echo "Limpiando contenedores anteriores..."
docker stop crm_ari_backend 2>/dev/null || true
docker rm crm_ari_backend 2>/dev/null || true

# Ejecutar contenedor
echo "Iniciando contenedor..."
docker run -d \
  --name crm_ari_backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --network bridge \
  --add-host host.docker.internal:host-gateway \
  -e ENVIRONMENT=production \
  -e DB_HOST=172.17.0.1 \
  -e DB_PORT=3306 \
  -e DB_USERNAME=crm_user \
  -e DB_PASSWORD=crm_password_secure_2025 \
  -e DB_DATABASE=crm_ari \
  -e DB_CHARSET=utf8mb4 \
  -e SECRET_KEY=crm-ari-super-secret-key-2025-production-ready \
  -e JWT_SECRET_KEY=crm_ari_jwt_secret_key_2025_change_in_production \
  -e JWT_ALGORITHM=HS256 \
  -e JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480 \
  -e BCRYPT_ROUNDS=12 \
  -e APP_NAME="CRM ARI Family Assets" \
  -e APP_VERSION=2.0.0 \
  -e DEBUG=false \
  -e CORS_ORIGINS="https://crm.arifamilyassets.com,http://localhost:3000" \
  backend_backend:latest

# Verificar que se ejecutó correctamente
sleep 3
if docker ps | grep -q crm_ari_backend; then
  echo "✅ Contenedor ejecutándose correctamente"
  echo "🌐 API disponible en: http://localhost:8000"
  echo "📚 Documentación en: http://localhost:8000/docs"
  echo "💓 Health check: http://localhost:8000/health"
  
  echo ""
  echo "📊 Ver logs del contenedor:"
  echo "docker logs -f crm_ari_backend"
  
  echo ""
  echo "🔍 Verificar estado:"
  echo "docker ps | grep crm_ari_backend"
else
  echo "❌ Error: El contenedor no se ejecutó correctamente"
  echo "Ver logs: docker logs crm_ari_backend"
fi