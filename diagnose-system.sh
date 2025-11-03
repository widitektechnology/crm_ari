#!/bin/bash

# ============================================================================
# 🔍 Script de Diagnóstico Completo - ERP
# ============================================================================

echo "🔍 Diagnóstico Completo del Sistema ERP"
echo "======================================="

echo "📋 1. Estado de Contenedores Docker:"
echo "------------------------------------"
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 2. Estado de Red Docker:"
echo "---------------------------"
docker network ls | grep erp || echo "❌ Red erp_network no encontrada"
docker network inspect erp_network 2>/dev/null | grep -A 5 "Containers" || echo "⚠️ No hay contenedores en la red"

echo ""
echo "🐍 3. Logs del Backend (últimas 10 líneas):"
echo "--------------------------------------------"
if docker ps | grep -q "erp_backend"; then
    docker logs --tail 10 erp_backend
else
    echo "❌ Contenedor erp_backend no está corriendo"
fi

echo ""
echo "🌐 4. Logs del Frontend (últimas 10 líneas):"
echo "---------------------------------------------"
if docker ps | grep -q "erp_frontend"; then
    docker logs --tail 10 erp_frontend
else
    echo "❌ Contenedor erp_frontend no está corriendo"
fi

echo ""
echo "🗄️ 5. Estado de MySQL:"
echo "----------------------"
if docker ps | grep -q "erp_mysql"; then
    echo "✅ Contenedor MySQL corriendo"
    docker exec erp_mysql mysqladmin -u erp_user -perp_user_pass status 2>/dev/null && echo "✅ MySQL responde correctamente" || echo "⚠️ Problema de conexión con MySQL"
else
    echo "❌ Contenedor erp_mysql no está corriendo"
fi

echo ""
echo "🔌 6. Pruebas de Conectividad:"
echo "------------------------------"
echo -n "Puerto 8000 (Backend): "
curl -s --connect-timeout 3 http://localhost:8000 > /dev/null && echo "✅ Accesible" || echo "❌ No accesible"

echo -n "Puerto 3000 (Frontend): "
curl -s --connect-timeout 3 http://localhost:3000 > /dev/null && echo "✅ Accesible" || echo "❌ No accesible"

echo -n "Puerto 3307 (MySQL): "
nc -z localhost 3307 2>/dev/null && echo "✅ Accesible" || echo "❌ No accesible"

echo ""
echo "💾 7. Información del Sistema:"
echo "-----------------------------"
echo "Espacio en disco:"
df -h / | tail -1

echo ""
echo "Memoria:"
free -h | head -2

echo ""
echo "🐳 8. Imágenes Docker:"
echo "---------------------"
docker images | grep erp

echo ""
echo "📊 9. Resumen del Diagnóstico:"
echo "==============================="

# Contar servicios funcionando
RUNNING_SERVICES=0
TOTAL_SERVICES=3

if docker ps | grep -q "erp_mysql"; then
    echo "✅ MySQL: Funcionando"
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
else
    echo "❌ MySQL: No funcionando"
fi

if docker ps | grep -q "erp_backend"; then
    echo "✅ Backend: Contenedor corriendo"
    if curl -s --connect-timeout 3 http://localhost:8000 > /dev/null; then
        echo "✅ Backend: API accesible"
        RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
    else
        echo "⚠️ Backend: Contenedor corriendo pero API no accesible"
    fi
else
    echo "❌ Backend: No funcionando"
fi

if docker ps | grep -q "erp_frontend"; then
    echo "✅ Frontend: Contenedor corriendo"
    if curl -s --connect-timeout 3 http://localhost:3000 > /dev/null; then
        echo "✅ Frontend: Web accesible"
        RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
    else
        echo "⚠️ Frontend: Contenedor corriendo pero web no accesible"
    fi
else
    echo "❌ Frontend: No funcionando"
fi

echo ""
echo "📈 Estado General: $RUNNING_SERVICES/$TOTAL_SERVICES servicios funcionando"

if [ $RUNNING_SERVICES -eq $TOTAL_SERVICES ]; then
    echo "🎉 ¡Sistema completamente operativo!"
elif [ $RUNNING_SERVICES -gt 0 ]; then
    echo "⚠️ Sistema parcialmente operativo - Ejecutar fix-complete.sh"
else
    echo "❌ Sistema no operativo - Ejecutar fix-deployment.sh"
fi

echo ""
echo "🛠️ Comandos recomendados:"
echo "------------------------"
if [ $RUNNING_SERVICES -lt $TOTAL_SERVICES ]; then
    echo "Para reparar: ./fix-complete.sh"
fi
echo "Para monitorear: watch docker ps"
echo "Para logs: docker logs -f erp_backend"