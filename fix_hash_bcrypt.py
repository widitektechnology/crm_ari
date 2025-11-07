import bcrypt
import mysql.connector

print("🔧 Iniciando reparación de hash de contraseña con bcrypt directo...")

# Generar hash correcto para "admin123"
correct_password = "admin123"
password_bytes = correct_password.encode('utf-8')

# Generar salt y hash
salt = bcrypt.gensalt()
new_hash = bcrypt.hashpw(password_bytes, salt)
new_hash_str = new_hash.decode('utf-8')

print(f"✨ Nuevo hash generado: {new_hash_str}")
print(f"📏 Longitud del nuevo hash: {len(new_hash_str)} bytes")

# Conectar a MySQL
try:
    conn = mysql.connector.connect(
        host="172.17.0.1",
        user="crm_user", 
        password="crm_password_secure_2025",
        database="crm_ari"
    )
    cursor = conn.cursor()
    
    # Verificar hash actual
    cursor.execute("SELECT username, password_hash FROM users WHERE username = %s", ("admin",))
    result = cursor.fetchone()
    
    if result:
        username, old_hash = result
        print(f"🔍 Usuario: {username}")
        print(f"📏 Longitud del hash actual: {len(old_hash)} bytes")
        print(f"🔒 Hash actual: {old_hash[:60]}...")
    
    # Actualizar hash en la BD
    update_query = "UPDATE users SET password_hash = %s WHERE username = %s"
    cursor.execute(update_query, (new_hash_str, "admin"))
    conn.commit()
    
    print(f"✅ Hash actualizado en la BD. Filas afectadas: {cursor.rowcount}")
    
    # Verificar que funciona
    cursor.execute("SELECT username, password_hash FROM users WHERE username = %s", ("admin",))
    result = cursor.fetchone()
    
    if result:
        username, stored_hash = result
        print(f"🔍 Usuario: {username}")
        print(f"🔒 Nuevo hash almacenado: {stored_hash[:60]}...")
        
        # Probar verificación
        stored_hash_bytes = stored_hash.encode('utf-8')
        is_valid = bcrypt.checkpw(password_bytes, stored_hash_bytes)
        print(f"🧪 Verificación de contraseña: {'✅ ÉXITO' if is_valid else '❌ FALLO'}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("🏁 Script completado")