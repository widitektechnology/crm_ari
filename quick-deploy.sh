#!/bin/bash

# Script rápido de despliegue para servidor Ubuntu
# Uso: bash quick-deploy.sh

set -e

echo "🚀 Sistema ERP - Despliegue Rápido"
echo "=================================="

# Detectar comando de Docker Compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo "✅ Usando: docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo "✅ Usando: docker compose"
else
    echo "❌ Error: Docker Compose no disponible"
    echo "💡 Instalando Docker Compose..."
    
    # Instalar docker-compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    DOCKER_COMPOSE="docker-compose"
    echo "✅ Docker Compose instalado"
fi

# Crear archivos de configuración si no existen
echo "📝 Configurando archivos..."

if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
DATABASE_URL=mysql://erp_user:erp_password123@mysql:3306/erp_system
SECRET_KEY=production-secret-key-$(date +%s)
DEBUG=False
CORS_ORIGINS=http://localhost:3000,https://crm.arifamilyassets.com

JWT_SECRET_KEY=jwt-secret-$(date +%s)
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=3600

LOG_LEVEL=INFO
DEFAULT_API_TIMEOUT=30
MAX_RETRY_ATTEMPTS=3
EOF
    echo "✅ Archivo backend/.env creado"
fi

if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo "✅ Archivo frontend/.env.local creado"
fi

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p backend/uploads
mkdir -p logs
sudo chown -R $USER:$USER .

# Detener servicios existentes
echo "🛑 Deteniendo servicios existentes..."
$DOCKER_COMPOSE down 2>/dev/null || true

# Limpiar contenedores anteriores
echo "🧹 Limpiando contenedores anteriores..."
docker system prune -f 2>/dev/null || true

# Construir imágenes
echo "🔨 Construyendo imágenes..."
$DOCKER_COMPOSE build --no-cache

# Iniciar servicios
echo "⬆️  Iniciando servicios..."
$DOCKER_COMPOSE up -d

# Esperar y verificar
echo "⏳ Esperando servicios..."
sleep 15

echo "📊 Estado de los servicios:"
$DOCKER_COMPOSE ps

# Verificar conectividad
echo "🔍 Verificando servicios..."

# Verificar MySQL
if $DOCKER_COMPOSE exec mysql mysqladmin ping -h localhost --silent; then
    echo "✅ MySQL: Funcionando"
else
    echo "❌ MySQL: Error"
fi

# Verificar Backend
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend: Funcionando"
else
    echo "⚠️  Backend: Iniciando... (puede tardar unos minutos)"
fi

# Verificar Frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend: Funcionando"
else
    echo "⚠️  Frontend: Iniciando..."
fi

echo ""
echo "🎉 ¡Despliegue Completado!"
echo "========================="
echo "🌐 Frontend: http://localhost:3000"
echo "⚙️  Backend API: http://localhost:8000"
echo "📚 Documentación: http://localhost:8000/docs"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: $DOCKER_COMPOSE logs -f"
echo "   Reiniciar: $DOCKER_COMPOSE restart"
echo "   Detener: $DOCKER_COMPOSE down"
echo ""

# Mostrar logs si hay problemas
read -p "¿Ver logs en tiempo real? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    $DOCKER_COMPOSE logs -f
fi