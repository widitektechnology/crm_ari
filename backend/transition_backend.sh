#!/bin/bash

# =====================================================
# TRANSICIÓN DE BACKEND - CRM ARI
# De aplicación directa a Docker
# =====================================================

echo "🔄 TRANSICIÓN DE BACKEND - CRM ARI"
echo "=================================================="
echo "ℹ️  Este script detendrá el backend actual y lo reemplazará con Docker"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Función para encontrar y detener procesos Python en puerto 8000
stop_backend_processes() {
    print_status "Buscando procesos en puerto 8000..."
    
    # Buscar procesos usando el puerto 8000
    PROCESSES=$(lsof -ti :8000 2>/dev/null)
    
    if [ -z "$PROCESSES" ]; then
        print_warning "No se encontraron procesos usando el puerto 8000"
        return 0
    fi
    
    echo "🔍 Procesos encontrados en puerto 8000:"
    lsof -i :8000 2>/dev/null
    echo ""
    
    print_status "Deteniendo procesos del backend actual..."
    
    # Detener procesos de forma suave primero
    for PID in $PROCESSES; do
        if kill -TERM $PID 2>/dev/null; then
            print_success "Proceso $PID detenido suavemente"
        fi
    done
    
    # Esperar un momento
    sleep 3
    
    # Verificar si aún hay procesos y forzar si es necesario
    REMAINING=$(lsof -ti :8000 2>/dev/null)
    if [ ! -z "$REMAINING" ]; then
        print_warning "Forzando cierre de procesos restantes..."
        for PID in $REMAINING; do
            if kill -KILL $PID 2>/dev/null; then
                print_success "Proceso $PID forzado a cerrar"
            fi
        done
    fi
    
    # Verificación final
    sleep 2
    if lsof -i :8000 >/dev/null 2>&1; then
        print_error "Aún hay procesos usando el puerto 8000"
        return 1
    else
        print_success "Puerto 8000 liberado correctamente"
        return 0
    fi
}

# Función para detener servicios systemd relacionados
stop_systemd_services() {
    print_status "Verificando servicios systemd..."
    
    # Buscar servicios CRM relacionados
    SERVICES=$(systemctl list-units --type=service --state=active | grep -i crm | awk '{print $1}' || true)
    
    if [ ! -z "$SERVICES" ]; then
        echo "🔍 Servicios CRM encontrados:"
        echo "$SERVICES"
        echo ""
        
        for service in $SERVICES; do
            print_status "Deteniendo servicio: $service"
            if systemctl stop "$service" 2>/dev/null; then
                print_success "Servicio $service detenido"
            else
                print_warning "No se pudo detener $service (puede que no tengas permisos)"
            fi
        done
    else
        print_success "No se encontraron servicios systemd relacionados"
    fi
}

# Función para crear backup de configuración actual
backup_current_config() {
    print_status "Creando backup de configuración actual..."
    
    BACKUP_DIR="/tmp/crm_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Buscar archivos de configuración
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
        print_success "Backup de .env creado"
    fi
    
    if [ -f "main.py" ]; then
        cp main.py "$BACKUP_DIR/"
        print_success "Backup de main.py creado"
    fi
    
    echo "📁 Backup guardado en: $BACKUP_DIR"
}

