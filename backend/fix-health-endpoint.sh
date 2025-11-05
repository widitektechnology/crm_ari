#!/bin/bash

# 🔧 Fix rápido para el endpoint /api/health
# Uso: ./fix-health-endpoint.sh

set -e

CONTAINER_NAME="erp_backend_new"
IMAGE_NAME="erp_backend_fixed"

echo "🔧 Aplicando fix para /api/health endpoint..."

# Rebuild rápido
echo "🔨 Rebuilding imagen..."
docker build -t $IMAGE_NAME . || exit 1

# Restart contenedor
echo "🔄 Reiniciando contenedor..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

docker run -d \
  --name $CONTAINER_NAME \
  -p 8000:8000 \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:8000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  $IMAGE_NAME

echo "⏳ Esperando 5 segundos..."
sleep 5

# Test ambos endpoints
echo "🧪 Testing endpoints:"
echo "✅ /health:"
curl -s http://localhost:8000/health | jq .

echo ""
echo "✅ /api/health:"
curl -s http://localhost:8000/api/health | jq .

echo ""
echo "✅ /api/mail/health:"
curl -s http://localhost:8000/api/mail/health | jq .

echo ""
echo "🎉 Fix aplicado exitosamente!"