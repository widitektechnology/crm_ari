#!/bin/bash
# Script de verificación post-despliegue CRM ARI

echo "🚀 VERIFICANDO ESTADO DEL SISTEMA CRM ARI"
echo "=========================================="

# Función para probar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    echo -n "Probando $name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ FALLO"
    fi
}

# Probar endpoints principales
echo ""
echo "📡 PROBANDO ENDPOINTS DEL BACKEND:"
test_endpoint "https://crm.arifamilyassets.com/api/health" "Health Check"
test_endpoint "https://crm.arifamilyassets.com/api/companies" "Companies"
test_endpoint "https://crm.arifamilyassets.com/api/employees" "Employees"
test_endpoint "https://crm.arifamilyassets.com/api/mail/health" "Mail Health"

echo ""
echo "🌐 PROBANDO FRONTEND:"
test_endpoint "https://crm.arifamilyassets.com" "Frontend Principal"
test_endpoint "https://crm.arifamilyassets.com/dashboard" "Dashboard"

echo ""
echo "📊 RESUMEN:"
echo "- Si todos los endpoints muestran ✅, el sistema está funcionando"
echo "- Si hay ❌, revisa los archivos subidos y reinicia los servicios"
echo ""
echo "🔗 URLs importantes:"
echo "   Frontend: https://crm.arifamilyassets.com"
echo "   API Docs: https://crm.arifamilyassets.com/docs (si está habilitado)"
echo "   Mail API: https://crm.arifamilyassets.com/api/mail/health"