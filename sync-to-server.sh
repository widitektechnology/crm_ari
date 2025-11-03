#!/bin/bash

# Script para sincronizar archivos actualizados al servidor
echo "📁 Sincronizando archivos al servidor..."

# Copiar requirements optimizado
echo "📦 Copiando requirements-prod.txt..."
cp backend/requirements-prod.txt /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/ 2>/dev/null || echo "Usar desde directorio local"

# Copiar script de despliegue optimizado
echo "🚀 Copiando deploy-prod.sh..."
cp deploy-prod.sh /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ 2>/dev/null || echo "Usar desde directorio local"

echo "✅ Archivos sincronizados. Ejecutar en el servidor:"
echo "   chmod +x deploy-prod.sh"
echo "   ./deploy-prod.sh"