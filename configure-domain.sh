#!/bin/bash

# ============================================================================
# 🌐 Configuración para Dominio crm.arifamilyassets.com - ERP
# ============================================================================

echo "🌐 Configurando ERP para crm.arifamilyassets.com"
echo "==============================================="

DOMAIN="crm.arifamilyassets.com"
BACKEND_PORT=8000
FRONTEND_PORT=3001
MYSQL_PORT=3307

echo "🔧 Configurando variables de entorno para dominio..."

# Detener contenedores para reconfiguración
echo "🛑 Deteniendo contenedores para reconfiguración..."
docker stop erp_frontend erp_backend 2>/dev/null || true
docker rm erp_frontend erp_backend 2>/dev/null || true

# Reconfigurar Frontend con nueva URL
echo "🌐 Reconfigurando Frontend para dominio..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p $FRONTEND_PORT:3000 \
    -e NEXT_PUBLIC_API_URL="https://$DOMAIN/api" \
    -e NODE_ENV="production" \
    --restart unless-stopped \
    erp_frontend

# Reconfigurar Backend
echo "🐍 Reconfigurando Backend para dominio..."
docker run -d \
    --name erp_backend \
    --network erp_network \
    -p $BACKEND_PORT:8000 \
    -e DATABASE_URL="mysql://erp_user:erp_user_pass@erp_mysql:3306/erp_system" \
    -e DOMAIN="$DOMAIN" \
    -e ALLOWED_HOSTS="$DOMAIN,localhost,127.0.0.1" \
    --restart unless-stopped \
    erp_backend_fixed

echo ""
echo "📋 Creando configuración para Plesk..."

# Crear archivo de configuración Nginx para Plesk
cat > plesk-nginx-config.conf << 'EOF'
# Configuración Nginx para crm.arifamilyassets.com
# Colocar en: /var/www/vhosts/arifamilyassets.com/conf/vhost_nginx.conf

server {
    listen 80;
    listen [::]:80;
    server_name crm.arifamilyassets.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name crm.arifamilyassets.com;

    # SSL configurado por Plesk automáticamente
    
    # Frontend - Aplicación principal
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Documentación API
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # OpenAPI JSON
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs de acceso y error
    access_log /var/www/vhosts/arifamilyassets.com/logs/crm_access.log;
    error_log /var/www/vhosts/arifamilyassets.com/logs/crm_error.log;
}
EOF

# Crear script de instalación para Plesk
cat > install-plesk.sh << 'EOF'
#!/bin/bash
echo "🔧 Instalación de configuración Plesk para crm.arifamilyassets.com"
echo "================================================================="

# Verificar que estamos en el directorio correcto
if [ ! -d "/var/www/vhosts/arifamilyassets.com" ]; then
    echo "❌ Error: Directorio /var/www/vhosts/arifamilyassets.com no encontrado"
    echo "   Asegúrate de que el dominio esté configurado en Plesk"
    exit 1
fi

# Crear subdirectorio para el subdominio si no existe
echo "📁 Creando estructura de directorios..."
mkdir -p /var/www/vhosts/arifamilyassets.com/subdomains/crm/httpdocs
mkdir -p /var/www/vhosts/arifamilyassets.com/subdomains/crm/conf
mkdir -p /var/www/vhosts/arifamilyassets.com/subdomains/crm/logs

# Copiar configuración Nginx
echo "📝 Instalando configuración Nginx..."
cp plesk-nginx-config.conf /var/www/vhosts/arifamilyassets.com/subdomains/crm/conf/vhost_nginx.conf

# Crear archivo de mantenimiento de emergencia
echo "🛠️ Creando página de mantenimiento..."
cat > /var/www/vhosts/arifamilyassets.com/subdomains/crm/httpdocs/maintenance.html << 'MAINTENANCE'
<!DOCTYPE html>
<html>
<head>
    <title>Sistema ERP - Mantenimiento</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #2563eb; }
        .status { padding: 20px; background: #f0f8ff; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Sistema ERP</h1>
        <div class="status">
            <h2>Sistema en mantenimiento</h2>
            <p>El sistema ERP está siendo configurado.</p>
            <p>Volveremos pronto.</p>
        </div>
        <p><small>crm.arifamilyassets.com</small></p>
    </div>
</body>
</html>
MAINTENANCE

# Instrucciones para Plesk
echo ""
echo "✅ Archivos creados exitosamente"
echo ""
echo "📋 INSTRUCCIONES PARA PLESK:"
echo "============================"
echo ""
echo "1. 🌐 En Plesk Panel:"
echo "   - Ir a 'Sitios web y dominios'"
echo "   - Buscar 'arifamilyassets.com'"
echo "   - Hacer clic en 'Subdominios'"
echo "   - Crear subdominio 'crm'"
echo ""
echo "2. 🔧 Configurar subdominio:"
echo "   - Nombre: crm"
echo "   - Directorio raíz: /subdomains/crm/httpdocs"
echo "   - Activar SSL (Let's Encrypt)"
echo ""
echo "3. 📝 Aplicar configuración Nginx:"
echo "   - En el subdominio crm, ir a 'Configuración de Apache y nginx'"
echo "   - En 'Directivas adicionales de nginx', pegar el contenido de:"
echo "     /var/www/vhosts/arifamilyassets.com/subdomains/crm/conf/vhost_nginx.conf"
echo ""
echo "4. 🔄 Reiniciar servicios:"
echo "   - En Plesk: 'Herramientas y configuraciones' > 'Servicios' > Reiniciar nginx"
echo ""
echo "5. 🧪 Probar la configuración:"
echo "   - Visitar: https://crm.arifamilyassets.com"
echo "   - API: https://crm.arifamilyassets.com/api/health"
echo "   - Docs: https://crm.arifamilyassets.com/docs"
echo ""
EOF

chmod +x install-plesk.sh

# Crear archivo de configuración para variables de entorno
cat > .env.production << EOF
# Configuración de producción para crm.arifamilyassets.com
DOMAIN=crm.arifamilyassets.com
API_URL=https://crm.arifamilyassets.com/api
FRONTEND_URL=https://crm.arifamilyassets.com
DATABASE_URL=mysql://erp_user:erp_user_pass@127.0.0.1:3307/erp_system
ALLOWED_HOSTS=crm.arifamilyassets.com,localhost,127.0.0.1
CORS_ORIGINS=https://crm.arifamilyassets.com,https://arifamilyassets.com
NODE_ENV=production
DEBUG=false
EOF

# Verificar estado de contenedores
echo ""
echo "📋 Estado de contenedores reconfigurados:"
sleep 3
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Configuración para dominio completada"
echo "========================================"
echo ""
echo "📁 Archivos creados:"
echo "   - plesk-nginx-config.conf (configuración Nginx)"
echo "   - install-plesk.sh (script de instalación)"
echo "   - .env.production (variables de entorno)"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Ejecutar: ./install-plesk.sh"
echo "   2. Configurar subdominio 'crm' en Plesk"
echo "   3. Aplicar configuración Nginx en Plesk"
echo "   4. Activar SSL (Let's Encrypt)"
echo "   5. Probar: https://crm.arifamilyassets.com"
echo ""
echo "🔗 URLs que estarán disponibles:"
echo "   🌐 Frontend: https://crm.arifamilyassets.com"
echo "   🐍 API: https://crm.arifamilyassets.com/api/"
echo "   📚 Docs: https://crm.arifamilyassets.com/docs"
echo "   🔍 Health: https://crm.arifamilyassets.com/health"
echo ""
EOF