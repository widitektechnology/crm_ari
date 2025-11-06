#!/bin/bash

# =====================================================
# CONFIGURACIÓN ESPECÍFICA PARA PLESK
# CRM ARI Family Assets
# =====================================================

echo "🚀 Configurando CRM ARI para Plesk..."

# Verificar ubicación actual
CURRENT_DIR=$(pwd)
echo "📍 Directorio actual: $CURRENT_DIR"

if [[ ! "$CURRENT_DIR" == *"crm.arifamilyassets.com/backend"* ]]; then
    echo "❌ No estás en el directorio backend correcto"
    echo "💡 Deberías estar en: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend"
    exit 1
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << 'EOF'
# Environment Configuration
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
DEBUG=False

# Database Configuration - Servidor Linux Producción
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# Security Configuration
SECRET_KEY=crm-ari-super-secret-key-2025-production-ready
JWT_SECRET_KEY=crm_ari_jwt_secret_key_2025_change_in_production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
BCRYPT_ROUNDS=12

# CORS Configuration - Producción Linux
CORS_ORIGINS=https://crm.arifamilyassets.com,http://localhost:3000

# External API Configuration
API_MAX_RETRIES=3
API_TIMEOUT=30
API_BACKOFF_FACTOR=1.0

# AI Configuration
AI_MODEL_PATH=./models
AI_CLASSIFICATION_THRESHOLD=0.7
AI_AGENT_SYSTEM_PROMPT=Responde el correo en nombre de Joel Araujo, utiliza un lenguaje amigable y poco técnico

# Multi-company Configuration
DEFAULT_COMPANY_ID=1

# Mail Configuration
MAIL_SYNC_INTERVAL=15
MAIL_MAX_ATTACHMENT_SIZE=25
EOF
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

# Solicitar contraseña de MySQL
echo ""
echo "🔐 Configuración de MySQL:"
echo "Por favor ingresa la contraseña de MySQL para el usuario root:"
read -s MYSQL_PASSWORD

# Actualizar .env con la contraseña
sed -i "s/DB_PASSWORD=$/DB_PASSWORD=$MYSQL_PASSWORD/" .env
echo "✅ Contraseña de MySQL configurada"

# Verificar Python
echo ""
echo "🐍 Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ $PYTHON_VERSION encontrado"
else
    echo "❌ Python3 no encontrado"
    exit 1
fi

# Crear entorno virtual
echo ""
echo "📦 Configurando entorno virtual..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
else
    echo "✅ Entorno virtual ya existe"
fi

# Activar entorno virtual e instalar dependencias
echo "📚 Instalando dependencias..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "🔍 Ejecutando test de conexión..."
python3 test_connection.py

echo ""
echo "=================================================="
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "=================================================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Si el test de conexión fue exitoso, puedes iniciar el servidor:"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "2. Verificar que el servidor está funcionando:"
echo "   curl http://localhost:8000/health"
echo ""
echo "3. Verificar la API:"
echo "   curl http://localhost:8000/api/auth/login"
echo ""