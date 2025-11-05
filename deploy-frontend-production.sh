#!/bin/bash

# Script para desplegar frontend en producción
echo "🚀 Desplegando Frontend en Producción..."

# Configuración del servidor
SERVER_HOST="root@ns31792975"
SERVER_PATH="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend"
LOCAL_FRONTEND_PATH="./frontend"

echo "📁 Directorio local: $(pwd)"
echo "🌐 Servidor: $SERVER_HOST"
echo "📂 Ruta remota: $SERVER_PATH"

# Verificar que estamos en el directorio correcto
if [ ! -d "$LOCAL_FRONTEND_PATH" ]; then
    echo "❌ Error: No se encuentra el directorio frontend/"
    echo "   Ejecuta este script desde la raíz del proyecto crm_ari"
    exit 1
fi

# Compilar frontend para producción
echo "🔨 Compilando frontend para producción..."
cd $LOCAL_FRONTEND_PATH
npm install
npm run build
cd ..

# Verificar que el build existe
if [ ! -d "$LOCAL_FRONTEND_PATH/dist" ]; then
    echo "❌ Error: No se pudo compilar el frontend"
    exit 1
fi

# Crear backup del frontend actual en el servidor
echo "💾 Creando backup del frontend actual..."
ssh $SERVER_HOST "cd $SERVER_PATH && tar -czf backup_frontend_$(date +%Y%m%d_%H%M%S).tar.gz dist/ || true"

# Subir build compilado al servidor
echo "📤 Subiendo build compilado..."
rsync -avz --delete "$LOCAL_FRONTEND_PATH/dist/" "$SERVER_HOST:$SERVER_PATH/dist/"

# Configurar nginx si es necesario
echo "🔧 Configurando servidor web..."
ssh $SERVER_HOST "
# Reiniciar nginx si está configurado
systemctl reload nginx 2>/dev/null || true

# Verificar permisos
cd $SERVER_PATH
chown -R www-data:www-data dist/ 2>/dev/null || true
chmod -R 755 dist/ 2>/dev/null || true
"

# Verificar despliegue
echo "🧪 Verificando despliegue..."
sleep 3

# Probar que el frontend esté accesible
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://crm.arifamilyassets.com/")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Frontend desplegado correctamente"
    echo "🌐 Disponible en: https://crm.arifamilyassets.com/"
else
    echo "❌ Error en el despliegue (HTTP $RESPONSE)"
fi

echo "✅ ¡Despliegue de frontend completado!"
echo "🔗 URLs de producción:"
echo "   - Frontend: https://crm.arifamilyassets.com/"
echo "   - Backend API: https://crm.arifamilyassets.com/api/"
echo "   - Mail API: https://crm.arifamilyassets.com/api/mail/"
echo "   - Documentación: https://crm.arifamilyassets.com/docs"