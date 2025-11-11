#!/bin/bash
# 🚀 ARREGLAR NGINX PARA SPA REACT

echo "🔧 CONFIGURANDO NGINX PARA SPA REACT..."

# Hacer backup de configuración actual
echo "📋 1. Haciendo backup de configuración actual..."
cp /etc/nginx/sites-available/crm.arifamilyassets.com /etc/nginx/sites-available/crm.arifamilyassets.com.backup.$(date +%Y%m%d_%H%M%S)

# Configuración mejorada para SPA
echo "⚙️ 2. Aplicando nueva configuración SPA..."
cat > /etc/nginx/sites-available/crm.arifamilyassets.com << 'EOF'
server {
    listen 80;
    listen 443 ssl;
    server_name crm.arifamilyassets.com;

    root /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com;
    index index.html;

    # CRÍTICO: Configuración para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy para API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
EOF

echo "🔄 3. Verificando sintaxis de Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida"
    echo "🔄 4. Recargando Nginx..."
    systemctl reload nginx
    echo "✅ Nginx recargado"
else
    echo "❌ Error en configuración de Nginx"
    echo "🔄 Restaurando backup..."
    cp /etc/nginx/sites-available/crm.arifamilyassets.com.backup.* /etc/nginx/sites-available/crm.arifamilyassets.com
    exit 1
fi

echo ""
echo "✅ NGINX CONFIGURADO PARA SPA"
echo ""
echo "🧪 PRUEBAS A REALIZAR:"
echo "1. https://crm.arifamilyassets.com/ (debe cargar)"
echo "2. https://crm.arifamilyassets.com/login (debe cargar sin 404)"
echo "3. Refresh en cualquier página (debe funcionar)"
echo "4. CSS debe cargar en modo incógnito"
echo ""
echo "📋 La configuración clave es:"
echo "   try_files \$uri \$uri/ /index.html;"
echo ""