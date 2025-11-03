#!/bin/bash

# Script de instalación y configuración para Docker Compose
# Compatible con Ubuntu/Debian

echo "🔧 Configurando Docker Compose para Sistema ERP"
echo "================================================"

# Verificar si somos root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root"
    echo "Usa: sudo bash setup-docker.sh"
    exit 1
fi

# Actualizar sistema
echo "📦 Actualizando sistema..."
apt-get update

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando Docker..."
    
    # Instalar Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    
    echo "✅ Docker instalado"
else
    echo "✅ Docker encontrado: $(docker --version)"
fi

# Verificar Docker Compose
echo "🔍 Verificando Docker Compose..."

if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose encontrado: $(docker-compose --version)"
elif docker compose version &> /dev/null 2>&1; then
    echo "✅ docker compose integrado encontrado"
else
    echo "📥 Instalando Docker Compose..."
    
    # Instalar docker-compose standalone
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Crear symlink si no existe
    if [ ! -f /usr/bin/docker-compose ]; then
        ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
    
    echo "✅ Docker Compose instalado: $(docker-compose --version)"
fi

# Agregar usuario actual al grupo docker (si no es root)
if [ -n "$SUDO_USER" ]; then
    echo "👤 Agregando usuario $SUDO_USER al grupo docker..."
    usermod -aG docker $SUDO_USER
    echo "✅ Usuario agregado. Debe cerrar sesión y volver a entrar."
fi

# Crear directorio de trabajo
WORK_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com"
cd "$WORK_DIR"

echo "📁 Directorio de trabajo: $WORK_DIR"

# Crear archivos de configuración
echo "📝 Creando configuraciones..."

# Backend .env
cat > backend/.env << 'EOF'
DATABASE_URL=mysql://erp_user:SecurePass2024!@mysql:3306/erp_system
SECRET_KEY=erp-production-secret-key-2024-$(date +%s)
DEBUG=False
CORS_ORIGINS=https://crm.arifamilyassets.com,http://localhost:3000
JWT_SECRET_KEY=jwt-production-secret-2024
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=3600
LOG_LEVEL=INFO
EOF

# Frontend .env.local
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://crm.arifamilyassets.com/api
EOF

# Crear directorio uploads
mkdir -p backend/uploads
chmod 755 backend/uploads

# Ajustar permisos
chown -R www-data:www-data .
chmod -R 755 .

echo ""
echo "🎉 Configuración completada!"
echo "=============================="
echo ""
echo "📋 Comandos disponibles:"
echo "   docker-compose --version    # Verificar versión"
echo "   docker-compose up -d        # Iniciar servicios"
echo "   docker-compose ps           # Ver estado"
echo "   docker-compose logs -f      # Ver logs"
echo "   docker-compose down         # Detener servicios"
echo ""
echo "🚀 Para iniciar el sistema:"
echo "   cd $WORK_DIR"
echo "   docker-compose -f docker-compose.simple.yml up -d"
echo ""