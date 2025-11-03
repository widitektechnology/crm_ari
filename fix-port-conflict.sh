#!/bin/bash

# ============================================================================
# 🌐 Script de Reparación de Conflicto de Puerto - Frontend
# ============================================================================

echo "🌐 Solucionando Conflicto de Puerto del Frontend"
echo "==============================================="

# Identificar qué está usando el puerto 3000
echo "🔍 Identificando proceso en puerto 3000..."
PORT_PROCESS=$(lsof -i :3000 2>/dev/null || netstat -tulpn 2>/dev/null | grep :3000 || echo "No encontrado con herramientas disponibles")
echo "Proceso encontrado: $PORT_PROCESS"

# Opción 1: Detener contenedores Docker que puedan estar usando el puerto
echo ""
echo "🛑 Deteniendo contenedores que puedan usar puerto 3000..."
docker ps -a --format "table {{.Names}}\t{{.Ports}}" | grep 3000 || echo "No hay contenedores Docker usando puerto 3000"

# Detener cualquier contenedor que use puerto 3000
docker ps -q --filter "publish=3000" | xargs -r docker stop
docker ps -aq --filter "publish=3000" | xargs -r docker rm

# Detener proceso si es posible
echo ""
echo "🔧 Intentando liberar puerto 3000..."
pkill -f "node.*3000" 2>/dev/null || echo "No hay procesos Node.js en puerto 3000"
fuser -k 3000/tcp 2>/dev/null || echo "No se pudo usar fuser para liberar puerto"

# Verificar que el puerto está libre
echo ""
echo "✅ Verificando que puerto 3000 está libre..."
sleep 2
if lsof -i :3000 >/dev/null 2>&1 || netstat -tulpn 2>/dev/null | grep -q :3000; then
    echo "⚠️ Puerto 3000 aún ocupado - Usando puerto alternativo 3001"
    FRONTEND_PORT=3001
else
    echo "✅ Puerto 3000 está libre"
    FRONTEND_PORT=3000
fi

# Limpiar contenedor frontend anterior
echo ""
echo "🧹 Limpiando frontend anterior..."
docker stop erp_frontend 2>/dev/null || true
docker rm erp_frontend 2>/dev/null || true

# Reiniciar frontend en puerto disponible
echo ""
echo "🚀 Iniciando frontend en puerto $FRONTEND_PORT..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p $FRONTEND_PORT:3000 \
    -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
    erp_frontend

# Esperar y verificar
echo "⏳ Esperando que el frontend se inicie..."
sleep 5

echo ""
echo "🧪 Probando frontend..."
if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
    echo "✅ Frontend funcionando en puerto $FRONTEND_PORT"
else
    echo "⚠️ Frontend aún iniciando o con problemas"
    echo "📋 Logs del frontend:"
    docker logs --tail 10 erp_frontend
fi

echo ""
echo "📋 Estado final:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Reparación de Puerto Completada"
echo "=================================="
if [ "$FRONTEND_PORT" = "3000" ]; then
    echo "🌐 Frontend: http://localhost:3000"
else
    echo "🌐 Frontend: http://localhost:3001 (puerto alternativo)"
fi
echo "🐍 Backend: http://localhost:8000"
echo "🗄️ MySQL: localhost:3307"
echo ""
echo "🔍 Comandos de verificación:"
echo "   curl http://localhost:$FRONTEND_PORT"
echo "   docker logs erp_frontend"
echo ""