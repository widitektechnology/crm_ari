#!/bin/bash

# =====================================================
# GESTIÓN RÁPIDA DE CONTENEDORES CRM ARI
# =====================================================

COMPOSE_FILE="docker-compose.external-db.yml"
ENV_FILE=".env.docker"

case "$1" in
    "start")
        echo "🚀 Iniciando contenedores..."
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
        echo "✅ Contenedores iniciados"
        ;;
    "stop")
        echo "🛑 Deteniendo contenedores..."
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down
        echo "✅ Contenedores detenidos"
        ;;
    "restart")
        echo "🔄 Reiniciando contenedores..."
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart
        echo "✅ Contenedores reiniciados"
        ;;
    "logs")
        echo "📋 Logs del backend:"
        docker logs crm_ari_backend -f
        ;;
    "status")
        echo "📊 Estado de contenedores:"
        docker-compose -f $COMPOSE_FILE ps
        echo ""
        echo "🔍 Health check:"
        curl -s http://localhost:8000/health | python -m json.tool 2>/dev/null || echo "❌ API no responde"
        ;;
    "rebuild")
        echo "🔨 Reconstruyendo y reiniciando..."
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE build --no-cache
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
        echo "✅ Reconstruido y reiniciado"
        ;;
    "shell")
        echo "🐚 Entrando al contenedor backend..."
        docker exec -it crm_ari_backend bash
        ;;
    "test-db")
        echo "🔍 Probando conexión a base de datos desde contenedor..."
        docker exec crm_ari_backend python -c "
from src.database.connection import test_connection
if test_connection():
    print('✅ Conexión exitosa')
else:
    print('❌ Error de conexión')
"
        ;;
    *)
        echo "🎯 Gestión de contenedores CRM ARI"
        echo "Uso: $0 {start|stop|restart|logs|status|rebuild|shell|test-db}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start    - Iniciar contenedores"
        echo "  stop     - Detener contenedores"
        echo "  restart  - Reiniciar contenedores"
        echo "  logs     - Ver logs del backend"
        echo "  status   - Ver estado y health check"
        echo "  rebuild  - Reconstruir imágenes y reiniciar"
        echo "  shell    - Entrar al contenedor backend"
        echo "  test-db  - Probar conexión a base de datos"
        ;;
esac