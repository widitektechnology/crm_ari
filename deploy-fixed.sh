#!/bin/bash

# Despliegue directo adaptado - Sistema ERP
# Maneja puertos ocupados y servicios existentes

set -e

echo "🚀 Despliegue Directo - Sistema ERP (Adaptado)"
echo "=============================================="

WORK_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com"
cd "$WORK_DIR"

# Función para encontrar puerto libre
find_free_port() {
    local port=$1
    while netstat -ln | grep ":$port " > /dev/null; do
        port=$((port + 1))
    done
    echo $port
}

# Detener contenedores existentes
echo "🛑 Limpiando contenedores anteriores..."
docker stop erp_mysql erp_backend erp_frontend 2>/dev/null || true
docker rm erp_mysql erp_backend erp_frontend 2>/dev/null || true

# Crear red personalizada
echo "🌐 Configurando red..."
docker network create erp_network 2>/dev/null || true

# Verificar puertos disponibles
MYSQL_PORT=$(find_free_port 3306)
BACKEND_PORT=$(find_free_port 8000)
FRONTEND_PORT=$(find_free_port 3000)

echo "📋 Puertos asignados:"
echo "   MySQL: $MYSQL_PORT"
echo "   Backend: $BACKEND_PORT" 
echo "   Frontend: $FRONTEND_PORT"

# Configurar base de datos
echo "🗄️  Configurando base de datos..."

if [ "$MYSQL_PORT" != "3306" ]; then
    echo "⚠️  Puerto 3306 ocupado. Usando MySQL en contenedor en puerto $MYSQL_PORT"
    
    # Iniciar MySQL en contenedor
    docker run -d \
        --name erp_mysql \
        --network erp_network \
        --restart always \
        -e MYSQL_ROOT_PASSWORD=SecureRootPass2024! \
        -e MYSQL_DATABASE=erp_system \
        -e MYSQL_USER=erp_user \
        -e MYSQL_PASSWORD=SecurePass2024! \
        -p $MYSQL_PORT:3306 \
        -v erp_mysql_data:/var/lib/mysql \
        mysql:8.0 \
        --default-authentication-plugin=mysql_native_password
    
    DB_HOST="erp_mysql"
    DB_PORT="3306"
    
    echo "⏳ Esperando MySQL en contenedor (60 segundos)..."
    sleep 60
    
else
    echo "✅ Usando MySQL existente en localhost:3306"
    
    # Verificar si podemos conectar al MySQL existente
    if mysql -h localhost -u root -p"SecureRootPass2024!" -e "SELECT 1;" 2>/dev/null; then
        echo "✅ Conexión exitosa a MySQL existente"
        DB_HOST="host.docker.internal"
        DB_PORT="3306"
        
        # Crear base de datos si no existe
        mysql -h localhost -u root -p"SecureRootPass2024!" -e "CREATE DATABASE IF NOT EXISTS erp_system;" 2>/dev/null || true
        mysql -h localhost -u root -p"SecureRootPass2024!" -e "CREATE USER IF NOT EXISTS 'erp_user'@'%' IDENTIFIED BY 'SecurePass2024!';" 2>/dev/null || true
        mysql -h localhost -u root -p"SecureRootPass2024!" -e "GRANT ALL PRIVILEGES ON erp_system.* TO 'erp_user'@'%';" 2>/dev/null || true
        mysql -h localhost -u root -p"SecureRootPass2024!" -e "FLUSH PRIVILEGES;" 2>/dev/null || true
        
    else
        echo "❌ No se puede conectar al MySQL existente"
        echo "💡 Creando MySQL en contenedor con puerto alternativo..."
        
        docker run -d \
            --name erp_mysql \
            --network erp_network \
            --restart always \
            -e MYSQL_ROOT_PASSWORD=SecureRootPass2024! \
            -e MYSQL_DATABASE=erp_system \
            -e MYSQL_USER=erp_user \
            -e MYSQL_PASSWORD=SecurePass2024! \
            -p $MYSQL_PORT:3306 \
            mysql:8.0 \
            --default-authentication-plugin=mysql_native_password
        
        DB_HOST="erp_mysql"
        DB_PORT="3306"
        
        echo "⏳ Esperando MySQL en contenedor (60 segundos)..."
        sleep 60
    fi
