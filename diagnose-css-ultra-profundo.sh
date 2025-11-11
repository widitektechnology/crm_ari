#!/bin/bash

# 🔍 DIAGNÓSTICO ULTRA-PROFUNDO CSS - TAILWIND NO SE APLICA
echo "🔍 DIAGNÓSTICO ULTRA-PROFUNDO CSS - TAILWIND NO SE APLICA"
echo "=========================================================="

# 1. Verificar que el CSS está realmente aplicándose al DOM
echo "🔍 1. Verificando aplicación CSS en DOM..."
curl -s https://crm.arifamilyassets.com/assets/index-DIcbciAA.css | head -c 200
echo -e "\n"

# 2. Verificar orden de carga y CSS conflictos
echo "🔍 2. Verificando HTML completo y orden de CSS..."
curl -s https://crm.arifamilyassets.com/ | grep -E "(link|style)" -A 2 -B 2
echo -e "\n"

# 3. Verificar MIME type específicamente
echo "🔍 3. Verificando MIME type específico del CSS..."
curl -I https://crm.arifamilyassets.com/assets/index-DIcbciAA.css | grep -i "content-type"
echo -e "\n"

# 4. Verificar si hay CSS inline competing
echo "🔍 4. Buscando CSS inline que pueda estar compitiendo..."
curl -s https://crm.arifamilyassets.com/ | grep -E "<style|style>" -A 5 -B 2
echo -e "\n"

# 5. Verificar JavaScript que pueda estar modificando estilos
echo "🔍 5. Verificando si JavaScript está interfiriendo..."
curl -s https://crm.arifamilyassets.com/assets/index-Bn3uYxYa.js | grep -E "(style|class|css)" | head -10
echo -e "\n"

# 6. Verificar si Tailwind está siendo cargado pero sobrescrito
echo "🔍 6. Verificando si hay CSS reset o normalize compitiendo..."
curl -s https://crm.arifamilyassets.com/ | grep -E "(normalize|reset|bootstrap)" -i
echo -e "\n"

echo "🎯 PASOS MANUALES CRÍTICOS EN DEVTOOLS:"
echo "======================================"
echo "1. 🌐 Abre https://crm.arifamilyassets.com"
echo "2. 🔧 F12 → Sources tab"
echo "3. 🔍 Busca index-DIcbciAA.css en Sources"
echo "4. ✅ Confirma que está cargado y no vacío"
echo "5. 🎨 Elements tab → Cualquier elemento"
echo "6. 🔍 Computed styles → Busca 'display: flex' en elementos con class='flex'"
echo "7. 📱 Console → Ejecuta: getComputedStyle(document.querySelector('.flex'))"
echo "8. 🚨 Console → Busca errores relacionados con CSS"
echo ""
echo "🎯 SI TAILWIND NO APARECE EN COMPUTED STYLES:"
echo "========================================="
echo "- CSS carga pero no se aplica = Orden de CSS incorrecto"
echo "- Verificar si hay !important conflictos"
echo "- Verificar si loading screen CSS tiene mayor especificidad"
echo "- Verificar si Tailwind está siendo cargado ANTES de otros CSS"