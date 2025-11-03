#!/bin/bash

# Instalador rápido de Docker Compose

echo "📦 Instalando Docker Compose..."

# Verificar si somos root
if [ "$EUID" -ne 0 ]; then
    echo "Necesitas permisos de root. Ejecuta:"
    echo "sudo bash install-compose.sh"
    exit 1
fi

# Descargar Docker Compose
echo "⬇️  Descargando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Hacer ejecutable
chmod +x /usr/local/bin/docker-compose

# Crear enlace simbólico
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verificar instalación
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose instalado correctamente"
    docker-compose --version
    
    echo ""
    echo "🚀 Ahora puedes usar:"
    echo "   docker-compose -f docker-compose.simple.yml up -d"
else
    echo "❌ Error en la instalación"
fi