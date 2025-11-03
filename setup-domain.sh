#!/bin/bash

# ============================================================================
# 🌐 Script de Configuración para Dominio - ERP
# ============================================================================

echo "🌐 Configuración del Sistema ERP para crm.arifamilyassets.com"
echo "============================================================="

DOMAIN="crm.arifamilyassets.com"
BACKEND_PORT=8000
FRONTEND_PORT=3001

echo "📋 Configurando dominio: $DOMAIN"
echo "   Backend interno: localhost:$BACKEND_PORT"
echo "   Frontend interno: localhost:$FRONTEND_PORT"

# Crear archivo de configuración para Apache (Plesk usa Apache por defecto)
echo ""
echo "⚙️ Creando configuración de Apache para proxy reverso..."

cat > apache-config.conf << 'EOF'
# Configuración de Apache para ERP System
# Agregar al Virtual Host de crm.arifamilyassets.com en Plesk

# Habilitar módulos necesarios (ya están habilitados en Plesk normalmente)
# LoadModule proxy_module modules/mod_proxy.so
# LoadModule proxy_http_module modules/mod_proxy_http.so
# LoadModule headers_module modules/mod_headers.so

# Configuración para el Frontend (página principal)
ProxyPreserveHost On
ProxyRequests Off

# Frontend - Página principal
ProxyPass / http://localhost:3001/
ProxyPassReverse / http://localhost:3001/

# API Backend - Rutas /api y /docs
ProxyPass /api/ http://localhost:8000/api/
ProxyPassReverse /api/ http://localhost:8000/api/

ProxyPass /docs http://localhost:8000/docs
ProxyPassReverse /docs http://localhost:8000/docs

ProxyPass /openapi.json http://localhost:8000/openapi.json
ProxyPassReverse /openapi.json http://localhost:8000/openapi.json

ProxyPass /health http://localhost:8000/health
ProxyPassReverse /health http://localhost:8000/health

ProxyPass /status http://localhost:8000/status
ProxyPassReverse /status http://localhost:8000/status

# Headers para CORS y WebSocket support
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Configuración para archivos estáticos del frontend
ProxyPass /_next/ http://localhost:3001/_next/
ProxyPassReverse /_next/ http://localhost:3001/_next/

ProxyPass /static/ http://localhost:3001/static/
ProxyPassReverse /static/ http://localhost:3001/static/
EOF

# Crear configuración para Nginx (alternativa si Plesk usa Nginx)
echo ""
echo "⚙️ Creando configuración de Nginx (alternativa)..."

cat > nginx-config.conf << 'EOF'
# Configuración de Nginx para ERP System
# Agregar al server block de crm.arifamilyassets.com

location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support si es necesario
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

location /api/ {
    proxy_pass http://localhost:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /docs {
    proxy_pass http://localhost:8000/docs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /openapi.json {
    proxy_pass http://localhost:8000/openapi.json;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /health {
    proxy_pass http://localhost:8000/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /status {
    proxy_pass http://localhost:8000/status;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

# Crear archivo .htaccess para el directorio web
echo ""
echo "📄 Creando archivo .htaccess..."

cat > .htaccess << 'EOF'
# .htaccess para ERP System
# Colocar en el directorio web de crm.arifamilyassets.com

RewriteEngine On

# Proxy para API Backend
RewriteRule ^api/(.*)$ http://localhost:8000/api/$1 [P,L]
RewriteRule ^docs$ http://localhost:8000/docs [P,L]
RewriteRule ^openapi\.json$ http://localhost:8000/openapi.json [P,L]
RewriteRule ^health$ http://localhost:8000/health [P,L]
RewriteRule ^status$ http://localhost:8000/status [P,L]

# Todo lo demás va al frontend
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]

# Headers CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
EOF

# Actualizar configuración de contenedores para el dominio
echo ""
echo "🐳 Actualizando configuración de contenedores..."

# Recrear backend con configuración de dominio
docker stop erp_backend 2>/dev/null || true
docker rm erp_backend 2>/dev/null || true

docker run -d \
    --name erp_backend \
    --network erp_network \
    -p 8000:8000 \
    -e DATABASE_URL="mysql://erp_user:erp_user_pass@erp_mysql:3306/erp_system" \
    -e DOMAIN="$DOMAIN" \
    -e CORS_ORIGINS="https://$DOMAIN,http://$DOMAIN,https://www.$DOMAIN" \
    --restart unless-stopped \
    erp_backend_fixed

# Recrear frontend con configuración de dominio
docker stop erp_frontend 2>/dev/null || true
docker rm erp_frontend 2>/dev/null || true

docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p 3001:3000 \
    -e NEXT_PUBLIC_API_URL="https://$DOMAIN" \
    -e DOMAIN="$DOMAIN" \
    --restart unless-stopped \
    erp_frontend

echo ""
echo "✅ Configuración completada para $DOMAIN"
echo "========================================"

echo ""
echo "📋 Archivos de configuración creados:"
echo "   📄 apache-config.conf  - Para Apache/Plesk"
echo "   📄 nginx-config.conf   - Para Nginx (alternativa)"
echo "   📄 .htaccess          - Para directorio web"

echo ""
echo "🔧 Pasos a seguir en Plesk:"
echo "1. Ir a Dominios > $DOMAIN > Apache & nginx Settings"
echo "2. Copiar contenido de apache-config.conf en 'Additional directives for HTTP'"
echo "3. O subir .htaccess al directorio httpdocs/"
echo "4. Verificar que los puertos $BACKEND_PORT y $FRONTEND_PORT estén abiertos"

echo ""
echo "🧪 URLs de prueba después de configurar Plesk:"
echo "   🌐 https://$DOMAIN (Frontend)"
echo "   🐍 https://$DOMAIN/api/employees (API)"
echo "   📚 https://$DOMAIN/docs (Documentación)"
echo "   🔍 https://$DOMAIN/health (Health Check)"

echo ""
echo "🛠️ Comandos de verificación:"
echo "   curl https://$DOMAIN/health"
echo "   curl https://$DOMAIN/api/employees"

echo ""
echo "⚠️  Nota importante:"
echo "   - Asegúrate de que SSL esté configurado en Plesk para $DOMAIN"
echo "   - Los contenedores Docker deben estar corriendo"
echo "   - Verifica que no haya firewall bloqueando los puertos"

# Verificar estado de contenedores
echo ""
echo "📊 Estado actual de contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"