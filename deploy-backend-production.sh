#!/bin/bash

# Script para actualizar backend de producción con endpoints de correo
echo "🚀 Actualizando Backend de Producción con Endpoints de Correo..."

# Configuración del servidor
SERVER_HOST="root@ns31792975"
SERVER_PATH="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend"
LOCAL_BACKEND_PATH="./backend"

echo "📁 Directorio local: $(pwd)"
echo "🌐 Servidor: $SERVER_HOST"
echo "📂 Ruta remota: $SERVER_PATH"

# Verificar que estamos en el directorio correcto
if [ ! -d "$LOCAL_BACKEND_PATH" ]; then
    echo "❌ Error: No se encuentra el directorio backend/"
    echo "   Ejecuta este script desde la raíz del proyecto crm_ari"
    exit 1
fi

# Crear backup del backend actual en el servidor
echo "💾 Creando backup del backend actual..."
ssh $SERVER_HOST "cd $SERVER_PATH && tar -czf backup_backend_$(date +%Y%m%d_%H%M%S).tar.gz src/ requirements.txt Dockerfile* update-backend.sh || true"

# Subir archivos actualizados al servidor
echo "📤 Subiendo archivos actualizados..."

# Subir main.py actualizado con endpoints de correo
scp "$LOCAL_BACKEND_PATH/src/api/main.py" "$SERVER_HOST:$SERVER_PATH/src/api/"

# Subir router de correo
scp "$LOCAL_BACKEND_PATH/src/api/routers/mail.py" "$SERVER_HOST:$SERVER_PATH/src/api/routers/"

# Subir __init__.py actualizado de routers
scp "$LOCAL_BACKEND_PATH/src/api/routers/__init__.py" "$SERVER_HOST:$SERVER_PATH/src/api/routers/"

# Ejecutar el script de actualización en el servidor
echo "🔄 Ejecutando actualización en el servidor..."
ssh $SERVER_HOST "cd $SERVER_PATH && chmod +x update-backend.sh && ./update-backend.sh"

# Verificar que el servicio esté funcionando
echo "🧪 Verificando endpoints..."
sleep 5

# Probar health check general
echo "✅ Probando /api/health..."
curl -s "https://crm.arifamilyassets.com/api/health" | jq '.' || echo "❌ Error en health check"

# Probar health check de correo
echo "✅ Probando /api/mail/health..."
curl -s "https://crm.arifamilyassets.com/api/mail/health" | jq '.' || echo "❌ Error en mail health check"

echo "✅ ¡Actualización de backend completada!"
echo "🌐 Endpoints disponibles:"
echo "   - https://crm.arifamilyassets.com/api/health"
echo "   - https://crm.arifamilyassets.com/api/mail/health"
echo "   - https://crm.arifamilyassets.com/api/mail/test-connection"
echo "   - https://crm.arifamilyassets.com/docs (documentación)"