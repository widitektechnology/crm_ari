#!/bin/bash

# Despliegue simple - Solo Backend y Frontend
# Usa MySQL existente del sistema

set -e

echo "🚀 Despliegue Simple - Sistema ERP"
echo "===================================="

WORK_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com"
cd "$WORK_DIR"

# Limpiar contenedores anteriores
echo "🛑 Limpiando contenedores anteriores..."
docker stop erp_backend erp_frontend 2>/dev/null || true
docker rm erp_backend erp_frontend 2>/dev/null || true

# Crear red
echo "🌐 Configurando red..."
docker network create erp_network 2>/dev/null || true

# Verificar MySQL existente
echo "🗄️  Verificando MySQL existente..."
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL no está ejecutándose. Iniciando..."
    systemctl start mysql
fi

echo "✅ MySQL está ejecutándose en el sistema"

# Configurar base de datos
echo "📝 Configurando base de datos..."

# Crear base de datos y usuario
mysql -e "CREATE DATABASE IF NOT EXISTS erp_system;" 2>/dev/null || true
mysql -e "CREATE USER IF NOT EXISTS 'erp_user'@'localhost' IDENTIFIED BY 'SecurePass2024!';" 2>/dev/null || true
mysql -e "CREATE USER IF NOT EXISTS 'erp_user'@'%' IDENTIFIED BY 'SecurePass2024!';" 2>/dev/null || true
mysql -e "GRANT ALL PRIVILEGES ON erp_system.* TO 'erp_user'@'localhost';" 2>/dev/null || true
mysql -e "GRANT ALL PRIVILEGES ON erp_system.* TO 'erp_user'@'%';" 2>/dev/null || true
mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true

echo "✅ Base de datos configurada"

# Crear archivos de configuración
cat > backend/.env << 'EOF'
DATABASE_URL=mysql://erp_user:SecurePass2024!@host.docker.internal:3306/erp_system
SECRET_KEY=erp-production-secret-2024
DEBUG=False
CORS_ORIGINS=https://crm.arifamilyassets.com,http://localhost:3000
JWT_SECRET_KEY=jwt-production-secret-2024
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=3600
LOG_LEVEL=INFO
EOF

# Construir Backend
echo "🐍 Construyendo Backend..."
docker build -t erp_backend ./backend

# Iniciar Backend
echo "🐍 Iniciando Backend..."
docker run -d \
    --name erp_backend \
    --network erp_network \
    --restart always \
    --add-host=host.docker.internal:host-gateway \
    -p 8000:8000 \
    -v "$WORK_DIR/backend/uploads:/app/uploads" \
    --env-file backend/.env \
    erp_backend

echo "⏳ Esperando Backend (30 segundos)..."
sleep 30

# Verificar Backend
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend funcionando"
else
    echo "❌ Backend con problemas. Logs:"
    docker logs erp_backend --tail 15
    echo ""
fi

# Construir Frontend
echo "⚛️  Construyendo Frontend..."
docker build -t erp_frontend ./frontend

# Iniciar Frontend
echo "⚛️  Iniciando Frontend..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    --restart always \
    -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
    -e NODE_ENV=production \
    -p 3000:3000 \
    erp_frontend

echo "⏳ Esperando Frontend (25 segundos)..."
sleep 25

# Verificar Frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend funcionando"
else
    echo "⚠️  Frontend iniciando. Logs:"
    docker logs erp_frontend --tail 15
fi

echo ""
echo "📊 Estado de los servicios:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 ¡Despliegue Completado!"
echo "=========================="
echo "🌐 Aplicación: http://localhost:3000"
echo "🔧 API Backend: http://localhost:8000"
echo "📚 Documentación: http://localhost:8000/docs"
echo "🗄️  MySQL: localhost:3306 (sistema)"
echo ""
echo "🔧 Comandos útiles:"
echo "   docker logs erp_backend -f   # Ver logs backend"
echo "   docker logs erp_frontend -f  # Ver logs frontend"
echo "   docker restart erp_backend   # Reiniciar backend"
echo "   docker restart erp_frontend  # Reiniciar frontend"
echo ""
echo "🛑 Para detener:"
echo "   docker stop erp_frontend erp_backend"
echo ""

# Verificación final
echo "🔍 Verificación final:"
sleep 5

if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Backend: API funcionando correctamente"
else
    echo "⚠️  Backend: Verificar logs con: docker logs erp_backend"
fi

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend: Aplicación accesible"
else
    echo "⚠️  Frontend: Puede estar iniciando, espera unos minutos"
fi