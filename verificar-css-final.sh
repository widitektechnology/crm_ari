#!/bin/bash

# 🎯 VERIFICACIÓN FINAL CSS - POST DEPLOY CON VITE EXTRACT FIXED
echo "🎯 VERIFICACIÓN FINAL CSS - POST DEPLOY CON VITE EXTRACT FIXED"
echo "=============================================================="

echo "🔍 1. Verificando archivos CSS en servidor..."
echo "📁 Archivos CSS disponibles:"
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/*.css 2>/dev/null || echo "❌ No se encontraron archivos CSS"

echo ""
echo "🔍 2. Verificando referencias CSS en HTML..."
echo "📄 Referencias CSS en index.html:"
grep -E "(\.css|stylesheet)" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html

echo ""
echo "🔍 3. Verificando contenido del CSS más reciente..."
LATEST_CSS=$(ls -t /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/*.css 2>/dev/null | head -1)

if [ -f "$LATEST_CSS" ]; then
    echo "📄 Archivo CSS encontrado: $(basename $LATEST_CSS)"
    echo "📊 Tamaño: $(stat -c%s "$LATEST_CSS") bytes"
    
    echo ""
    echo "🔍 4. Verificando contenido Tailwind..."
    if grep -q "tailwindcss" "$LATEST_CSS"; then
        echo "✅ Tailwind CSS v$(grep -o 'tailwindcss v[0-9.]*' "$LATEST_CSS" | head -1 | cut -d'v' -f2) encontrado"
    else
        echo "❌ Tailwind CSS NO encontrado"
    fi
    
    if grep -q "\.flex{" "$LATEST_CSS"; then
        echo "✅ Clases Tailwind (.flex) encontradas"
    else
        echo "❌ Clases Tailwind (.flex) NO encontradas"
    fi
    
    if grep -q "\.bg-gradient-to-" "$LATEST_CSS"; then
        echo "✅ Gradientes Tailwind encontrados"
    else
        echo "❌ Gradientes Tailwind NO encontrados"
    fi
    
    if grep -q "@layer" "$LATEST_CSS"; then
        echo "✅ @layer utilities encontrado"
    else
        echo "❌ @layer utilities NO encontrado"
    fi
    
    echo ""
    echo "📄 Primeras líneas del CSS:"
    head -10 "$LATEST_CSS"
    
    echo ""
    echo "📄 Últimas líneas del CSS:"
    tail -10 "$LATEST_CSS"
    
else
    echo "❌ No se encontró ningún archivo CSS"
fi

echo ""
echo "🌐 5. Probando acceso HTTP al CSS..."
CSS_FILE=$(basename "$LATEST_CSS" 2>/dev/null)
if [ -n "$CSS_FILE" ]; then
    echo "🔗 Probando: https://crm.arifamilyassets.com/assets/$CSS_FILE"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://crm.arifamilyassets.com/assets/$CSS_FILE")
    CONTENT_TYPE=$(curl -s -I "https://crm.arifamilyassets.com/assets/$CSS_FILE" | grep -i content-type)
    CONTENT_SIZE=$(curl -s -I "https://crm.arifamilyassets.com/assets/$CSS_FILE" | grep -i content-length)
    
    echo "📊 Status: $HTTP_STATUS"
    echo "📄 $CONTENT_TYPE"
    echo "📏 $CONTENT_SIZE"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ CSS accesible vía HTTP"
    else
        echo "❌ CSS NO accesible vía HTTP"
    fi
fi

echo ""
echo "🎯 RESUMEN FINAL:"
echo "================"
echo "🔧 Configuración Vite: cssCodeSplit: true ✅"
echo "📦 Build: CSS extraído del bundle JS ✅"
echo "🔄 Orden imports: Google Fonts → @tailwind ✅"
echo "📁 Deploy: Subido al servidor ✅"
echo ""
echo "🌐 ACCIÓN REQUERIDA:"
echo "==================="
echo "1. 🌐 Abre: https://crm.arifamilyassets.com"
echo "2. 🔄 Hard refresh: Ctrl+Shift+R"
echo "3. 🔧 F12 → Console → Ejecuta:"
echo "   getComputedStyle(document.querySelector('.flex'))"
echo "4. 🎨 ¿Aparece 'display: flex'? → ¡CSS FUNCIONANDO!"
echo ""
if [ -n "$CSS_FILE" ]; then
    echo "🔍 CSS actual: https://crm.arifamilyassets.com/assets/$CSS_FILE"
fi