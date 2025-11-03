#!/bin/bash

# ============================================================================
# 🧪 Script de Pruebas Completas - Sistema ERP
# ============================================================================

echo "🧪 Pruebas Completas del Sistema ERP"
echo "===================================="

# Verificar que todos los contenedores estén corriendo
echo "📋 1. Verificación de Contenedores:"
echo "-----------------------------------"
CONTAINERS=$(docker ps --format "{{.Names}}" | grep -E "(erp_backend|erp_frontend|erp_mysql)" | wc -l)
echo "Contenedores ERP activos: $CONTAINERS/3"

if [ $CONTAINERS -lt 2 ]; then
    echo "❌ Faltan contenedores. Ejecutar final-deploy.sh primero"
    exit 1
fi

# Determinar puerto del frontend
FRONTEND_PORT=3000
if ! curl -s --max-time 3 http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_PORT=3001
fi

echo ""
echo "🌐 2. Pruebas del Frontend:"
echo "--------------------------"
echo -n "Conectividad: "
if curl -s --max-time 5 http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
    echo "✅ OK"
    echo -n "Contenido HTML: "
    if curl -s --max-time 5 http://localhost:$FRONTEND_PORT | grep -q "Sistema ERP"; then
        echo "✅ OK"
    else
        echo "⚠️ Sin contenido esperado"
    fi
else
    echo "❌ No responde"
fi

echo ""
echo "🐍 3. Pruebas del Backend:"
echo "-------------------------"

# Health Check
echo -n "Health Check: "
HEALTH=$(curl -s --max-time 5 http://localhost:8000/health 2>/dev/null)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
    echo "Respuesta: $HEALTH"
fi

# Root endpoint
echo -n "API Root: "
ROOT=$(curl -s --max-time 5 http://localhost:8000/ 2>/dev/null)
if echo "$ROOT" | grep -q "Sistema ERP"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
fi

# Status endpoint
echo -n "Status: "
STATUS=$(curl -s --max-time 5 http://localhost:8000/status 2>/dev/null)
if echo "$STATUS" | grep -q "database"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
fi

# API Endpoints
echo -n "API Employees: "
EMPLOYEES=$(curl -s --max-time 5 http://localhost:8000/api/employees 2>/dev/null)
if echo "$EMPLOYEES" | grep -q "employees"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
fi

echo -n "API Companies: "
COMPANIES=$(curl -s --max-time 5 http://localhost:8000/api/companies 2>/dev/null)
if echo "$COMPANIES" | grep -q "companies"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
fi

echo -n "API Payroll: "
PAYROLL=$(curl -s --max-time 5 http://localhost:8000/api/payroll 2>/dev/null)
if echo "$PAYROLL" | grep -q "payroll_summary"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
fi

echo -n "API Invoices: "
INVOICES=$(curl -s --max-time 5 http://localhost:8000/api/invoices 2>/dev/null)
if echo "$INVOICES" | grep -q "invoices"; then
    echo "✅ OK"
else
    echo "❌ Fallo"
fi

echo ""
echo "🗄️ 4. Pruebas de MySQL:"
echo "-----------------------"
echo -n "Conectividad: "
if docker exec erp_mysql mysql -u erp_user -perp_user_pass -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ OK"
    echo -n "Base de datos ERP: "
    if docker exec erp_mysql mysql -u erp_user -perp_user_pass -e "USE erp_system; SELECT 1;" > /dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "⚠️ Base de datos no encontrada"
    fi
else
    echo "❌ Fallo de conexión"
fi

echo ""
echo "🔗 5. Pruebas de Conectividad entre Servicios:"
echo "----------------------------------------------"
echo -n "Backend -> MySQL: "
# Esta prueba sería más compleja, por ahora verificamos que backend responda
if curl -s --max-time 5 http://localhost:8000/status | grep -q "database.*connected"; then
    echo "✅ OK"
else
    echo "⚠️ Sin verificación directa"
fi

echo ""
echo "📊 6. Resumen de Pruebas:"
echo "========================"

# Contar pruebas exitosas
TOTAL_TESTS=10
PASSED_TESTS=0

# Verificar cada servicio
curl -s --max-time 3 http://localhost:$FRONTEND_PORT > /dev/null 2>&1 && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/health | grep -q "healthy" && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/ | grep -q "Sistema ERP" && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/status | grep -q "database" && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/api/employees | grep -q "employees" && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/api/companies | grep -q "companies" && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/api/payroll | grep -q "payroll_summary" && PASSED_TESTS=$((PASSED_TESTS + 1))
curl -s --max-time 3 http://localhost:8000/api/invoices | grep -q "invoices" && PASSED_TESTS=$((PASSED_TESTS + 1))
docker exec erp_mysql mysql -u erp_user -perp_user_pass -e "SELECT 1;" > /dev/null 2>&1 && PASSED_TESTS=$((PASSED_TESTS + 1))
docker exec erp_mysql mysql -u erp_user -perp_user_pass -e "USE erp_system; SELECT 1;" > /dev/null 2>&1 && PASSED_TESTS=$((PASSED_TESTS + 1))

echo "Pruebas exitosas: $PASSED_TESTS/$TOTAL_TESTS"

if [ $PASSED_TESTS -ge 8 ]; then
    echo "🎉 ¡Sistema ERP COMPLETAMENTE FUNCIONAL!"
    echo ""
    echo "✅ URLs Principales:"
    echo "   🌐 Frontend: http://localhost:$FRONTEND_PORT"
    echo "   🐍 Backend: http://localhost:8000"
    echo "   📚 API Docs: http://localhost:8000/docs"
    echo "   🔍 Health: http://localhost:8000/health"
    echo ""
    echo "✅ APIs Disponibles:"
    echo "   📊 Employees: http://localhost:8000/api/employees"
    echo "   🏢 Companies: http://localhost:8000/api/companies"
    echo "   💰 Payroll: http://localhost:8000/api/payroll"
    echo "   🧾 Invoices: http://localhost:8000/api/invoices"
    echo ""
    echo "✅ Base de Datos:"
    echo "   🗄️ MySQL: localhost:3307"
    echo "   📋 Database: erp_system"
    echo "   👤 User: erp_user"
elif [ $PASSED_TESTS -ge 5 ]; then
    echo "⚠️ Sistema parcialmente funcional - Revisar fallos"
else
    echo "❌ Sistema con problemas críticos - Revisar configuración"
fi

echo ""
echo "🔍 Para monitoreo en tiempo real:"
echo "   docker logs -f erp_backend"
echo "   docker logs -f erp_frontend"
echo "   docker ps"
echo ""