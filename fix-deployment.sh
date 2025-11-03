#!/bin/bash

# ============================================================================
# 🔧 Script de Reparación Rápida - ERP
# ============================================================================

echo "🔧 Reparación Rápida - Sistema ERP"
echo "=================================="

# Detener contenedores problemáticos
echo "🛑 Deteniendo contenedores..."
docker stop erp_backend erp_frontend erp_mysql 2>/dev/null || true
docker rm erp_backend erp_frontend erp_mysql 2>/dev/null || true

# Limpiar imágenes problemáticas
echo "🧹 Limpiando imágenes..."
docker rmi erp_backend erp_frontend 2>/dev/null || true

# Crear requirements.txt corregido
echo "📦 Creando requirements.txt optimizado..."
cat > backend/requirements-fix.txt << 'EOF'
# Core Framework
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.5.0

# Database
SQLAlchemy>=2.0.0
PyMySQL>=1.1.0

# HTTP Client
httpx>=0.25.0
requests>=2.31.0

# Authentication
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6

# AI Basic
scikit-learn>=1.3.0
pandas>=2.1.0
numpy>=1.24.0
nltk>=3.8.1

# Configuration
python-dotenv>=1.0.0

# Utilities
python-dateutil>=2.8.2
pytz>=2023.3
EOF

# Crear Dockerfile simplificado
echo "🐳 Creando Dockerfile optimizado..."
cat > backend/Dockerfile.simple << 'EOF'
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-fix.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Configurar red
echo "🌐 Configurando red..."
docker network create erp_network 2>/dev/null || true

# Verificar MySQL existente
if mysql -h localhost -P 3306 -e "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL encontrado en localhost:3306"
    MYSQL_HOST="host.docker.internal"
    USE_EXTERNAL_MYSQL=true
else
    echo "🗄️  Iniciando MySQL en contenedor..."
    docker run -d \
        --name erp_mysql \
        --network erp_network \
        -p 3307:3306 \
        -e MYSQL_ROOT_PASSWORD=erp_password_123 \
        -e MYSQL_DATABASE=erp_system \
        -e MYSQL_USER=erp_user \
        -e MYSQL_PASSWORD=erp_user_pass \
        mysql:8.0
    MYSQL_HOST="erp_mysql"
    USE_EXTERNAL_MYSQL=false
    echo "⏳ Esperando MySQL..."
    sleep 20
fi

# Construir Backend
echo "🐍 Construyendo Backend..."
docker build -f backend/Dockerfile.simple -t erp_backend backend/

# Ejecutar Backend
echo "🚀 Iniciando Backend..."
if [ "$USE_EXTERNAL_MYSQL" = true ]; then
    docker run -d \
        --name erp_backend \
        --network host \
        -p 8000:8000 \
        -e DATABASE_URL="mysql://root:password@localhost:3306/erp_system" \
        erp_backend
else
    docker run -d \
        --name erp_backend \
        --network erp_network \
        -p 8000:8000 \
        -e DATABASE_URL="mysql://erp_user:erp_user_pass@erp_mysql:3306/erp_system" \
        erp_backend
fi

# Construir Frontend
echo "🌐 Construyendo Frontend..."
docker build -t erp_frontend frontend/

# Ejecutar Frontend
echo "🚀 Iniciando Frontend..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p 3000:3000 \
    -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
    erp_frontend

echo ""
echo "✅ ¡Reparación completada!"
echo "========================"
echo "🐍 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🔍 Verificar logs:"
echo "   docker logs erp_backend"
echo "   docker logs erp_frontend"
echo ""
echo "🛠️  Comandos útiles:"
echo "   docker ps                    # Ver contenedores activos"
echo "   docker logs -f erp_backend   # Ver logs en tiempo real"
echo "   docker exec -it erp_backend bash  # Acceder al contenedor"
echo ""