#!/bin/bash

# Script para configurar la base de datos MySQL para CRM ARI
# Ejecutar como: ./setup_database.sh

echo "🚀 Configurando base de datos MySQL para CRM ARI..."

# Variables de configuración
DB_HOST="localhost"
DB_PORT="3306"
DB_ROOT_USER="root"
DB_ROOT_PASSWORD=""
DB_NAME="crm_ari"
DB_USER="crm_user"
DB_PASSWORD="crm_password_secure_2025"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar que MySQL esté disponible
if ! command -v mysql &> /dev/null; then
    echo_error "MySQL no está instalado o no está en el PATH"
    echo "Por favor instala MySQL Server primero:"
    echo "  - Ubuntu/Debian: sudo apt-get install mysql-server"
    echo "  - CentOS/RHEL: sudo yum install mysql-server"
    echo "  - macOS: brew install mysql"
    exit 1
fi

echo_success "MySQL encontrado"

# Probar conexión a MySQL
echo "🔍 Probando conexión a MySQL..."
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
    echo_success "Conexión a MySQL exitosa"
else
    echo_error "No se puede conectar a MySQL"
    echo "Verifica que:"
    echo "  1. MySQL Server esté ejecutándose"
    echo "  2. Las credenciales de root sean correctas"
    echo "  3. El puerto $DB_PORT esté disponible"
    
    # Intentar con prompt de contraseña
    echo "Intentando con prompt de contraseña..."
    read -s -p "Ingresa la contraseña de root de MySQL: " ROOT_PASSWORD
    echo
    
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_ROOT_USER" -p"$ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        DB_ROOT_PASSWORD="$ROOT_PASSWORD"
        echo_success "Conexión exitosa con contraseña ingresada"
    else
        echo_error "Conexión fallida. Verifica las credenciales y que MySQL esté ejecutándose"
        exit 1
    fi
fi

# Crear la base de datos
echo "📁 Creando base de datos '$DB_NAME'..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo_success "Base de datos '$DB_NAME' creada"
else
    echo_error "Error creando la base de datos"
    exit 1
fi

# Crear usuario para la aplicación
echo "👤 Creando usuario de aplicación '$DB_USER'..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" << EOF
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo_success "Usuario '$DB_USER' creado y configurado"
else
    echo_warning "Posible error creando el usuario (puede que ya exista)"
fi

# Ejecutar el script SQL para crear las tablas
echo "🔧 Ejecutando script de creación de tablas..."
if [ -f "database/create_database.sql" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" "$DB_NAME" < database/create_database.sql
    
    if [ $? -eq 0 ]; then
        echo_success "Tablas creadas exitosamente"
    else
        echo_error "Error ejecutando el script SQL"
        exit 1
    fi
else
    echo_error "Archivo database/create_database.sql no encontrado"
    echo "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Crear archivo .env si no existe
echo "⚙️  Configurando variables de entorno..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    
    # Actualizar configuración de base de datos en .env
    sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" backend/.env
    sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" backend/.env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" backend/.env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" backend/.env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" backend/.env
    
    echo_success "Archivo .env creado y configurado"
else
    echo_warning "Archivo .env ya existe. Actualiza manualmente si es necesario:"
    echo "  DB_HOST=$DB_HOST"
    echo "  DB_PORT=$DB_PORT"
    echo "  DB_USERNAME=$DB_USER"
    echo "  DB_PASSWORD=$DB_PASSWORD"
    echo "  DB_DATABASE=$DB_NAME"
fi

# Verificar la instalación
echo "🧪 Verificando instalación..."
TABLES_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" -s -N 2>/dev/null)

if [ "$TABLES_COUNT" -gt 0 ]; then
    echo_success "Base de datos configurada correctamente"
    echo_success "$TABLES_COUNT tablas creadas"
    
    # Mostrar información del usuario admin
    echo ""
    echo "🔐 Información de acceso:"
    echo "  Base de datos: $DB_NAME"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  Usuario de aplicación: $DB_USER"
    echo "  Usuario admin del sistema: admin"
    echo "  Contraseña admin por defecto: admin123"
    echo ""
    echo_warning "IMPORTANTE: Cambia la contraseña del usuario admin después del primer login"
    
else
    echo_error "Error en la verificación. La base de datos puede no haberse configurado correctamente"
    exit 1
fi

echo ""
echo_success "🎉 Configuración completada exitosamente!"
echo ""
echo "Próximos pasos:"
echo "1. Verifica las variables de entorno en backend/.env"
echo "2. Instala las dependencias de Python: pip install -r backend/requirements.txt"
echo "3. Ejecuta el servidor: python backend/main.py"
echo "4. Accede a la API en: http://localhost:8000"
echo "5. Documentación en: http://localhost:8000/docs (usuario: admin, contraseña: crm2025@docs)"