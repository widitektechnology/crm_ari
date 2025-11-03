#!/bin/bash

# Despliegue directo sin Docker Compose
# Para servidores con Docker básico

set -e

echo "🚀 Despliegue Directo - Sistema ERP"
echo "====================================="

WORK_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com"
cd "$WORK_DIR"

# Detener contenedores existentes
echo "🛑 Limpiando contenedores anteriores..."
docker stop erp_mysql erp_backend erp_frontend 2>/dev/null || true
docker rm erp_mysql erp_backend erp_frontend 2>/dev/null || true

# Crear red personalizada
echo "🌐 Creando red..."
docker network create erp_network 2>/dev/null || true

# Iniciar MySQL
echo "🗄️  Iniciando MySQL..."
docker run -d \
    --name erp_mysql \
    --network erp_network \
    --restart always \
    -e MYSQL_ROOT_PASSWORD=SecureRootPass2024! \
    -e MYSQL_DATABASE=erp_system \
    -e MYSQL_USER=erp_user \
    -e MYSQL_PASSWORD=SecurePass2024! \
    -p 3306:3306 \
    -v erp_mysql_data:/var/lib/mysql \
    mysql:8.0 \
    --default-authentication-plugin=mysql_native_password \
    --character-set-server=utf8mb4 \
    --collation-server=utf8mb4_unicode_ci

echo "⏳ Esperando MySQL (60 segundos)..."
sleep 60

# Verificar MySQL
echo "🔍 Verificando MySQL..."
for i in {1..10}; do
    if docker exec erp_mysql mysqladmin ping -h localhost --silent; then
        echo "✅ MySQL está listo"
        break
    fi
    echo "⏳ Esperando MySQL... intento $i/10"
    sleep 10
done

# Construir y ejecutar Backend
echo "🐍 Construyendo Backend..."
docker build -t erp_backend ./backend

echo "🐍 Iniciando Backend..."
docker run -d \
    --name erp_backend \
    --network erp_network \
    --restart always \
    -e DATABASE_URL=mysql://erp_user:SecurePass2024!@erp_mysql:3306/erp_system \
    -e SECRET_KEY=erp-production-secret-2024 \
    -e DEBUG=False \
    -e CORS_ORIGINS=https://crm.arifamilyassets.com,http://localhost:3000 \
    -e JWT_SECRET_KEY=jwt-production-secret-2024 \
    -e LOG_LEVEL=INFO \
    -p 8000:8000 \
    -v "$WORK_DIR/backend/uploads:/app/uploads" \
    erp_backend

echo "⏳ Esperando Backend (30 segundos)..."
sleep 30

# Verificar Backend
echo "🔍 Verificando Backend..."
for i in {1..5}; do
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        echo "✅ Backend está listo"
        break
    fi
    echo "⏳ Esperando Backend... intento $i/5"
    sleep 10
done

# Construir y ejecutar Frontend
echo "⚛️  Construyendo Frontend..."
docker build -t erp_frontend ./frontend

echo "⚛️  Iniciando Frontend..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    --restart always \
    -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
    -e NODE_ENV=production \
    -p 3000:3000 \
    erp_frontend

echo "⏳ Esperando Frontend (20 segundos)..."
sleep 20

# Verificar servicios
echo ""
echo "📊 Estado de los servicios:"
echo "================================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Verificando conectividad..."

# MySQL
if docker exec erp_mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo "✅ MySQL: Funcionando correctamente"
else
    echo "❌ MySQL: Error de conexión"
fi

# Backend
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend: Funcionando correctamente"
    echo "   📚 API Docs: http://localhost:8000/docs"
else
    echo "❌ Backend: Error de conexión"
    echo "   📋 Ver logs: docker logs erp_backend"
fi

# Frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend: Funcionando correctamente"
else
    echo "⚠️  Frontend: Iniciando o con problemas"
    echo "   📋 Ver logs: docker logs erp_frontend"
fi

echo ""
echo "🎉 ¡Despliegue Completado!"
echo "=========================="
echo "🌐 Aplicación: http://localhost:3000"
echo "🔧 API Backend: http://localhost:8000"
echo "📚 Documentación: http://localhost:8000/docs"
echo "🗄️  Base de datos: localhost:3306"
echo ""
echo "🔧 Comandos útiles:"
echo "   docker ps                    # Ver contenedores"
echo "   docker logs erp_backend -f   # Logs backend"
echo "   docker logs erp_frontend -f  # Logs frontend"
echo "   docker logs erp_mysql -f     # Logs MySQL"
echo ""
echo "🛑 Para detener:"
echo "   docker stop erp_frontend erp_backend erp_mysql"
echo ""

# Mostrar logs si hay problemas
if ! curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "⚠️  Backend no responde. Mostrando logs:"
    docker logs erp_backend --tail 20
fi