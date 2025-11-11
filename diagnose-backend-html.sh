#!/bin/bash

# ====================================================================
# DIAGNÓSTICO: Backend devuelve HTML en lugar de JSON
# ====================================================================

echo "🔍 DIAGNÓSTICO DE BACKEND - API devuelve HTML"
echo "============================================="

# Verificar estado del backend
echo "📡 1. Verificando backend en puerto 8000..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend responde en puerto 8000"
    
    echo ""
    echo "📊 2. Probando endpoint /health:"
    curl -I http://localhost:8000/health 2>/dev/null
    echo ""
    
    echo "📋 3. Contenido del /health:"
    curl -s http://localhost:8000/health | head -5
    echo ""
    
else
    echo "❌ Backend NO responde en puerto 8000"
    echo "💡 ¿El backend está corriendo?"
    exit 1
fi

# Verificar endpoints específicos que están fallando
echo "🔍 4. Probando /companies (que está fallando):"
echo "Status code:"
curl -I http://localhost:8000/companies 2>/dev/null | head -1
echo ""
echo "Contenido (primeras líneas):"
curl -s http://localhost:8000/companies | head -5
echo ""

echo "🔍 5. Probando /employees (que está fallando):"
echo "Status code:"
curl -I http://localhost:8000/employees 2>/dev/null | head -1
echo ""
echo "Contenido (primeras líneas):"
curl -s http://localhost:8000/employees | head -5
echo ""

# Verificar si existen los endpoints con /api/ prefix
echo "🔍 6. Probando con prefix /api/:"
echo "/api/companies:"
curl -I http://localhost:8000/api/companies 2>/dev/null | head -1
echo ""

echo "/api/employees:"
curl -I http://localhost:8000/api/employees 2>/dev/null | head -1
echo ""

# Verificar logs del backend (si están disponibles)
echo "📜 7. Verificar proceso FastAPI:"
ps aux | grep -i uvicorn || echo "No se encontró proceso uvicorn"
ps aux | grep -i python.*8000 || echo "No se encontró Python en puerto 8000"

echo ""
echo "🔧 POSIBLES CAUSAS:"
echo "=================="
echo "1. ❌ Backend no está corriendo"
echo "2. ❌ Backend corre en otro puerto"
echo "3. ❌ Endpoints no existen (404 → HTML)"
echo "4. ❌ Error interno del backend (500 → HTML de error)"
echo "5. ❌ Configuración nginx incorrecta"
echo ""
echo "💡 SIGUIENTE PASO:"
echo "Revisar qué devuelven exactamente los endpoints"