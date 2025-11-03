# 🚀 Script de Verificación Rápida para Docker

echo "🐳 Verificando estado de Docker y contenedores..."
echo "================================================="

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    echo "💡 Ejecuta: Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'"
    exit 1
fi

echo "✅ Docker está corriendo"

# Verificar contenedores
echo ""
echo "📊 Estado de contenedores:"
CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
echo "$CONTAINERS"

# Contar contenedores corriendo
RUNNING=$(docker ps | grep -c "erp_")
echo ""
echo "📈 Contenedores ERP corriendo: $RUNNING/3"

if [ "$RUNNING" -lt 3 ]; then
    echo "⚠️  Faltan contenedores por iniciar"
    echo "💡 Ejecuta: bash final-deploy.sh"
else
    echo "✅ Todos los contenedores están corriendo"
fi

# Verificar puertos
echo ""
echo "🔍 Verificando puertos:"

check_port() {
    local port=$1
    local service=$2
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ Puerto $port ($service) - ABIERTO"
    else
        echo "❌ Puerto $port ($service) - CERRADO"
    fi
}

check_port 8000 "Backend FastAPI"
check_port 3001 "Frontend Next.js"
check_port 3307 "MySQL Database"

# URLs de prueba local
echo ""
echo "🧪 URLs de prueba (local):"
echo "   Backend Health: http://localhost:8000/health"
echo "   Frontend: http://localhost:3001"
echo "   API Docs: http://localhost:8000/docs"

echo ""
echo "🌐 URLs objetivo (después de configurar Plesk):"
echo "   Frontend: https://crm.arifamilyassets.com/"
echo "   API: https://crm.arifamilyassets.com/api/employees"
echo "   Docs: https://crm.arifamilyassets.com/docs"
echo "   Health: https://crm.arifamilyassets.com/health"

echo ""
echo "📋 Próximo paso:"
echo "   1. Configurar proxy reverso en Plesk (ver plesk-configuration-guide.md)"
echo "   2. Apuntar crm.arifamilyassets.com a los puertos 3001 (frontend) y 8000 (backend)"