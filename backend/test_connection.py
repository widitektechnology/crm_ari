#!/usr/bin/env python3
"""
Test rápido de conexión a la base de datos MySQL
Para verificar que todo está funcionando antes del deployment completo
"""

import os
import sys
from dotenv import load_dotenv

def test_basic_connection():
    """Test básico de conexión a MySQL"""
    print("🔍 Probando conexión básica a MySQL...")
    
    # Cargar variables de entorno
    load_dotenv()
    
    try:
        import mysql.connector
        from mysql.connector import Error
        
        config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USERNAME', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_DATABASE', 'crm_ari'),
        }
        
        print(f"Conectando a: {config['user']}@{config['host']}:{config['port']}/{config['database']}")
        
        connection = mysql.connector.connect(**config)
        
        if connection.is_connected():
            print("✅ Conexión a MySQL exitosa")
            
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
            admin_count = cursor.fetchone()[0]
            
            if admin_count > 0:
                print("✅ Usuario admin encontrado")
                return True
            else:
                print("❌ Usuario admin no encontrado")
                return False
                
        else:
            print("❌ No se pudo conectar a MySQL")
            return False
            
    except Error as e:
        print(f"❌ Error MySQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

def test_fastapi_startup():
    """Test de inicio básico de FastAPI"""
    print("\n🚀 Probando inicio de FastAPI...")
    
    try:
        # Importar componentes principales
        from src.database.connection import test_connection
        from src.services.auth import AuthService
        
        print("✅ Imports de FastAPI exitosos")
        
        # Test de conexión
        if test_connection():
            print("✅ Conexión desde SQLAlchemy exitosa")
            return True
        else:
            print("❌ Conexión desde SQLAlchemy falló")
            return False
            
    except ImportError as e:
        print(f"❌ Error de import: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("TEST RÁPIDO DE CONEXIÓN - CRM ARI")
    print("=" * 50)
    
    # Verificar archivo .env
    if not os.path.exists('.env'):
        print("❌ Archivo .env no encontrado")
        sys.exit(1)
    
    all_ok = True
    
    # Test conexión básica
    if not test_basic_connection():
        all_ok = False
    
    # Test FastAPI
    if not test_fastapi_startup():
        all_ok = False
    
    print("\n" + "=" * 50)
    if all_ok:
        print("🎉 TODOS LOS TESTS PASARON")
        print("✅ Listo para hacer deployment completo")
    else:
        print("❌ ALGUNOS TESTS FALLARON")
        print("Revisa los errores antes de continuar")
    print("=" * 50)
    
    sys.exit(0 if all_ok else 1)