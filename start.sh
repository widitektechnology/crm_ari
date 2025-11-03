#!/bin/bash

# Script de inicio para el Sistema ERP
# Compatible con diferentes versiones de Docker Compose

echo "🚀 Iniciando Sistema ERP..."
echo "=============================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Detectar comando de compose disponible
COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    COMPOSE_FILE="docker-compose.simple.yml"
    echo "✅ Usando: docker-compose (versión clásica)"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
    COMPOSE_FILE="docker-compose.simple.yml"
    echo "✅ Usando: docker compose (versión integrada)"
else
    echo "❌ Docker Compose no disponible"
    echo "🔧 Intentando con comandos docker individuales..."
    
    # Método alternativo sin compose
    echo "🗃️  Iniciando MySQL..."
    docker run -d \
        --name erp_mysql \
        --restart always \
        -e MYSQL_ROOT_PASSWORD=rootpass123 \
        -e MYSQL_DATABASE=erp_system \
        -e MYSQL_USER=erp_user \
        -e MYSQL_PASSWORD=erp_password123 \
        -p 3306:3306 \
        -v erp_mysql_data:/var/lib/mysql \
        mysql:8.0 --default-authentication-plugin=mysql_native_password
    
    echo "⏳ Esperando MySQL..."
    sleep 20
    
    echo "🐍 Construyendo Backend..."
    docker build -t erp_backend ./backend
    
    echo "🐍 Iniciando Backend..."
    docker run -d \
        --name erp_backend \
        --restart always \
        --link erp_mysql:mysql \
        -e DATABASE_URL=mysql://erp_user:erp_password123@mysql:3306/erp_system \
        -e SECRET_KEY=mi-clave-secreta-2024 \
        -e DEBUG=False \
        -e CORS_ORIGINS=http://localhost:3000 \
        -p 8000:8000 \
        -v $(pwd)/backend/uploads:/app/uploads \
        erp_backend
    
    echo "⏳ Esperando Backend..."
    sleep 15
    
    echo "⚛️  Construyendo Frontend..."
    docker build -t erp_frontend ./frontend
    
    echo "⚛️  Iniciando Frontend..."
    docker run -d \
        --name erp_frontend \
        --restart always \
        --link erp_backend:backend \
        -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
        -p 3000:3000 \
        erp_frontend
    
    echo "✅ Servicios iniciados con comandos Docker individuales"
    
    # Mostrar estado
    echo "📊 Contenedores en ejecución:"
    docker ps | grep erp_
    
    exit 0
fi

# Si tenemos compose, usarlo
echo "📁 Usando archivo: $COMPOSE_FILE"

# Crear archivos de configuración
if [ ! -f "backend/.env" ]; then
    echo "📝 Creando configuración backend..."
    cat > backend/.env << 'EOF'
DATABASE_URL=mysql://erp_user:erp_password123@mysql:3306/erp_system
SECRET_KEY=mi-clave-secreta-2024
DEBUG=False
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
EOF
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creando configuración frontend..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
fi

# Crear directorio de uploads
mkdir -p backend/uploads

echo "🛑 Deteniendo servicios anteriores..."
$COMPOSE_CMD -f $COMPOSE_FILE down 2>/dev/null || true

echo "🔨 Construyendo servicios..."
$COMPOSE_CMD -f $COMPOSE_FILE build

echo "⬆️  Iniciando servicios..."
$COMPOSE_CMD -f $COMPOSE_FILE up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 30

echo "📊 Estado de los servicios:"
$COMPOSE_CMD -f $COMPOSE_FILE ps

echo ""
echo "🎉 ¡Sistema ERP iniciado!"
echo "========================="
echo "🌐 Frontend: http://localhost:3000"
echo "⚙️  Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️  MySQL: localhost:3306"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: $COMPOSE_CMD -f $COMPOSE_FILE logs -f"
echo "   Reiniciar: $COMPOSE_CMD -f $COMPOSE_FILE restart"
echo "   Detener: $COMPOSE_CMD -f $COMPOSE_FILE down"
echo ""

# Verificar servicios
echo "🔍 Verificando servicios..."
sleep 5

if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "⚠️  Backend: Iniciando..."
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "⚠️  Frontend: Iniciando..."
fi