#!/bin/bash

# Script para reconstruir y probar el contenedor con la nueva configuración lazy loading

echo "🛑 Deteniendo contenedor actual..."
docker stop crm_ari_backend 2>/dev/null || true
docker rm crm_ari_backend 2>/dev/null || true

echo "🔨 Construyendo nueva imagen..."
cd /home/crm_ari || exit 1
docker build --no-cache -t backend_backend .

if [ $? -ne 0 ]; then
    echo "❌ Error en la construcción de la imagen"
    exit 1
fi

echo "🚀 Ejecutando contenedor con configuración de producción..."
docker run -d \
    --name crm_ari_backend \
    -p 8000:8000 \
    -e ENVIRONMENT=production \
    -e DB_HOST=172.17.0.1 \
    -e DB_PORT=3306 \
    -e DB_USERNAME=crm_user \
    -e DB_PASSWORD=crm_password_secure_2025 \
    -e DB_DATABASE=crm_ari \
    backend_backend

if [ $? -eq 0 ]; then
    echo "✅ Contenedor ejecutándose correctamente"
    echo "🌐 API disponible en: http://localhost:8000"
    echo "📚 Documentación en: http://localhost:8000/docs"
    echo "💓 Health check: http://localhost:8000/health"
    echo ""
    echo "📊 Ver logs del contenedor:"
    echo "docker logs -f crm_ari_backend"
    echo ""
    echo "📝 Primeros logs:"
    sleep 5
    docker logs crm_ari_backend 2>&1 | head -20
    echo ""
    echo "🔍 Verificando si se aplica la configuración hardcoded..."
    docker logs crm_ari_backend 2>&1 | grep -E "🔍|🔧|🔗" || echo "No hay logs de configuración aún"
else
    echo "❌ Error al ejecutar el contenedor"
    exit 1
fi

echo ""
echo "📋 Comandos útiles:"
echo "Ver logs completos: docker logs -f crm_ari_backend"
echo "Entrar al contenedor: docker exec -it crm_ari_backend bash"
echo "Parar contenedor: docker stop crm_ari_backend"
echo "Health check: curl http://localhost:8000/health"