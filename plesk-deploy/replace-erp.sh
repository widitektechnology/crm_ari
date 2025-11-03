#!/bin/bash
# ============================================
# 🔄 SCRIPT DE REEMPLAZO: ERP → CRM
# ============================================
# Ejecutar en servidor Linux con cuidado

echo "🚀 INICIANDO REEMPLAZO ERP → CRM..."
echo ""

# Variables
DOMAIN_PATH="/var/www/vhosts/arifamilyassets.com"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${DOMAIN_PATH}/httpdocs-erp-backup-${BACKUP_DATE}"

echo "📋 CONFIGURACIÓN:"
echo "   Dominio: arifamilyassets.com"
echo "   Ruta: $DOMAIN_PATH"
echo "   Backup: $BACKUP_DIR"
echo ""

# Paso 1: Verificar que existe httpdocs actual
if [ ! -d "$DOMAIN_PATH/httpdocs" ]; then
    echo "❌ ERROR: No existe $DOMAIN_PATH/httpdocs"
    exit 1
fi

echo "✅ Directorio httpdocs encontrado"

# Paso 2: Crear backup del ERP actual
echo ""
echo "📦 CREANDO BACKUP DEL ERP ACTUAL..."
mv "$DOMAIN_PATH/httpdocs" "$BACKUP_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Backup creado: $BACKUP_DIR"
else
    echo "❌ ERROR: No se pudo crear backup"
    exit 1
fi

# Paso 3: Crear nuevo directorio httpdocs
mkdir "$DOMAIN_PATH/httpdocs"
echo "✅ Nuevo directorio httpdocs creado"

echo ""
echo "🎯 LISTO PARA SUBIR CRM:"
echo "   1. Sube todo el contenido de plesk-deploy/crm-build/"
echo "   2. A la carpeta: $DOMAIN_PATH/httpdocs/"
echo "   3. Mantén estructura de carpetas _next/"
echo ""

echo "🔧 DESPUÉS DE SUBIR, EJECUTAR:"
echo "   chmod 644 $DOMAIN_PATH/httpdocs/*.html"
echo "   chmod 755 $DOMAIN_PATH/httpdocs/*/"
echo "   chmod 644 $DOMAIN_PATH/httpdocs/.htaccess"
echo "   chown -R psaadm:psacln $DOMAIN_PATH/httpdocs/*"
echo ""

echo "🌐 PROBAR:"
echo "   https://crm.arifamilyassets.com/"
echo ""

echo "🔄 SI HAY PROBLEMAS, ROLLBACK:"
echo "   rm -rf $DOMAIN_PATH/httpdocs"
echo "   mv $BACKUP_DIR $DOMAIN_PATH/httpdocs"
echo ""

echo "✅ BACKUP COMPLETADO. Listo para subir CRM."