#!/bin/bash

# =====================================================
# SCRIPT DE INSTALACIÓN PARA SERVIDOR LINUX PRODUCCIÓN
# CRM ARI Family Assets
# =====================================================

echo "🚀 Iniciando instalación de CRM ARI en servidor Linux..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de estado
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio backend
if [ ! -f "requirements.txt" ]; then
    print_error "No se encontró requirements.txt. Por favor ejecuta este script desde el directorio backend/"
    exit 1
fi

print_status "Verificando instalación de Python..."
if ! command -v python3 &> /dev/null; then
    print_error "Python3 no está instalado. Por favor instala Python 3.11 o superior."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_success "Python $PYTHON_VERSION encontrado"

# Verificar pip
print_status "Verificando pip..."
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 no está instalado."
    exit 1
fi
print_success "pip3 encontrado"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    print_status "Creando entorno virtual..."
    python3 -m venv venv
    print_success "Entorno virtual creado"
else
    print_warning "Entorno virtual ya existe"
fi

# Activar entorno virtual
print_status "Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
print_status "Actualizando pip..."
pip install --upgrade pip setuptools wheel

# Instalar dependencias
print_status "Instalando dependencias de Python..."
pip install -r requirements.txt

print_success "Dependencias instaladas correctamente"

# Verificar instalación de MySQL
print_status "Verificando conexión a MySQL..."
if command -v mysql &> /dev/null; then
    print_success "MySQL cliente encontrado"
else
    print_warning "MySQL cliente no encontrado. Asegúrate de que MySQL esté instalado."
fi

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    print_status "Creando archivo .env..."
    cp .env.example .env 2>/dev/null || echo "Archivo .env no existe. Por favor crea uno basado en .env.example"
fi

# Verificar que las carpetas necesarias existen
print_status "Creando directorios necesarios..."
mkdir -p src/database
mkdir -p src/services  
mkdir -p src/api/routers
mkdir -p logs
mkdir -p uploads

print_success "Directorios creados"

# Generar secretos seguros para producción
print_status "Generando claves secretas para producción..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")
JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")

print_success "Claves secretas generadas"
print_warning "IMPORTANTE: Actualiza las siguientes claves en tu archivo .env:"
echo "SECRET_KEY=$SECRET_KEY"
echo "JWT_SECRET_KEY=$JWT_SECRET_KEY"

# Mostrar instrucciones finales
echo ""
echo "==========================================="
echo "🎉 INSTALACIÓN COMPLETADA"
echo "==========================================="
echo ""
print_success "Dependencias instaladas correctamente"
print_warning "PRÓXIMOS PASOS:"
echo "1. Actualiza el archivo .env con las credenciales correctas de MySQL"
echo "2. Asegúrate de que la base de datos 'crm_ari' existe en MySQL"
echo "3. Ejecuta las tablas SQL desde phpMyAdmin"
echo "4. Inicia el servidor con: python main.py"
echo ""
print_status "Para activar el entorno virtual en futuras sesiones:"
echo "source venv/bin/activate"
echo ""
print_status "Para verificar la instalación:"
echo "python -c 'import fastapi, sqlalchemy, mysql.connector; print(\"✅ Todas las dependencias cargadas correctamente\")'"
echo ""