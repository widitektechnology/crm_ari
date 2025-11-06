#!/bin/bash

# =====================================================
# SCRIPT DE DEPLOYMENT PARA SERVIDOR LINUX PRODUCCIÓN
# CRM ARI Family Assets - Con Base de Datos MySQL
# =====================================================

set -e  # Salir si cualquier comando falla

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Variables - Plesk Structure
PROJECT_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
SERVICE_NAME="crm-ari-backend"
NGINX_CONFIG="/var/www/vhosts/system/arifamilyassets.com/conf/nginx.conf"

print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "  CRM ARI FAMILY ASSETS - DEPLOYMENT LINUX"
    echo "  Base de Datos MySQL + Autenticación JWT"
    echo "=================================================="
    echo -e "${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si se ejecuta como root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "No ejecutes este script como root. Usa un usuario con sudo."
        exit 1
    fi
}

# Verificar dependencias del sistema
check_system_dependencies() {
    print_status "Verificando dependencias del sistema..."
    
    # Verificar Python 3
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 no está instalado"
        exit 1
    fi
    
    # Verificar MySQL
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL client no encontrado. Instalando..."
        sudo apt-get update
        sudo apt-get install -y mysql-client
    fi
    
    # Verificar Node.js para el frontend
    if ! command -v node &> /dev/null; then
        print_warning "Node.js no encontrado. Instalando..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Verificar Nginx
    if ! command -v nginx &> /dev/null; then
        print_warning "Nginx no encontrado. Instalando..."
        sudo apt-get install -y nginx
    fi
    
    print_success "Dependencias del sistema verificadas"
}

# Preparar entorno Python
setup_python_env() {
    print_status "Configurando entorno Python..."
    
    cd "$BACKEND_DIR"
    
    # Crear entorno virtual
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Entorno virtual creado"
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Actualizar pip
    pip install --upgrade pip setuptools wheel
    
    # Instalar dependencias
    pip install -r requirements.txt
    
    print_success "Entorno Python configurado"
}

# Configurar base de datos
setup_database() {
    print_status "Verificando configuración de base de datos..."
    
    # Verificar conexión a MySQL
    if ! mysql -u root -p -e "SELECT 1;" &> /dev/null; then
        print_error "No se puede conectar a MySQL. Verifica las credenciales."
        return 1
    fi
    
    # Verificar que la base de datos existe
    if ! mysql -u root -p -e "USE crm_ari;" &> /dev/null; then
        print_warning "Base de datos crm_ari no existe. Créala manualmente."
        return 1
    fi
    
    print_success "Base de datos verificada"
}

# Verificar instalación
verify_installation() {
    print_status "Verificando instalación..."
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Ejecutar script de verificación
    if python verify_installation.py; then
        print_success "Verificación completada exitosamente"
    else
        print_error "Verificación falló. Revisa los errores anteriores."
        return 1
    fi
}

# Configurar servicio systemd
setup_systemd_service() {
    print_status "Configurando servicio systemd..."
    
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=CRM ARI Backend API
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$BACKEND_DIR
Environment=PATH=$BACKEND_DIR/venv/bin
ExecStart=$BACKEND_DIR/venv/bin/python main.py
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10

# Logs
StandardOutput=journal
StandardError=journal
SyslogIdentifier=crm-ari-backend

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=$BACKEND_DIR
ProtectHome=yes

[Install]
WantedBy=multi-user.target
EOF

    # Recargar systemd y habilitar servicio
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    
    print_success "Servicio systemd configurado"
}

# Configurar Nginx
setup_nginx() {
    print_status "Configurando Nginx..."
    
    sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name crm.arifamilyassets.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.arifamilyassets.com;
    
    # SSL Configuration (ajustar rutas de certificados)
    ssl_certificate /etc/ssl/certs/crm.arifamilyassets.com.crt;
    ssl_certificate_key /etc/ssl/private/crm.arifamilyassets.com.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React)
    location / {
        root $FRONTEND_DIR/out;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000;
        access_log off;
    }
    
    # Docs (protegidas)
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security
    location = /robots.txt {
        add_header Content-Type text/plain;
        return 200 "User-agent: *\nDisallow: /api/\nDisallow: /docs\nDisallow: /redoc\n";
    }
}
EOF

    # Habilitar sitio
    sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    
    # Verificar configuración
    if sudo nginx -t; then
        print_success "Configuración de Nginx válida"
    else
        print_error "Error en configuración de Nginx"
        return 1
    fi
}

# Deployment principal
main() {
    print_header
    
    check_root
    check_system_dependencies
    setup_python_env
    setup_database
    verify_installation
    setup_systemd_service
    setup_nginx
    
    print_header
    print_success "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
    echo ""
    print_status "PRÓXIMOS PASOS:"
    echo "1. Configura los certificados SSL en Nginx"
    echo "2. Inicia el servicio: sudo systemctl start $SERVICE_NAME"
    echo "3. Recarga Nginx: sudo systemctl reload nginx"
    echo "4. Verifica el estado: sudo systemctl status $SERVICE_NAME"
    echo ""
    print_status "COMANDOS ÚTILES:"
    echo "• Ver logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "• Reiniciar: sudo systemctl restart $SERVICE_NAME"
    echo "• Estado: sudo systemctl status $SERVICE_NAME"
    echo "• Verificar API: curl http://localhost:8000/health"
    echo ""
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi