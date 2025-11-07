#!/usr/bin/env python3
"""
Script para arreglar el hash de contraseña del usuario admin
"""
import os
import sys

# Asegurar que estamos en el directorio correcto
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/src')

# Configurar variables de entorno
os.environ['ENVIRONMENT'] = 'production'
os.environ['USE_PRODUCTION_CONFIG'] = 'true'

try:
    # Importaciones
    from database.connection import get_session_local
    from models.user import User
    from services.auth import AuthService
    
    print("🔍 Iniciando diagnóstico y reparación del usuario admin...")
    
    # Crear sesión
    SessionLocal = get_session_local()
    session = SessionLocal()
    
    try:
        # Buscar usuario admin
        admin_user = session.query(User).filter(User.username == 'admin').first()
        
        if admin_user:
            print(f"✅ Usuario encontrado: {admin_user.username}")
            print(f"📏 Longitud del hash actual: {len(admin_user.password_hash)} bytes")
            print(f"🔒 Hash actual (primeros 60 caracteres): {admin_user.password_hash[:60]}...")
            
            # El problema es que bcrypt tiene límite de 72 bytes para la ENTRADA
            # pero el hash almacenado puede ser más largo
            
            # Crear nuevo hash correcto para 'admin123'
            print("🔧 Generando nuevo hash para contraseña 'admin123'...")
            new_hash = AuthService.get_password_hash('admin123')
            print(f"✨ Nuevo hash generado (longitud: {len(new_hash)} bytes)")
            print(f"🔒 Nuevo hash: {new_hash[:60]}...")
            
            # Actualizar en la base de datos
            admin_user.password_hash = new_hash
            session.commit()
            print("✅ Hash actualizado correctamente en la base de datos")
            
            # Verificar que funciona
            print("🧪 Probando autenticación...")
            test_user = AuthService.authenticate_user(session, 'admin', 'admin123')
            if test_user:
                print("✅ Autenticación exitosa - ¡El problema está resuelto!")
            else:
                print("❌ Error en la autenticación después de la actualización")
                
        else:
            print("❌ Usuario admin no encontrado en la base de datos")
            
    finally:
        session.close()
        print("🏁 Script completado")
        
except Exception as e:
    print(f"❌ Error durante la ejecución: {e}")
    import traceback
    traceback.print_exc()