#!/bin/bash

# =====================================================
# GESTIÓN DE PUERTOS - CRM ARI
# =====================================================

echo "🔍 VERIFICANDO PUERTOS EN USO..."
echo "=============================================="

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if netstat -tuln | grep -q ":$port "; then
        echo "❌ Puerto $port está en uso"
        echo "   Proceso: $(lsof -i :$port 2>/dev/null | tail -1)"
        return 1
    else
        echo "✅ Puerto $port está disponible"
        return 0
    fi
}

# Verificar puertos comunes
echo "📍 VERIFICANDO PUERTOS:"
check_port 8000
check_port 8001
check_port 8002
check_port 8080
check_port 3000

echo ""
echo "🐳 VERIFICANDO CONTENEDORES DOCKER:"
if docker ps | grep -q ":8000"; then
    echo "❌ Contenedor Docker usando puerto 8000:"
    docker ps | grep ":8000"
else
    echo "✅ No hay contenedores Docker usando puerto 8000"
fi

echo ""
echo "💡 SOLUCIONES RECOMENDADAS:"
echo "1. Usar puerto 8001: Editar docker-compose.external-db.yml"
echo "2. Detener aplicación en puerto 8000"
echo "3. Usar puerto personalizado"

echo ""
echo "🚀 COMANDOS ÚTILES:"
echo "# Ver qué está usando el puerto 8000:"
echo "sudo lsof -i :8000"
echo ""
echo "# Detener contenedores existentes:"
echo "docker stop \$(docker ps -q)"
echo ""
echo "# Cambiar puerto en docker-compose:"
echo "sed -i 's/8000:8000/8001:8000/g' docker-compose.external-db.yml"