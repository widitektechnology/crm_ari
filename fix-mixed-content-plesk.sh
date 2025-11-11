#!/bin/bash

# ====================================================================
# Script para ELIMINAR Mixed Content en Plesk
# Problema: Axios envía HTTPS pero navegador ve HTTP
# Solución: Headers de seguridad ultra-forzados
# ====================================================================

echo "🔒 ELIMINANDO MIXED CONTENT - Configuración Nginx Ultra-Segura"
echo "==============================================================="

# Verificar si estamos en el servidor
if [ ! -d "/var/www/vhosts" ]; then
    echo "❌ Este script debe ejecutarse en el servidor Plesk"
    exit 1
fi

DOMAIN="arifamilyassets.com"
VHOST_PATH="/var/www/vhosts/$DOMAIN"
NGINX_CONF="$VHOST_PATH/conf/vhost_nginx.conf"

echo "🔍 Configurando dominio: $DOMAIN"
echo "📁 Ruta vhost: $VHOST_PATH"

# Backup de configuración actual
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Backup creado: $NGINX_CONF.backup.*"
fi

# Crear configuración anti-Mixed Content
cat > "$NGINX_CONF" << 'EOF'
#ATTENTION!
#
#DO NOT MODIFY THIS FILE BECAUSE IT WAS GENERATED AUTOMATICALLY,
#SO ALL YOUR CHANGES WILL BE LOST THE NEXT TIME THE FILE IS GENERATED.
#
#IF YOU REQUIRE TO APPLY CUSTOM MODIFICATIONS, PERFORM THEM IN THE FOLLOWING FILES:
#/var/www/vhosts/arifamilyassets.com/conf/vhost.conf
#/var/www/vhosts/arifamilyassets.com/conf/vhost_ssl.conf

# ====================================================================
# CONFIGURACIÓN ANTI-MIXED CONTENT ULTRA-SEGURA
# Soluciona: Mixed Content errors con proxy interno HTTP
# ====================================================================

# API Proxy con headers de seguridad máxima
location /api/ {
    # Headers de proxy seguros
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port 443;
    
    # ANTI-MIXED CONTENT HEADERS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' https: 'unsafe-inline' 'unsafe-eval'" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy al backend FastAPI
    proxy_pass http://127.0.0.1:8000/;
    
    # Timeouts optimizados
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Sin buffering para API real-time
    proxy_buffering off;
    proxy_request_buffering off;
}

# Health check seguro
location /health {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
    proxy_pass http://127.0.0.1:8000/health;
}

# SPA con headers ultra-seguros
location / {
    try_files $uri $uri/ /index.html;
    
    # MÁXIMA SEGURIDAD ANTI-MIXED CONTENT
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' https: 'unsafe-inline' 'unsafe-eval'" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache control para HTML
    add_header Cache-Control "no-cache, must-revalidate" always;
}

# Assets estáticos con headers seguros
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    
    # Seguridad para assets
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
    add_header X-Content-Type-Options nosniff always;
}
EOF

echo "✅ Configuración nginx anti-Mixed Content aplicada"

# Verificar configuración de nginx
echo "🔍 Verificando configuración nginx..."
if nginx -t 2>/dev/null; then
    echo "✅ Configuración nginx válida"
else
    echo "❌ Error en configuración nginx"
    nginx -t
    exit 1
fi

# Recargar nginx
echo "🔄 Recargando nginx..."
if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
    echo "✅ Nginx recargado exitosamente"
else
    echo "❌ Error recargando nginx"
    exit 1
fi

# Verificar que el backend esté corriendo
echo "🔍 Verificando backend en puerto 8000..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend FastAPI corriendo correctamente"
else
    echo "⚠️  Backend no responde - verificar que esté corriendo"
    echo "💡 Comando para levantar: cd /ruta/al/backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
fi

echo ""
echo "🎉 CONFIGURACIÓN ANTI-MIXED CONTENT COMPLETADA"
echo "============================================="
echo "✅ Headers Strict-Transport-Security aplicados"
echo "✅ Content-Security-Policy: upgrade-insecure-requests"
echo "✅ X-Forwarded-Proto forzado a HTTPS"
echo "✅ Configuración nginx recargada"
echo ""
echo "🌐 Prueba tu CRM en: https://crm.arifamilyassets.com"
echo "🔒 Los errores de Mixed Content deberían eliminarse"
echo ""
echo "📊 Para verificar:"
echo "   1. Abre DevTools → Console"
echo "   2. Recarga con Ctrl+Shift+R"
echo "   3. Los errores HTTP deberían desaparecer"