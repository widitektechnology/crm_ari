#!/bin/bash

# ====================================================================
# DIAGNÓSTICO: CSS no carga en CRM
# ====================================================================

echo "🎨 DIAGNÓSTICO DE CSS - CRM ARI"
echo "==============================="

DOMAIN="crm.arifamilyassets.com"
CSS_FILE="index-DIcbciAA.css"

echo "🔍 1. Verificando archivo CSS local..."
if [ -f "frontend/dist/assets/$CSS_FILE" ]; then
    echo "✅ CSS existe localmente: frontend/dist/assets/$CSS_FILE"
    echo "📊 Tamaño: $(ls -lh frontend/dist/assets/$CSS_FILE | awk '{print $5}')"
else
    echo "❌ CSS NO existe localmente"
    echo "📁 Archivos en dist/assets:"
    ls -la frontend/dist/assets/ 2>/dev/null || echo "❌ Directorio dist/assets no existe"
fi

echo ""
echo "🌐 2. Verificando CSS en servidor..."

# Probar acceso directo al CSS
echo "📡 Probando: https://$DOMAIN/assets/$CSS_FILE"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/assets/$CSS_FILE" 2>/dev/null)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ CSS accesible en servidor (HTTP 200)"
    echo "📊 Headers:"
    curl -I "https://$DOMAIN/assets/$CSS_FILE" 2>/dev/null | head -10
elif [ "$RESPONSE" = "404" ]; then
    echo "❌ CSS NO encontrado en servidor (HTTP 404)"
    echo "💡 El archivo no está subido o la ruta es incorrecta"
elif [ "$RESPONSE" = "403" ]; then
    echo "❌ CSS prohibido en servidor (HTTP 403)"
    echo "💡 Problema de permisos en nginx"
else
    echo "❌ CSS inaccesible (HTTP $RESPONSE)"
fi

echo ""
echo "🔍 3. Verificando contenido del CSS..."
if [ -f "frontend/dist/assets/$CSS_FILE" ]; then
    echo "📝 Primeras líneas del CSS:"
    head -5 "frontend/dist/assets/$CSS_FILE"
    echo ""
    echo "📊 Líneas totales: $(wc -l < "frontend/dist/assets/$CSS_FILE")"
    echo "🔍 Contiene Tailwind: $(grep -c "tailwind\|tw-" "frontend/dist/assets/$CSS_FILE" || echo "No")"
fi

echo ""
echo "🌐 4. Verificando desde navegador..."
echo "🔍 Abre DevTools → Network → CSS y verifica:"
echo "   - ¿Aparece $CSS_FILE en la lista?"
echo "   - ¿Qué status code tiene? (200/404/403)"
echo "   - ¿Hay errores CORS?"

echo ""
echo "🔧 5. POSIBLES SOLUCIONES:"
echo "========================="
echo "1. 📤 CSS no subido:"
echo "   → Subir archivo: frontend/dist/assets/$CSS_FILE"
echo ""
echo "2. 🔗 Ruta incorrecta:"
echo "   → Verificar que nginx sirva /assets/ correctamente"
echo ""
echo "3. ⚡ Cache problema:"
echo "   → Ctrl+Shift+R para forzar recarga"
echo ""
echo "4. 📁 Permisos incorrectos:"
echo "   → chmod 644 en archivos CSS"
echo "   → chmod 755 en directorio assets"
echo ""
echo "💡 SIGUIENTE PASO:"
echo "Verificar el status HTTP del CSS en DevTools → Network"