# Función principal de transición
perform_transition() {
    print_status "Iniciando transición de backend..."
    
    # 1. Crear backup
    backup_current_config
    
    # 2. Detener servicios systemd
    stop_systemd_services
    
    # 3. Detener procesos en puerto 8000
    if ! stop_backend_processes; then
        print_error "No se pudo liberar el puerto 8000"
        return 1
    fi
    
    # 4. Limpiar contenedores Docker existentes
    print_status "Limpiando contenedores Docker existentes..."
    docker stop $(docker ps -q --filter "name=crm") 2>/dev/null || true
    docker rm $(docker ps -aq --filter "name=crm") 2>/dev/null || true
    print_success "Contenedores Docker limpiados"
    
    # 5. Iniciar nuevo backend con Docker
    print_status "Iniciando nuevo backend con Docker..."
    
    if docker-compose -f docker-compose.external-db.yml up -d; then
        print_success "Backend Docker iniciado correctamente"
        
        # Esperar un momento para que el contenedor se inicie
        print_status "Esperando que el contenedor se inicie completamente..."
        sleep 10
        
        # Verificar que el contenedor está funcionando
        if docker ps | grep -q "crm_ari_backend"; then
            print_success "Contenedor backend funcionando"
            
            # Verificar que el puerto está respondiendo
            if curl -s http://localhost:8000/health >/dev/null 2>&1; then
                print_success "Backend respondiendo en puerto 8000"
                echo ""
                echo "🎉 TRANSICIÓN COMPLETADA EXITOSAMENTE"
                echo "✅ El nuevo backend Docker está funcionando en puerto 8000"
                echo "✅ El frontend seguirá funcionando sin cambios"
                echo "✅ Todas las APIs mantienen la misma URL"
                echo ""
                echo "🔗 URLs disponibles:"
                echo "   • API: http://localhost:8000"
                echo "   • Documentación: http://localhost:8000/docs"
                echo "   • Health Check: http://localhost:8000/health"
                return 0
            else
                print_warning "El backend no está respondiendo aún, puede necesitar más tiempo"
                print_status "Verificando logs del contenedor..."
                docker logs crm_ari_backend --tail 20
            fi
        else
            print_error "El contenedor no se inició correctamente"
            docker-compose -f docker-compose.external-db.yml logs
            return 1
        fi
    else
        print_error "Error al iniciar Docker Compose"
        return 1
    fi
}

# Función para rollback si algo sale mal
rollback() {
    print_warning "Iniciando rollback..."
    
    # Detener contenedores Docker
    docker-compose -f docker-compose.external-db.yml down 2>/dev/null || true
    
    print_error "Rollback completado. El backend anterior debe ser reiniciado manualmente."
    print_status "Puedes restaurar la configuración desde el backup creado"
}

# Menú principal
show_menu() {
    echo ""
    echo "🔧 OPCIONES DISPONIBLES:"
    echo "1) Transición completa (Recomendado)"
    echo "2) Solo detener backend actual"
    echo "3) Solo iniciar Docker backend"
    echo "4) Verificar estado actual"
    echo "5) Rollback (si algo salió mal)"
    echo "6) Salir"
    echo ""
}

# Verificar estado actual
check_current_state() {
    echo "📊 ESTADO ACTUAL DEL SISTEMA:"
    echo "=============================================="
    
    # Verificar puerto 8000
    if lsof -i :8000 >/dev/null 2>&1; then
        echo "🔴 Puerto 8000: EN USO"
        lsof -i :8000 2>/dev/null
    else
        echo "🟢 Puerto 8000: LIBRE"
    fi
    
    echo ""
    
    # Verificar contenedores Docker
    if docker ps | grep -q "crm"; then
        echo "🟢 Contenedores CRM Docker:"
        docker ps | grep "crm"
    else
        echo "🔴 No hay contenedores CRM Docker funcionando"
    fi
    
    echo ""
    
    # Verificar conectividad API
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo "🟢 API respondiendo en puerto 8000"
    else
        echo "🔴 API no está respondiendo en puerto 8000"
    fi
}

# Script principal
main() {
    while true; do
        show_menu
        read -p "Selecciona una opción (1-6): " choice
        
        case $choice in
            1)
                echo ""
                print_warning "¿Estás seguro de que quieres hacer la transición completa? (y/N)"
                read -p "Respuesta: " confirm
                if [[ $confirm =~ ^[Yy]$ ]]; then
                    perform_transition
                else
                    print_status "Transición cancelada"
                fi
                ;;
            2)
                stop_backend_processes
                ;;
            3)
                print_status "Iniciando backend Docker..."
                docker-compose -f docker-compose.external-db.yml up -d
                ;;
            4)
                check_current_state
                ;;
            5)
                rollback
                ;;
            6)
                print_success "¡Hasta luego!"
                exit 0
                ;;
            *)
                print_error "Opción inválida"
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.external-db.yml" ]; then
    print_error "No se encuentra docker-compose.external-db.yml"
    print_error "Asegúrate de estar en el directorio backend/"
    exit 1
fi

# Ejecutar menú principal
main