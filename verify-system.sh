#!/bin/bash

# ============================================================================
# 🔧 Script de Verificación del Sistema ERP
# ============================================================================

echo "🔍 Verificación del Sistema ERP"
echo "==============================="

# Verificar contenedores activos
echo "📋 Contenedores activos:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Probando conectividad de servicios..."

# Probar Backend
echo -n "🐍 Backend (puerto 8000): "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Funcionando"
elif curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Funcionando (respuesta sin /health)"
else
    echo "⚠️  No responde - revisando logs..."
    echo "📋 Últimas líneas del log del backend:"
    docker logs --tail 10 erp_backend 2>/dev/null || echo "No hay logs disponibles"
fi

# Probar MySQL
echo -n "🗄️  MySQL (puerto 3307): "
if docker exec erp_mysql mysql -u erp_user -perp_user_pass -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Funcionando"
else
    echo "⚠️  Problema de conexión"
fi

echo ""
echo "🔗 URLs de acceso:"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   🔧 Admin: http://localhost:8000/admin" 
echo "   💾 Base de datos: localhost:3307"

echo ""
echo "🛠️  Comandos útiles:"
echo "   docker logs -f erp_backend     # Ver logs del backend en tiempo real"
echo "   docker logs -f erp_mysql       # Ver logs de MySQL"
echo "   docker exec -it erp_backend bash  # Acceder al contenedor backend"
echo "   docker exec -it erp_mysql mysql -u erp_user -p  # Acceder a MySQL"