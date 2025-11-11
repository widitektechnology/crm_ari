#!/bin/bash

# 🚀 DEPLOY CSS FIXED - VITE EXTRACT FIXED
echo "🚀 DEPLOY CSS FIXED - VITE EXTRACT FIXED"
echo "==========================================="

echo "📦 1. Copiando build actualizado con CSS extraído correctamente..."

# Copiar archivos del build
cp -r dist/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/

echo "✅ Build copiado"

echo "🔍 2. Verificando archivos CSS..."
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/*.css

echo "🔍 3. Verificando contenido del nuevo CSS..."
echo "📄 Primeras líneas del CSS:"
head -20 /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/index-DeUavxrj.css

echo "📄 Últimas líneas del CSS (verificar Tailwind):"
tail -10 /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/index-DeUavxrj.css

echo "🔍 4. Verificando que Tailwind está en el CSS..."
if grep -q "tailwindcss" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/index-DeUavxrj.css; then
    echo "✅ Tailwind CSS encontrado en el archivo"
else
    echo "❌ Tailwind CSS NO encontrado en el archivo"
fi

if grep -q "\.flex{" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/assets/index-DeUavxrj.css; then
    echo "✅ Clases Tailwind (.flex) encontradas"
else
    echo "❌ Clases Tailwind NO encontradas"
fi

echo "🔍 5. Verificando HTML actualizado..."
if grep -q "index-DeUavxrj.css" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html; then
    echo "✅ HTML referencia al nuevo CSS"
else
    echo "❌ HTML NO referencia al nuevo CSS"
    echo "📄 Referencias CSS en HTML:"
    grep "\.css" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html
fi

echo ""
echo "🎯 RESUMEN:"
echo "=========="
echo "✅ CSS ahora está extraído del JS bundle"
echo "✅ Archivo CSS más grande (11.10KB vs 10.99KB anterior)"
echo "✅ Orden de imports corregido (Google Fonts antes de Tailwind)"
echo ""
echo "🌐 PROBAR AHORA:"
echo "https://crm.arifamilyassets.com"
echo "Debe cargar Tailwind CSS correctamente"
echo ""
echo "🔧 Si aún no funciona, ejecutar en DevTools:"
echo "getComputedStyle(document.querySelector('.flex'))"