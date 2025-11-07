#!/bin/bash

# 🚀 SCRIPT FIX COMPLETO - CRM ARI Docker Environment
# Este script arregla el problema de variables de entorno de una vez por todas

echo "🔄 Iniciando fix completo de variables de entorno..."

# 1. Detener contenedor actual
echo "⏹️  Deteniendo contenedor actual..."
docker-compose -f docker-compose.external-db.yml down

# 2. Crear archivo .env correcto
echo "📝 Creando archivo .env correcto..."
cat > .env << 'EOF'
# Base de datos - Docker configuration
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# JWT Configuration
JWT_SECRET_KEY=crm_super_secret_key_2025_secure
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Configuration
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=production

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://crm.arifamilyassets.com
EOF

# 3. Verificar archivo .env
echo "✅ Archivo .env creado:"
ls -la .env
echo "📋 Contenido del .env:"
cat .env

# 4. Limpiar Docker
echo "🧹 Limpiando sistema Docker..."
docker system prune -f

# 5. Reconstruir imagen sin cache
echo "🔨 Reconstruyendo imagen Docker sin cache..."
docker-compose -f docker-compose.external-db.yml build --no-cache

# 6. Iniciar contenedor
echo "🚀 Iniciando contenedor..."
docker-compose -f docker-compose.external-db.yml up -d

# 7. Esperar un momento para que inicie
echo "⏳ Esperando inicio del contenedor..."
sleep 5

# 8. Verificar variables de entorno
echo "🔍 Verificando variables de entorno en el contenedor:"
docker exec crm_ari_backend env | grep DB_ | head -5

# 9. Mostrar logs
echo "📋 Mostrando logs del contenedor:"
docker-compose -f docker-compose.external-db.yml logs --tail=20

echo ""
echo "✅ ¡Fix completo! El contenedor debería estar funcionando ahora."
echo "🌐 API disponible en: http://localhost:8000"
echo "📚 Documentación: http://localhost:8000/docs"
echo ""
echo "Para ver logs en tiempo real:"
echo "docker-compose -f docker-compose.external-db.yml logs -f"