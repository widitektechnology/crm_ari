#!/usr/bin/env python3
"""
Script de verificación para CRM ARI
Verifica que todas las dependencias estén instaladas y la conexión a la base de datos funcione
"""

import sys
import os
from typing import Dict, Any

def check_python_version() -> bool:
    """Verificar versión de Python"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} no es compatible. Se requiere Python 3.8+")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} OK")
    return True

def check_dependencies() -> Dict[str, bool]:
    """Verificar dependencias principales"""
    dependencies = {
        'fastapi': False,
        'uvicorn': False,
        'sqlalchemy': False,
        'mysql.connector': False,
        'jose': False,
        'passlib': False,
        'python_dotenv': False,
        'pydantic': False
    }
    
    for dep in dependencies:
        try:
            if dep == 'mysql.connector':
                import mysql.connector
            elif dep == 'python_dotenv':
                import dotenv
            else:
                __import__(dep)
            dependencies[dep] = True
            print(f"✅ {dep} instalado correctamente")
        except ImportError:
            print(f"❌ {dep} NO encontrado")
            dependencies[dep] = False
    
    return dependencies

def check_environment_file() -> bool:
    """Verificar archivo .env"""
    if not os.path.exists('.env'):
        print("❌ Archivo .env no encontrado")
        return False
    
    print("✅ Archivo .env encontrado")
    
    # Cargar variables de entorno
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        required_vars = [
            'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_DATABASE',
            'SECRET_KEY', 'JWT_SECRET_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"⚠️ Variables de entorno faltantes: {', '.join(missing_vars)}")
        else:
            print("✅ Variables de entorno configuradas")
        
        return len(missing_vars) == 0
        
    except Exception as e:
        print(f"❌ Error cargando .env: {e}")
        return False

def check_database_connection() -> bool:
    """Verificar conexión a la base de datos"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        import mysql.connector
        from mysql.connector import Error
        
        config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USERNAME', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_DATABASE', 'crm_ari'),
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }
        
        print(f"🔍 Intentando conectar a MySQL: {config['user']}@{config['host']}:{config['port']}/{config['database']}")
        
        connection = mysql.connector.connect(**config)
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Verificar que las tablas existen
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            
            expected_tables = [
                'users', 'roles', 'user_roles', 'companies', 'employees',
                'mail_accounts', 'mail_folders', 'mail_messages', 'activities', 
                'notes', 'system_settings', 'user_settings', 'audit_logs'
            ]
            
            missing_tables = [table for table in expected_tables if table not in tables]
            
            if missing_tables:
                print(f"⚠️ Tablas faltantes: {', '.join(missing_tables)}")
                print("💡 Ejecuta el script SQL desde phpMyAdmin para crear las tablas")
            else:
                print("✅ Todas las tablas de la base de datos existen")
            
            # Verificar usuario admin
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
            admin_count = cursor.fetchone()[0]
            
            if admin_count > 0:
                print("✅ Usuario admin encontrado en la base de datos")
            else:
                print("⚠️ Usuario admin no encontrado. Ejecuta el script SQL completo.")
            
            cursor.close()
            connection.close()
            print("✅ Conexión a MySQL exitosa")
            return len(missing_tables) == 0 and admin_count > 0
            
    except Error as e:
        print(f"❌ Error de conexión MySQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")
        return False

def check_file_structure() -> bool:
    """Verificar estructura de archivos"""
    required_files = [
        'main.py',
        'requirements.txt',
        '.env',
        'src/database/models.py',
        'src/database/connection.py',
        'src/services/auth.py',
        'src/api/routers/auth.py',
        'src/api/routers/users.py'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
        else:
            print(f"✅ {file_path}")
    
    if missing_files:
        print(f"❌ Archivos faltantes: {', '.join(missing_files)}")
        return False
    
    return True

def main():
    """Función principal de verificación"""
    print("🔍 VERIFICACIÓN DEL SISTEMA CRM ARI")
    print("=" * 50)
    
    all_ok = True
    
    # Verificar Python
    print("\n📦 Verificando Python...")
    if not check_python_version():
        all_ok = False
    
    # Verificar dependencias
    print("\n📚 Verificando dependencias...")
    deps = check_dependencies()
    if not all(deps.values()):
        all_ok = False
    
    # Verificar estructura de archivos
    print("\n📁 Verificando estructura de archivos...")
    if not check_file_structure():
        all_ok = False
    
    # Verificar archivo .env
    print("\n⚙️ Verificando configuración...")
    if not check_environment_file():
        all_ok = False
    
    # Verificar base de datos
    print("\n🗄️ Verificando base de datos...")
    if not check_database_connection():
        all_ok = False
    
    # Resultado final
    print("\n" + "=" * 50)
    if all_ok:
        print("🎉 SISTEMA COMPLETAMENTE VERIFICADO")
        print("✅ Listo para ejecutar: python main.py")
    else:
        print("❌ ERRORES ENCONTRADOS")
        print("Por favor corrige los errores antes de continuar")
    
    print("=" * 50)
    return all_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)