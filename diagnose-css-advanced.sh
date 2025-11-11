#!/bin/bash

# ====================================================================
# DIAGNÓSTICO AVANZADO: CSS carga pero no se aplica
# ====================================================================

echo "🎨 DIAGNÓSTICO AVANZADO CSS - CRM ARI"
echo "===================================="

DOMAIN="crm.arifamilyassets.com"
CSS_FILE="index-DIcbciAA.css"

echo "✅ CONFIRMADO: CSS accesible en servidor (HTTP 200)"
echo ""

echo "🔍 1. Verificando Content-Security-Policy..."
echo "📡 Checking CSP headers:"
curl -s -I "https://$DOMAIN" | grep -i "content-security-policy" || echo "❌ No CSP header found"

echo ""
echo "🔍 2. Verificando contenido CSS específico..."
echo "📊 CSS Content preview:"
curl -s "https://$DOMAIN/assets/$CSS_FILE" | head -3
echo ""
echo "📊 CSS file size:"
curl -s -I "https://$DOMAIN/assets/$CSS_FILE" | grep -i "content-length"

echo ""
echo "🔍 3. Verificando si CSS contiene Tailwind..."
CSS_CONTENT=$(curl -s "https://$DOMAIN/assets/$CSS_FILE")
if echo "$CSS_CONTENT" | grep -q "tailwindcss"; then
    echo "✅ CSS contiene Tailwind"
else
    echo "❌ CSS NO contiene Tailwind"
fi

if echo "$CSS_CONTENT" | grep -q "\.bg-"; then
    echo "✅ CSS contiene clases de fondo (.bg-)"
else
    echo "❌ CSS NO contiene clases de fondo"
fi

if echo "$CSS_CONTENT" | grep -q "\.flex"; then
    echo "✅ CSS contiene clases flex"
else
    echo "❌ CSS NO contiene clases flex"
fi

echo ""
echo "🔍 4. Verificando HTML index..."
echo "📄 Checking HTML CSS reference:"
curl -s "https://$DOMAIN" | grep -o '<link.*stylesheet.*>' || echo "❌ No stylesheet link found"

echo ""
echo "🔧 PASOS DE VERIFICACIÓN EN NAVEGADOR:"
echo "======================================"
echo "1. 🌐 Abre: https://$DOMAIN"
echo "2. 🔧 F12 → Network tab → Reload"
echo "3. 🔍 Busca: $CSS_FILE"
echo "4. ✅ ¿Status 200? ¿Size 10.9KB?"
echo "5. 🎨 F12 → Elements → Inspect any element"
echo "6. 🔍 ¿Aparecen clases Tailwind en Computed styles?"
echo ""
echo "💡 SI EL CSS CARGA PERO NO SE APLICA:"
echo "=================================="
echo "1. 🔄 Cache agresivo → Ctrl+Shift+R + Incognito"
echo "2. 🚫 CSP bloqueando → Verificar Console por errores"
echo "3. 📱 MIME type → Verificar Content-Type: text/css"
echo "4. ⚡ CSS inline competing → Loading screen CSS vs Tailwind"
echo ""
echo "🎯 SIGUIENTE PASO:"
echo "Verificar en DevTools si Tailwind classes aparecen en Computed styles"