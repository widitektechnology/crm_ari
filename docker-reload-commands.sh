# 🔄 COMANDOS PARA RECARGAR DOCKER

echo "📋 Estado actual de contenedores:"
docker ps -a

echo ""
echo "🛑 Parando todos los contenedores del ERP..."
docker stop erp_frontend erp_backend erp_mysql

echo ""
echo "🗑️ Eliminando contenedores parados..."
docker rm erp_frontend

echo ""
echo "🔄 Reconstruyendo y levantando contenedores..."
docker-compose up --build -d

echo ""
echo "✅ Verificando estado final:"
docker ps -a

echo ""
echo "📊 Logs del frontend (últimas 20 líneas):"
docker logs --tail 20 erp_frontend

echo ""
echo "📊 Logs del backend (últimas 20 líneas):"
docker logs --tail 20 erp_backend