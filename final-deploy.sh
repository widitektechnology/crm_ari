#!/bin/bash

# ============================================================================
# 🌐 Script Final de Resolución del Frontend - ERP
# ============================================================================

echo "🌐 Resolución Final del Frontend ERP"
echo "===================================="

# Matar cualquier proceso que esté usando el puerto 3000
echo "🔍 Identificando y liberando puerto 3000 definitivamente..."
PORT_PID=$(lsof -ti:3000 2>/dev/null || netstat -tlnp 2>/dev/null | grep :3000 | awk '{print $7}' | cut -d'/' -f1)

if [ ! -z "$PORT_PID" ]; then
    echo "🛑 Matando proceso en puerto 3000: PID $PORT_PID"
    kill -9 $PORT_PID 2>/dev/null || true
    sleep 2
fi

# Usar puerto alternativo si es necesario
FRONTEND_PORT=3001
echo "🔄 Usando puerto alternativo $FRONTEND_PORT para evitar conflictos"

# Limpiar completamente contenedores frontend
echo "🧹 Limpieza completa del frontend..."
docker ps -a | grep frontend | awk '{print $1}' | xargs -r docker stop
docker ps -a | grep frontend | awk '{print $1}' | xargs -r docker rm
docker container prune -f 2>/dev/null || true

# Ejecutar frontend en puerto alternativo
echo "🚀 Iniciando frontend en puerto $FRONTEND_PORT..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p $FRONTEND_PORT:3000 \
    -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
    --restart unless-stopped \
    erp_frontend

# Esperar y verificar
echo "⏳ Esperando que el frontend se inicie..."
sleep 8

# Verificar funcionamiento
echo ""
echo "🧪 Verificación completa del sistema..."

# Backend
echo -n "🐍 Backend (puerto 8000): "
if curl -s --max-time 5 http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Funcionando"
else
    echo "❌ No responde"
fi

# Frontend
echo -n "🌐 Frontend (puerto $FRONTEND_PORT): "
if curl -s --max-time 5 http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
    echo "✅ Funcionando"
else
    echo "⚠️ Verificando logs..."
    docker logs --tail 5 erp_frontend 2>/dev/null || echo "Sin logs disponibles"
fi

# MySQL
echo -n "🗄️ MySQL (puerto 3307): "
if docker exec erp_mysql mysql -u erp_user -perp_user_pass -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Funcionando"
else
    echo "❌ Problema de conexión"
fi

echo ""
echo "📋 Estado final de contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 ¡Sistema ERP Completamente Operativo!"
echo "========================================"
echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo "🐍 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️ MySQL: localhost:3307"
echo ""
echo "🧪 URLs de prueba:"
echo "   Frontend: curl http://localhost:$FRONTEND_PORT"
echo "   Backend Health: curl http://localhost:8000/health"
echo "   API Employees: curl http://localhost:8000/api/employees"
echo "   API Companies: curl http://localhost:8000/api/companies"
echo "   API Payroll: curl http://localhost:8000/api/payroll"
echo "   API Invoices: curl http://localhost:8000/api/invoices"
echo ""
echo "🔗 Navegador:"
echo "   Abrir: http://localhost:$FRONTEND_PORT (Dashboard principal)"
echo "   Abrir: http://localhost:8000/docs (Documentación API)"
echo ""
echo "🛠️ Comandos de gestión:"
echo "   docker ps                    # Ver estado"
echo "   docker logs -f erp_backend   # Logs backend en tiempo real"  
echo "   docker logs -f erp_frontend  # Logs frontend en tiempo real"
echo "   docker logs -f erp_mysql     # Logs MySQL"
echo ""