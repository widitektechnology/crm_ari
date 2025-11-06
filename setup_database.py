#!/usr/bin/env python3
"""
Script para inicializar la base de datos CRM ARI
"""

import os
import sys
import mysql.connector
from mysql.connector import Error
import getpass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseSetup:
    def __init__(self):
        self.host = input("Host de MySQL (localhost): ").strip() or "localhost"
        self.port = input("Puerto de MySQL (3306): ").strip() or "3306"
        self.root_user = input("Usuario root de MySQL (root): ").strip() or "root"
        self.root_password = getpass.getpass("Contraseña de root de MySQL: ")
        
        self.db_name = "crm_ari"
        self.app_user = "crm_user"
        self.app_password = "crm_password_secure_2025"
        
        self.connection = None

    def connect_mysql(self):
        """Conectar a MySQL"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.root_user,
                password=self.root_password
            )
            
            if self.connection.is_connected():
                print("✅ Conexión a MySQL exitosa")
                return True
                
        except Error as e:
            print(f"❌ Error conectando a MySQL: {e}")
            return False

    def create_database(self):
        """Crear la base de datos"""
        try:
            cursor = self.connection.cursor()
            
            # Crear base de datos
            cursor.execute(f"""
                CREATE DATABASE IF NOT EXISTS {self.db_name} 
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            """)
            
            print(f"✅ Base de datos '{self.db_name}' creada")
            
            # Crear usuario de aplicación
            cursor.execute(f"""
                CREATE USER IF NOT EXISTS '{self.app_user}'@'localhost' 
                IDENTIFIED BY '{self.app_password}'
            """)
            
            cursor.execute(f"""
                CREATE USER IF NOT EXISTS '{self.app_user}'@'%' 
                IDENTIFIED BY '{self.app_password}'
            """)
            
            # Otorgar permisos
            cursor.execute(f"""
                GRANT ALL PRIVILEGES ON {self.db_name}.* TO '{self.app_user}'@'localhost'
            """)
            
            cursor.execute(f"""
                GRANT ALL PRIVILEGES ON {self.db_name}.* TO '{self.app_user}'@'%'
            """)
            
            cursor.execute("FLUSH PRIVILEGES")
            
            print(f"✅ Usuario '{self.app_user}' creado y configurado")
            
            cursor.close()
            return True
            
        except Error as e:
            print(f"❌ Error creando la base de datos: {e}")
            return False

    def execute_sql_file(self, file_path):
        """Ejecutar archivo SQL"""
        if not os.path.exists(file_path):
            print(f"❌ Archivo {file_path} no encontrado")
            return False
            
        try:
            # Conectar a la base de datos específica
            db_connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.root_user,
                password=self.root_password,
                database=self.db_name
            )
            
            cursor = db_connection.cursor()
            
            # Leer y ejecutar el archivo SQL
            with open(file_path, 'r', encoding='utf-8') as file:
                sql_content = file.read()
                
                # Dividir por declaraciones
                statements = sql_content.split(';')
                
                for statement in statements:
                    statement = statement.strip()
                    if statement and not statement.startswith('--'):
                        try:
                            cursor.execute(statement)
                        except Error as e:
                            if "already exists" not in str(e).lower():
                                print(f"⚠️  Warning ejecutando: {statement[:50]}...")
                                print(f"   Error: {e}")
            
            db_connection.commit()
            cursor.close()
            db_connection.close()
            
            print("✅ Script SQL ejecutado exitosamente")
            return True
            
        except Error as e:
            print(f"❌ Error ejecutando el script SQL: {e}")
            return False

    def verify_installation(self):
        """Verificar la instalación"""
        try:
            # Conectar con el usuario de aplicación
            test_connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.app_user,
                password=self.app_password,
                database=self.db_name
            )
            
            cursor = test_connection.cursor()
            cursor.execute("""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_schema = %s
            """, (self.db_name,))
            
            table_count = cursor.fetchone()[0]
            
            cursor.close()
            test_connection.close()
            
            if table_count > 0:
                print(f"✅ Verificación exitosa: {table_count} tablas creadas")
                return True
            else:
                print("❌ No se encontraron tablas en la base de datos")
                return False
                
        except Error as e:
            print(f"❌ Error en la verificación: {e}")
            return False

    def create_env_file(self):
        """Crear archivo .env"""
        env_path = "backend/.env"
        env_example_path = "backend/.env.example"
        
        if os.path.exists(env_path):
            print("⚠️  Archivo .env ya existe")
            return
        
        if not os.path.exists(env_example_path):
            print("❌ Archivo .env.example no encontrado")
            return
        
        # Copiar .env.example a .env
        with open(env_example_path, 'r') as example_file:
            content = example_file.read()
        
        # Reemplazar valores de base de datos
        content = content.replace("DB_HOST=localhost", f"DB_HOST={self.host}")
        content = content.replace("DB_PORT=3306", f"DB_PORT={self.port}")
        content = content.replace("DB_USERNAME=root", f"DB_USERNAME={self.app_user}")
        content = content.replace("DB_PASSWORD=your_mysql_password_here", f"DB_PASSWORD={self.app_password}")
        content = content.replace("DB_DATABASE=crm_ari", f"DB_DATABASE={self.db_name}")
        
        with open(env_path, 'w') as env_file:
            env_file.write(content)
        
        print("✅ Archivo .env creado y configurado")

    def run_setup(self):
        """Ejecutar configuración completa"""
        print("🚀 Configurando base de datos CRM ARI...")
        print()
        
        # Conectar a MySQL
        if not self.connect_mysql():
            return False
        
        # Crear base de datos y usuario
        if not self.create_database():
            return False
        
        # Ejecutar script SQL
        sql_file = "database/create_database.sql"
        if not self.execute_sql_file(sql_file):
            return False
        
        # Verificar instalación
        if not self.verify_installation():
            return False
        
        # Crear archivo .env
        self.create_env_file()
        
        # Cerrar conexión
        if self.connection and self.connection.is_connected():
            self.connection.close()
        
        print()
        print("🎉 Configuración completada exitosamente!")
        print()
        print("🔐 Información de acceso:")
        print(f"  Base de datos: {self.db_name}")
        print(f"  Host: {self.host}:{self.port}")
        print(f"  Usuario de aplicación: {self.app_user}")
        print("  Usuario admin del sistema: admin")
        print("  Contraseña admin por defecto: admin123")
        print()
        print("⚠️  IMPORTANTE: Cambia la contraseña del usuario admin después del primer login")
        print()
        print("Próximos pasos:")
        print("1. Instala las dependencias: pip install -r backend/requirements.txt")
        print("2. Ejecuta el servidor: python backend/main_new.py")
        print("3. Accede a la API en: http://localhost:8000")
        print("4. Documentación en: http://localhost:8000/docs")
        print("   (usuario: admin, contraseña: crm2025@docs)")
        
        return True


def main():
    """Función principal"""
    print("=" * 60)
    print("    CONFIGURACIÓN DE BASE DE DATOS CRM ARI")
    print("=" * 60)
    print()
    
    setup = DatabaseSetup()
    
    try:
        success = setup.run_setup()
        if success:
            sys.exit(0)
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Configuración cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()