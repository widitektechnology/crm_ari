#!/bin/bash

# 🚀 Script de Actualización Automática del Backend CRM ARI
# Uso: ./update-backend.sh

set -e  # Salir si hay errores

echo "🔄 Actualizando Backend CRM ARI..."

# Variables
CONTAINER_NAME="erp_backend_new"
IMAGE_NAME="erp_backend_fixed"
BACKUP_SUFFIX=$(date +%Y%m%d_%H%M%S)
BACKEND_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend"

# Función para mostrar logs con timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para manejar errores
error_exit() {
    log "❌ ERROR: $1"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "main.py" ]; then
    error_exit "No se encuentra main.py. Ejecuta este script desde el directorio backend."
fi

log "📁 Directorio actual: $(pwd)"

# Verificar que el router de correo existe
if [ ! -f "src/api/routers/mail.py" ]; then
    error_exit "No se encuentra el router de correo (src/api/routers/mail.py). Asegúrate de haber subido todos los archivos."
fi

# Paso 1: Hacer backup del contenedor actual
log "💾 Haciendo backup del contenedor actual..."
if docker ps -q -f name=$CONTAINER_NAME > /dev/null; then
    docker commit $CONTAINER_NAME ${IMAGE_NAME}_backup_$BACKUP_SUFFIX || log "⚠️  Warning: No se pudo hacer backup"
    log "✅ Backup creado: ${IMAGE_NAME}_backup_$BACKUP_SUFFIX"
else
    log "⚠️  Contenedor $CONTAINER_NAME no está corriendo"
fi

# Paso 2: Parar contenedor actual
log "⏹️  Parando contenedor actual..."
docker stop $CONTAINER_NAME 2>/dev/null || log "⚠️  Contenedor ya estaba parado"

# Paso 3: Eliminar contenedor (mantener imagen)
log "🗑️  Eliminando contenedor anterior..."
docker rm $CONTAINER_NAME 2>/dev/null || log "⚠️  Contenedor ya fue eliminado"

# Paso 4: Construir nueva imagen
log "🔨 Construyendo nueva imagen con endpoints de correo..."
docker build -t $IMAGE_NAME . || error_exit "Falló la construcción de la imagen"

# Paso 5: Ejecutar nuevo contenedor
log "🚀 Ejecutando nuevo contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 8000:8000 \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:8000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  $IMAGE_NAME || error_exit "Falló la ejecución del contenedor"

# Paso 6: Esperar a que el contenedor esté listo
log "⏳ Esperando a que el servicio esté listo..."
sleep 10

# Verificar que el contenedor está corriendo
if docker ps -q -f name=$CONTAINER_NAME > /dev/null; then
    log "✅ Contenedor $CONTAINER_NAME está corriendo"
else
    error_exit "El contenedor no se inició correctamente"
fi

# Paso 7: Probar endpoints
log "🧪 Probando endpoints..."

# Test health check
if curl -s -f http://localhost:8000/api/health > /dev/null; then
    log "✅ Health check: OK"
else
    log "⚠️  Health check: FAILED"
fi

# Test mail health check
if curl -s -f http://localhost:8000/api/mail/health > /dev/null; then
    log "✅ Mail health check: OK"
else
    log "⚠️  Mail health check: FAILED"
fi

# Test root endpoint
if curl -s -f http://localhost:8000/ > /dev/null; then
    log "✅ Root endpoint: OK"
else
    log "⚠️  Root endpoint: FAILED"
fi

# Paso 8: Mostrar información del contenedor
log "📊 Estado del contenedor:"
docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Paso 9: Mostrar logs recientes
log "📋 Logs recientes:"
docker logs --tail 15 $CONTAINER_NAME

# Paso 10: Mostrar información de los nuevos endpoints
log "📧 Endpoints de correo disponibles:"
echo "   GET  /api/mail/health          - Health check del sistema de correo"
echo "   POST /api/mail/test-connection - Probar conectividad IMAP/SMTP"
echo "   POST /api/mail/accounts        - Registrar cuenta de correo"
echo "   GET  /api/mail/accounts        - Listar cuentas"
echo "   POST /api/mail/send            - Enviar mensajes"

# Limpiar imágenes antiguas (opcional)
log "🧹 Limpiando imágenes no utilizadas..."
docker image prune -f > /dev/null || true

log "🎉 ¡Actualización completada exitosamente!"
log "🌐 API disponible en: http://localhost:8000"
log "📚 Documentación: http://localhost:8000/docs"
log "📧 Mail API: http://localhost:8000/api/mail/health"

echo ""
echo "🧪 Test rápido del sistema de correo:"
echo "curl -X POST http://localhost:8000/api/mail/test-connection \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"incoming\": {"
echo "      \"server\": \"imap.gmail.com\","
echo "      \"port\": 993,"
echo "      \"ssl\": true,"
echo "      \"username\": \"tu-email@gmail.com\","
echo "      \"password\": \"tu-app-password\""
echo "    },"
echo "    \"outgoing\": {"
echo "      \"server\": \"smtp.gmail.com\","
echo "      \"port\": 587,"
echo "      \"ssl\": true,"
echo "      \"username\": \"tu-email@gmail.com\","
echo "      \"password\": \"tu-app-password\""
echo "    }"
echo "  }'"

echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:     docker logs -f $CONTAINER_NAME"
echo "   Reiniciar:    docker restart $CONTAINER_NAME"
echo "   Parar:        docker stop $CONTAINER_NAME"
echo "   Estado:       docker ps --filter name=$CONTAINER_NAME"