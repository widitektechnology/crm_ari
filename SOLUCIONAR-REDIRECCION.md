# 🔧 SOLUCIONAR REDIRECCIÓN AUTOMÁTICA

## 🚨 **PROBLEMA IDENTIFICADO:**
- URL: `https://crm.arifamilyassets.com/` → `https://crm.arifamilyassets.com/frontend/build/`
- Causa: Configuración de Nginx/Apache redirigiendo automáticamente
- Efecto: Loop infinito de recarga

## ⚡ **SOLUCIÓN RÁPIDA - OPCIÓN A:**
```bash
# Crear index.html en la ruta donde redirige
mkdir -p frontend/build
cp index.html frontend/build/index.html
cp api-config.js frontend/build/api-config.js
echo "✅ Archivos copiados a frontend/build/"
```

## ⚡ **SOLUCIÓN RÁPIDA - OPCIÓN B:**
```bash
# Verificar configuración actual y crear .htaccess
ls -la
cat > .htaccess << 'HTEND'
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
HTEND
echo "✅ .htaccess creado para evitar redirecciones"
```

## 🔍 **DIAGNÓSTICO COMPLETO:**
```bash
# Ver estructura actual
echo "📁 Estructura actual:"
find . -name "*.html" -o -name "*.js" | head -10

# Ver configuración web
echo "🔧 Archivos de configuración:"
ls -la .htaccess nginx.conf 2>/dev/null || echo "No hay archivos de configuración visibles"

# Verificar redirecciones
echo "🌐 Probando URL:"
curl -I https://crm.arifamilyassets.com/ 2>/dev/null | grep Location || echo "Sin redirección en curl"
```

## 🚀 **COMANDO TODO EN UNO:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && echo "🔧 Solucionando redirección..." && mkdir -p frontend/build && cp index.html frontend/build/ && cp api-config.js frontend/build/ && cat > .htaccess << 'HTEND'
DirectoryIndex index.html
RewriteEngine On
RewriteRule ^$ index.html [L]
HTEND
echo "✅ Solución aplicada: archivos en frontend/build/ y .htaccess creado"
```

---

## 🎯 **EJECUTA ESTO PRIMERO:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
mkdir -p frontend/build
cp index.html frontend/build/
cp api-config.js frontend/build/
```

**¿Ejecutas la solución rápida?** 🚀