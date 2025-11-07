#!/usr/bin/env python3
"""
Script de debug para verificar la configuración que se está cargando
"""
import os
import sys

print("🔍 DEBUG: Verificando configuración...")
print(f"ENVIRONMENT = {os.environ.get('ENVIRONMENT', 'NO SET')}")
print(f"DB_HOST = {os.environ.get('DB_HOST', 'NO SET')}")
print(f"DB_PORT = {os.environ.get('DB_PORT', 'NO SET')}")
print(f"DB_USERNAME = {os.environ.get('DB_USERNAME', 'NO SET')}")
print(f"DB_PASSWORD = {os.environ.get('DB_PASSWORD', 'NO SET')}")
print(f"DB_DATABASE = {os.environ.get('DB_DATABASE', 'NO SET')}")

print("\n" + "="*50)

# Intentar importar la configuración
try:
    sys.path.append('/app/src')
    from config.settings import get_settings
    
    settings = get_settings()
    
    print("✅ Configuración cargada exitosamente:")
    print(f"Database Host: {settings.database.host}")
    print(f"Database Port: {settings.database.port}")
    print(f"Database Username: {settings.database.username}")
    print(f"Database Password: {'*' * len(settings.database.password) if settings.database.password else 'EMPTY'}")
    print(f"Database Name: {settings.database.database}")
    print(f"Connection String: {settings.database.connection_string}")
    
except Exception as e:
    print(f"❌ Error al cargar configuración: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50)

# Verificar si el archivo de producción existe
try:
    from config.production_config import PRODUCTION_CONFIG
    print("✅ Configuración de producción encontrada:")
    print(f"Production DB Host: {PRODUCTION_CONFIG['database'].HOST}")
    print(f"Production DB URL: {PRODUCTION_CONFIG['database'].get_url()}")
except Exception as e:
    print(f"❌ Error al cargar configuración de producción: {e}")