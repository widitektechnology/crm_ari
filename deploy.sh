#!/bin/bash

# Script de despliegue para el Sistema ERP
# Uso: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="erp-sistema"

echo "🚀 Iniciando despliegue del Sistema ERP en modo: $ENVIRONMENT"

# Verificar si Docker Compose está disponible
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Error: Docker Compose no está disponible"
    echo "Instala Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Usando comando: $COMPOSE_CMD"

# Función para mostrar logs
show_logs() {
    echo "📋 Mostrando logs de los servicios..."
    $COMPOSE_CMD logs -f
}

# Función para detener servicios
stop_services() {
    echo "🛑 Deteniendo servicios..."
    $COMPOSE_CMD down
}

# Función para limpiar contenedores y volúmenes
cleanup() {
    echo "🧹 Limpiando contenedores y volúmenes..."
    $COMPOSE_CMD down -v --remove-orphans
    docker system prune -f
}

# Configurar variables de entorno según el ambiente
if [ "$ENVIRONMENT" = "production" ]; then
    export COMPOSE_FILE="docker-compose.yml:docker-compose.prod.yml"
    echo "🌐 Configurando para PRODUCCIÓN"
else
    export COMPOSE_FILE="docker-compose.yml"
    echo "🔧 Configurando para DESARROLLO"
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p backend/uploads
mkdir -p mysql_data
mkdir -p redis_data

# Verificar archivos de configuración
echo "⚙️ Verificando configuración..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Archivo backend/.env no encontrado, copiando desde ejemplo..."
    cp backend/env.example backend/.env
    echo "🔐 Por favor, edita backend/.env con tus configuraciones"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Archivo frontend/.env.local no encontrado, creando..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
fi

# Construir e iniciar servicios
echo "🔨 Construyendo imágenes..."
$COMPOSE_CMD build --no-cache

echo "⬆️  Iniciando servicios..."
$COMPOSE_CMD up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "📊 Estado de los servicios:"
$COMPOSE_CMD ps

# Mostrar URLs de acceso
echo ""
echo "🎉 ¡Despliegue completado!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend (Dashboard): http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Documentación API: http://localhost:8000/docs"
echo "🗃️  MySQL: localhost:3306"
echo "🔴 Redis: localhost:6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Opciones adicionales
echo "Comandos útiles:"
echo "  Ver logs: $COMPOSE_CMD logs -f"
echo "  Detener: $COMPOSE_CMD down"
echo "  Reiniciar: $COMPOSE_CMD restart"
echo "  Shell backend: $COMPOSE_CMD exec backend bash"
echo "  Shell frontend: $COMPOSE_CMD exec frontend sh"
echo ""

# Preguntar si quiere ver los logs
read -p "¿Deseas ver los logs en tiempo real? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    show_logs
fi