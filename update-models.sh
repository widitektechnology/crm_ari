#!/bin/bash

# Script para actualizar los archivos de modelos corregidos en el servidor

echo "📤 Subiendo archivos corregidos al servidor..."

# Subir archivo de modelos principal
scp backend/src/database/models.py root@185.253.25.29:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/database/

# Subir archivo de modelos de infraestructura
scp backend/src/infrastructure/database/models.py root@185.253.25.29:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/infrastructure/database/

echo "✅ Archivos subidos correctamente"

echo "🔄 Reconstruyendo imagen Docker..."

# Conectar al servidor y reconstruir la imagen
ssh root@185.253.25.29 "cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && docker-compose -f docker-compose.external-db.yml build --no-cache"

echo "🚀 Iniciando contenedor..."

# Iniciar el contenedor
ssh root@185.253.25.29 "cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && docker-compose -f docker-compose.external-db.yml up -d"

echo "📋 Verificando logs..."

# Mostrar logs del contenedor
ssh root@185.253.25.29 "cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && docker logs crm_ari_backend"

echo "✅ Proceso completado"