fi

# Construir Backend
echo "🐍 Construyendo Backend..."
docker build -t erp_backend ./backend

# Iniciar Backend
echo "🐍 Iniciando Backend en puerto $BACKEND_PORT..."
docker run -d \
    --name erp_backend \
    --network erp_network \
    --restart always \
    --add-host=host.docker.internal:host-gateway \
    -e DATABASE_URL=mysql://erp_user:SecurePass2024!@$DB_HOST:$DB_PORT/erp_system \
    -e SECRET_KEY=erp-production-secret-2024 \
    -e DEBUG=False \
    -e CORS_ORIGINS=https://crm.arifamilyassets.com,http://localhost:$FRONTEND_PORT \
    -e JWT_SECRET_KEY=jwt-production-secret-2024 \
    -e LOG_LEVEL=INFO \
    -p $BACKEND_PORT:8000 \
    -v "$WORK_DIR/backend/uploads:/app/uploads" \
    erp_backend

echo "⏳ Esperando Backend (30 segundos)..."
sleep 30

# Construir Frontend  
echo "⚛️  Construyendo Frontend..."
docker build -t erp_frontend ./frontend

# Iniciar Frontend
echo "⚛️  Iniciando Frontend en puerto $FRONTEND_PORT..."
docker run -d \
    --name erp_frontend \
    --network erp_network \
    --restart always \
    -e NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT \
    -e NODE_ENV=production \
    -p $FRONTEND_PORT:3000 \
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

# Backend
if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
    echo "✅ Backend: Funcionando correctamente"
else
    echo "❌ Backend: Error de conexión"
    echo "📋 Logs del backend:"
    docker logs erp_backend --tail 10
fi

# Frontend
if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
    echo "✅ Frontend: Funcionando correctamente"
else
    echo "⚠️  Frontend: Iniciando o con problemas"
    echo "📋 Logs del frontend:"
    docker logs erp_frontend --tail 10
fi

echo ""
echo "🎉 ¡Despliegue Completado!"
echo "=========================="
echo "🌐 Aplicación: http://localhost:$FRONTEND_PORT"
echo "🔧 API Backend: http://localhost:$BACKEND_PORT"
echo "📚 Documentación: http://localhost:$BACKEND_PORT/docs"
if [ "$MYSQL_PORT" != "3306" ]; then
    echo "🗄️  MySQL (contenedor): localhost:$MYSQL_PORT"
else
    echo "🗄️  MySQL (existente): localhost:3306"
fi
echo ""
echo "🔧 Comandos útiles:"
echo "   docker ps                    # Ver contenedores"
echo "   docker logs erp_backend -f   # Logs backend"
echo "   docker logs erp_frontend -f  # Logs frontend"
echo ""
echo "🛑 Para detener:"
echo "   docker stop erp_frontend erp_backend"
if [ "$MYSQL_PORT" != "3306" ]; then
    echo "   docker stop erp_mysql"
fi
echo ""

# Crear archivo con las URLs para referencia
cat > deployment-info.txt << EOF
Sistema ERP - Información de Despliegue
=====================================
Fecha: $(date)

URLs de Acceso:
- Frontend: http://localhost:$FRONTEND_PORT
- Backend API: http://localhost:$BACKEND_PORT  
- Documentación: http://localhost:$BACKEND_PORT/docs
- MySQL: localhost:$MYSQL_PORT

Contenedores:
- erp_frontend (puerto $FRONTEND_PORT)
- erp_backend (puerto $BACKEND_PORT)
$([ "$MYSQL_PORT" != "3306" ] && echo "- erp_mysql (puerto $MYSQL_PORT)")

Comandos:
- Ver logs: docker logs [contenedor] -f
- Reiniciar: docker restart [contenedor]
- Detener: docker stop [contenedor]
EOF

echo "📄 Información guardada en: deployment-info.txt"