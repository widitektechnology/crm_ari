#!/bin/bash

# ============================================================================
# 🚀 Script de Despliegue ERP - Versión Optimizada para Producción
# ============================================================================

set -e  # Terminar en caso de error

echo "🚀 Despliegue ERP - Versión Optimizada"
echo "======================================"

# Limpiar contenedores anteriores
echo "🛑 Limpiando contenedores anteriores..."
docker stop erp_backend erp_frontend erp_mysql 2>/dev/null || true
docker rm erp_backend erp_frontend erp_mysql 2>/dev/null || true

# Configurar red
echo "🌐 Configurando red..."
docker network create erp_network 2>/dev/null || true

# Detectar puertos disponibles
echo "📋 Detectando puertos disponibles..."
MYSQL_PORT=3306
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Función para encontrar puerto libre
find_free_port() {
    local port=$1
    while docker ps --format "table {{.Ports}}" | grep -q ":$port->"; do
        port=$((port + 1))
    done
    echo $port
}

# Verificar si MySQL ya existe
if mysql -h localhost -P 3306 -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Usando MySQL existente en localhost:3306"
    MYSQL_HOST="host.docker.internal"
    MYSQL_PORT=3306
else
    echo "🗄️  Desplegando contenedor MySQL..."
    MYSQL_PORT=$(find_free_port 3306)
    docker run -d \
        --name erp_mysql \
        --network erp_network \
        -p $MYSQL_PORT:3306 \
        -e MYSQL_ROOT_PASSWORD=erp_password_123 \
        -e MYSQL_DATABASE=erp_system \
        -e MYSQL_USER=erp_user \
        -e MYSQL_PASSWORD=erp_user_pass \
        -v erp_mysql_data:/var/lib/mysql \
        mysql:8.0
    
    echo "⏳ Esperando MySQL..."
    sleep 30
    MYSQL_HOST="erp_mysql"
fi

# Construir Backend con requirements optimizado
echo "🐍 Construyendo Backend optimizado..."

# Crear Dockerfile temporal optimizado
cat > backend/Dockerfile.prod << EOF
FROM python:3.11-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    pkg-config \\
    default-libmysqlclient-dev \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \\
    default-libmysqlclient-dev \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

BACKEND_PORT=$(find_free_port 8000)
docker build -f backend/Dockerfile.prod -t erp_backend backend/

# Ejecutar Backend
echo "🚀 Iniciando Backend en puerto $BACKEND_PORT..."
docker run -d \
    --name erp_backend \
    --network erp_network \
    -p $BACKEND_PORT:8000 \
    -e DATABASE_URL="mysql://erp_user:erp_user_pass@$MYSQL_HOST:3306/erp_system" \
    -e MYSQL_HOST="$MYSQL_HOST" \
    -e MYSQL_PORT="3306" \
    -e MYSQL_USER="erp_user" \
    -e MYSQL_PASSWORD="erp_user_pass" \
    -e MYSQL_DATABASE="erp_system" \
    erp_backend

# Construir Frontend
echo "🌐 Construyendo Frontend..."
FRONTEND_PORT=$(find_free_port 3000)
docker build -t erp_frontend frontend/

# Ejecutar Frontend
echo "🚀 Iniciando Frontend en puerto $FRONTEND_PORT..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p $FRONTEND_PORT:3000 \
    -e NEXT_PUBLIC_API_URL="http://localhost:$BACKEND_PORT" \
    erp_frontend

# Esperar que los servicios estén listos
echo "⏳ Esperando servicios..."
sleep 10

# Mostrar status
echo ""
echo "✅ ¡Despliegue completado!"
echo "=========================="
echo "📊 Servicios disponibles:"
echo "   🗄️  MySQL: localhost:$MYSQL_PORT"
echo "   🐍 Backend: http://localhost:$BACKEND_PORT"
echo "   🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "🔗 URLs importantes:"
echo "   📊 Dashboard: http://localhost:$FRONTEND_PORT"
echo "   📚 API Docs: http://localhost:$BACKEND_PORT/docs"
echo "   🔍 API Health: http://localhost:$BACKEND_PORT/health"
echo ""
echo "🐳 Gestión de contenedores:"
echo "   Ver logs Backend: docker logs -f erp_backend"
echo "   Ver logs Frontend: docker logs -f erp_frontend"
echo "   Parar servicios: docker stop erp_backend erp_frontend erp_mysql"
echo ""

# Test de conectividad
echo "🧪 Probando conectividad..."
if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "✅ Backend respondiendo correctamente"
else
    echo "⚠️  Backend aún iniciando... (normal en primer despliegue)"
fi

echo "🎉 Sistema ERP listo para usar!"