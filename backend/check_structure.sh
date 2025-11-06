#!/bin/bash

# =====================================================
# VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS
# CRM ARI Family Assets
# =====================================================

echo "🔍 VERIFICANDO ESTRUCTURA DE ARCHIVOS CRM ARI"
echo "=============================================="

# Verificar que estamos en el directorio backend
if [ ! -f "main.py" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ No estás en el directorio backend del proyecto CRM ARI"
    echo "💡 Debes estar en: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/"
    exit 1
fi

echo "📍 Ubicación actual: $(pwd)"
echo ""

# Verificar archivos Docker en backend
echo "📁 ARCHIVOS DOCKER EN BACKEND/:"
[ -f "docker-compose.external-db.yml" ] && echo "✅ docker-compose.external-db.yml" || echo "❌ docker-compose.external-db.yml"
[ -f ".env.docker" ] && echo "✅ .env.docker" || echo "❌ .env.docker (se creará automáticamente)"
[ -f "deploy_docker_external_db.sh" ] && echo "✅ deploy_docker_external_db.sh" || echo "❌ deploy_docker_external_db.sh"
[ -f "docker_manage.sh" ] && echo "✅ docker_manage.sh" || echo "❌ docker_manage.sh"

# Verificar archivos principales del backend
echo ""
echo "📁 ARCHIVOS PRINCIPALES DEL BACKEND:"
[ -f "main.py" ] && echo "✅ main.py" || echo "❌ main.py"
[ -f "requirements.txt" ] && echo "✅ requirements.txt" || echo "❌ requirements.txt"
[ -f "Dockerfile" ] && echo "✅ Dockerfile" || echo "❌ Dockerfile"
[ -f ".env" ] && echo "✅ .env" || echo "❌ .env (se creará automáticamente)"

# Verificar estructura src
echo ""
echo "📁 ESTRUCTURA SRC/:"
[ -d "src" ] && echo "✅ src/" || echo "❌ src/"
[ -d "src/database" ] && echo "✅ src/database/" || echo "❌ src/database/"
[ -f "src/database/models.py" ] && echo "✅ src/database/models.py" || echo "❌ src/database/models.py"
[ -f "src/database/connection.py" ] && echo "✅ src/database/connection.py" || echo "❌ src/database/connection.py"
[ -d "src/services" ] && echo "✅ src/services/" || echo "❌ src/services/"
[ -f "src/services/auth.py" ] && echo "✅ src/services/auth.py" || echo "❌ src/services/auth.py"
[ -d "src/api/routers" ] && echo "✅ src/api/routers/" || echo "❌ src/api/routers/"
[ -f "src/api/routers/auth.py" ] && echo "✅ src/api/routers/auth.py" || echo "❌ src/api/routers/auth.py"
[ -f "src/api/routers/users.py" ] && echo "✅ src/api/routers/users.py" || echo "❌ src/api/routers/users.py"

# Verificar permisos de scripts
echo ""
echo "🔒 PERMISOS DE SCRIPTS:"
if [ -x "deploy_docker_external_db.sh" ]; then
    echo "✅ deploy_docker_external_db.sh ejecutable"
else
    echo "⚠️ deploy_docker_external_db.sh no ejecutable (ejecuta: chmod +x *.sh)"
fi

if [ -x "docker_manage.sh" ]; then
    echo "✅ docker_manage.sh ejecutable"
else
    echo "⚠️ docker_manage.sh no ejecutable (ejecuta: chmod +x *.sh)"
fi

# Verificar Docker
echo ""
echo "🐳 VERIFICANDO DOCKER:"
if command -v docker &> /dev/null; then
    echo "✅ Docker instalado: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
else
    echo "❌ Docker no encontrado"
fi

if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose instalado: $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)"
elif docker compose version &> /dev/null; then
    echo "✅ Docker Compose (plugin) instalado"
else
    echo "❌ Docker Compose no encontrado"
fi

# Verificar MySQL
echo ""
echo "🗄️ VERIFICANDO MYSQL:"
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client disponible"
    
    # Verificar si podemos conectarnos (si .env.docker existe)
    if [ -f ".env.docker" ]; then
        source .env.docker
        if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
            if mysql -u root -p$MYSQL_ROOT_PASSWORD -h localhost -e "SELECT 1;" &> /dev/null; then
                echo "✅ Conexión a MySQL exitosa"
                
                if mysql -u root -p$MYSQL_ROOT_PASSWORD -h localhost -e "USE crm_ari;" &> /dev/null; then
                    echo "✅ Base de datos crm_ari existe"
                else
                    echo "❌ Base de datos crm_ari no existe"
                fi
            else
                echo "⚠️ No se puede conectar a MySQL (verifica credenciales)"
            fi
        else
            echo "⚠️ Contraseña MySQL no configurada en .env.docker"
        fi
    else
        echo "⚠️ Archivo .env.docker no existe (se creará en el deployment)"
    fi
else
    echo "❌ MySQL client no encontrado"
fi

# Resumen final
echo ""
echo "=============================================="

# Contar archivos críticos
CRITICAL_FILES=0
[ -f "docker-compose.external-db.yml" ] && ((CRITICAL_FILES++))
[ -f "deploy_docker_external_db.sh" ] && ((CRITICAL_FILES++))
[ -f "main.py" ] && ((CRITICAL_FILES++))
[ -f "Dockerfile" ] && ((CRITICAL_FILES++))
[ -f "requirements.txt" ] && ((CRITICAL_FILES++))

if [ $CRITICAL_FILES -eq 5 ]; then
    echo "🎉 ESTRUCTURA CORRECTA - LISTO PARA DEPLOYMENT"
    echo ""
    echo "🚀 PRÓXIMO PASO:"
    echo "./deploy_docker_external_db.sh"
else
    echo "❌ ESTRUCTURA INCOMPLETA ($CRITICAL_FILES/5 archivos críticos)"
    echo ""
    echo "💡 ACCIONES NECESARIAS:"
    echo "1. Verifica que todos los archivos estén en su lugar"
    echo "2. Ejecuta 'chmod +x *.sh' para hacer los scripts ejecutables"
    echo "3. Asegúrate de estar en la raíz del proyecto"
fi

echo "=============================================="