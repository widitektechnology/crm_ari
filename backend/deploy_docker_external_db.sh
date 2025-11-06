#!/bin/bash

# =====================================================
# SCRIPT DE DEPLOYMENT CON DOCKER Y BASE DE DATOS EXTERNA
# CRM ARI Family Assets
# =====================================================

set -e  # Salir si cualquier comando falla

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "  DEPLOYMENT DOCKER - CRM ARI"
    echo "  Base de Datos Externa MySQL"
    echo "=================================================="
    echo -e "${NC}"
}

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

# Verificar Docker
check_docker() {
    print_status "Verificando Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
    
    print_success "Docker encontrado"
}

# Configurar variables de entorno
setup_env() {
    print_status "Configurando variables de entorno..."
    
    # Verificar si .env.docker existe
    if [ ! -f ".env.docker" ]; then
        print_warning "Archivo .env.docker no encontrado. Creando..."
        
        echo "🔐 Por favor ingresa la contraseña de MySQL:"
        read -s MYSQL_PASSWORD
        
        cat > .env.docker << EOF
# Variables de entorno para Docker Compose
MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD

# Configuración de red
DOCKER_NETWORK=crm_network

# Configuración de dominio
DOMAIN=crm.arifamilyassets.com
EOF
        print_success "Archivo .env.docker creado"
    else
        print_success "Archivo .env.docker encontrado"
    fi
}

# Verificar conexión a MySQL externo
test_mysql_connection() {
    print_status "Verificando conexión a MySQL externo..."
    
    # Verificar si estamos en el directorio backend
    if [ ! -f "main.py" ] || [ ! -f "Dockerfile" ]; then
        print_error "Debes ejecutar este script desde el directorio backend/"
        print_error "Ubicación correcta: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/"
        exit 1
    fi
    
    # Obtener contraseña del .env.docker
    source .env.docker
    
    # Test básico de conexión
    if mysql -u root -p$MYSQL_ROOT_PASSWORD -h localhost -e "SELECT 1;" &> /dev/null; then
        print_success "Conexión a MySQL externa exitosa"
        
        # Verificar que la base de datos crm_ari existe
        if mysql -u root -p$MYSQL_ROOT_PASSWORD -h localhost -e "USE crm_ari;" &> /dev/null; then
            print_success "Base de datos crm_ari encontrada"
            
            # Verificar tablas principales
            TABLES=$(mysql -u root -p$MYSQL_ROOT_PASSWORD -h localhost -D crm_ari -e "SHOW TABLES;" 2>/dev/null | wc -l)
            if [ $TABLES -gt 5 ]; then
                print_success "Tablas de la base de datos encontradas ($((TABLES-1)) tablas)"
            else
                print_warning "Base de datos existe pero pocas tablas encontradas. Verifica que el script SQL se ejecutó correctamente."
            fi
        else
            print_error "Base de datos crm_ari no existe"
            print_warning "Ejecuta el script SQL desde phpMyAdmin primero"
            return 1
        fi
    else
        print_error "No se puede conectar a MySQL externo"
        print_warning "Verifica que MySQL esté ejecutándose y las credenciales sean correctas"
        return 1
    fi
}

# Construir y deployar contenedores
deploy_containers() {
    print_status "Construyendo y deploying contenedores..."
    
    # Detener contenedores existentes
    print_status "Deteniendo contenedores existentes..."
    docker-compose -f docker-compose.external-db.yml --env-file .env.docker down 2>/dev/null || true
    
    # Construir imágenes
    print_status "Construyendo imagen del backend..."
    docker-compose -f docker-compose.external-db.yml --env-file .env.docker build --no-cache backend
    
    # Iniciar contenedores
    print_status "Iniciando contenedores..."
    docker-compose -f docker-compose.external-db.yml --env-file .env.docker up -d
    
    print_success "Contenedores iniciados"
}

# Verificar deployment
verify_deployment() {
    print_status "Verificando deployment..."
    
    # Esperar a que el contenedor esté listo
    print_status "Esperando a que el backend esté listo..."
    sleep 10
    
    # Verificar que el contenedor está ejecutándose
    if docker ps | grep -q "crm_ari_backend"; then
        print_success "Contenedor backend ejecutándose"
    else
        print_error "Contenedor backend no está ejecutándose"
        print_status "Logs del contenedor:"
        docker logs crm_ari_backend
        return 1
    fi
    
    # Test de health check
    print_status "Verificando health check..."
    for i in {1..10}; do
        if curl -s http://localhost:8000/health > /dev/null; then
            print_success "API responde correctamente"
            break
        else
            print_warning "Intento $i/10 - Esperando que la API esté lista..."
            sleep 5
        fi
        
        if [ $i -eq 10 ]; then
            print_error "API no responde después de 50 segundos"
            print_status "Logs del contenedor:"
            docker logs crm_ari_backend --tail 20
            return 1
        fi
    done
    
    # Test de conexión a base de datos desde el contenedor
    print_status "Verificando conexión a base de datos desde el contenedor..."
    if docker exec crm_ari_backend python -c "
from src.database.connection import test_connection
if test_connection():
    print('✅ Conexión a base de datos desde contenedor exitosa')
else:
    print('❌ Error de conexión a base de datos desde contenedor')
    exit(1)
" 2>/dev/null; then
        print_success "Conexión desde contenedor verificada"
    else
        print_error "Error de conexión desde contenedor"
        print_status "Logs del contenedor:"
        docker logs crm_ari_backend --tail 20
        return 1
    fi
}

# Mostrar información final
show_final_info() {
    print_header
    print_success "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
    echo ""
    print_status "INFORMACIÓN DEL DEPLOYMENT:"
    echo "• Backend URL: http://localhost:8000"
    echo "• Frontend URL: http://localhost:3000"
    echo "• Health Check: http://localhost:8000/health"
    echo "• API Docs: http://localhost:8000/docs (admin/crm2025@docs)"
    echo ""
    print_status "COMANDOS ÚTILES:"
    echo "• Ver logs: docker logs crm_ari_backend -f"
    echo "• Entrar al contenedor: docker exec -it crm_ari_backend bash"
    echo "• Reiniciar: docker-compose -f docker-compose.external-db.yml restart"
    echo "• Detener: docker-compose -f docker-compose.external-db.yml down"
    echo ""
    print_status "VERIFICAR INSTALACIÓN:"
    echo "curl http://localhost:8000/health"
    echo "curl http://localhost:8000/api/auth/login"
    echo ""
}

# Función principal
main() {
    print_header
    
    check_docker
    setup_env
    test_mysql_connection
    deploy_containers
    verify_deployment
    show_final_info
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi