# 🔍 Diagnóstico de Conexión Docker - CRM ARI

El contenedor se construye correctamente pero falla la conexión a la base de datos con:
```
Exception: Database connection failed
```

## 📋 Comandos de Diagnóstico

### 1. Verificar Variables de Entorno en el Contenedor
```bash
docker exec -it crm_ari_backend env | grep -E "(DB_|MYSQL_)"
```

### 2. Probar Conexión MySQL desde el Contenedor
```bash
# Conectar al contenedor
docker exec -it crm_ari_backend bash

# Verificar conectividad de red
ping host.docker.internal

# Probar conexión MySQL
python3 -c "
import mysql.connector
try:
    conn = mysql.connector.connect(
        host='host.docker.internal',
        port=3306,
        user='crm_user',
        password='crm_password_secure_2025',
        database='crm_ari'
    )
    print('✅ Conexión MySQL exitosa')
    conn.close()
except Exception as e:
    print(f'❌ Error MySQL: {e}')
"
```

### 3. Verificar Configuración de Aplicación
```bash
# Desde dentro del contenedor
python3 -c "
from src.config.settings import get_settings
settings = get_settings()
print(f'DB_HOST: {settings.database.DB_HOST}')
print(f'DB_PORT: {settings.database.DB_PORT}')
print(f'DB_USERNAME: {settings.database.DB_USERNAME}')
print(f'DB_PASSWORD: {settings.database.DB_PASSWORD[:4]}...')
print(f'DB_DATABASE: {settings.database.DB_DATABASE}')
"
```

### 4. Test Directo de SQLAlchemy
```bash
# Desde dentro del contenedor
python3 -c "
from src.database.connection import test_connection
result = test_connection()
print(f'Test connection result: {result}')
"
```

## 🚀 Comandos Todo-en-Uno para Diagnóstico

### Diagnóstico Completo
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
echo "=== VERIFICANDO VARIABLES DE ENTORNO ===" && \
docker exec crm_ari_backend env | grep -E "(DB_|MYSQL_)" && \
echo -e "\n=== VERIFICANDO CONECTIVIDAD ===" && \
docker exec crm_ari_backend ping -c 3 host.docker.internal && \
echo -e "\n=== PROBANDO CONEXIÓN MYSQL DIRECTA ===" && \
docker exec crm_ari_backend python3 -c "
import mysql.connector
try:
    conn = mysql.connector.connect(
        host='host.docker.internal',
        port=3306,
        user='crm_user',
        password='crm_password_secure_2025',
        database='crm_ari'
    )
    print('✅ MySQL directo: ÉXITO')
    conn.close()
except Exception as e:
    print(f'❌ MySQL directo: {e}')
" && \
echo -e "\n=== VERIFICANDO CONFIGURACIÓN APP ===" && \
docker exec crm_ari_backend python3 -c "
from src.config.settings import get_settings
settings = get_settings()
print(f'DB_HOST: {settings.database.DB_HOST}')
print(f'DB_PORT: {settings.database.DB_PORT}')
print(f'DB_USERNAME: {settings.database.DB_USERNAME}')
print(f'DB_PASSWORD: {settings.database.DB_PASSWORD[:4]}...')
print(f'DB_DATABASE: {settings.database.DB_DATABASE}')
" && \
echo -e "\n=== PROBANDO TEST_CONNECTION ===" && \
docker exec crm_ari_backend python3 -c "
from src.database.connection import test_connection
try:
    result = test_connection()
    print(f'✅ test_connection(): {result}')
except Exception as e:
    print(f'❌ test_connection(): {e}')
"
```

## 🔧 Posibles Problemas y Soluciones

### 1. Variables de Entorno No Se Leen
**Síntoma**: Variables DB_* aparecen vacías
**Solución**: Reconstruir con configuración explícita en docker-compose

```bash
# Agregar variables explícitamente al docker-compose
cat >> docker-compose.external-db.yml << 'EOF'
      environment:
        - DB_HOST=host.docker.internal
        - DB_PORT=3306
        - DB_USERNAME=crm_user
        - DB_PASSWORD=crm_password_secure_2025
        - DB_DATABASE=crm_ari
EOF
```

### 2. Host Docker No Resuelve
**Síntoma**: ping host.docker.internal falla
**Solución**: Usar IP del host o configurar networking

```bash
# Obtener IP del host
docker exec crm_ari_backend getent hosts host.docker.internal
# O usar IP directa: 172.17.0.1 (gateway de Docker)
```

### 3. MySQL No Acepta Conexiones Remotas
**Síntoma**: Connection refused o Access denied
**Solución**: Verificar configuración MySQL

```bash
# Verificar que MySQL acepta conexiones desde cualquier IP
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User = 'crm_user';"
```

### 4. Puerto MySQL No Disponible
**Síntoma**: Connection timeout
**Solución**: Verificar que puerto 3306 está abierto

```bash
# Desde el host
netstat -ln | grep 3306
```

## 🚨 Quick Fix: Forzar Variables de Entorno

Si el diagnóstico muestra que las variables no se leen, usar este fix:

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
docker-compose -f docker-compose.external-db.yml down && \
# Recrear docker-compose con variables explícitas
cp docker-compose.external-db.yml docker-compose.external-db.yml.backup && \
cat > docker-compose.external-db.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crm_ari_backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - DB_HOST=host.docker.internal
      - DB_PORT=3306
      - DB_USERNAME=crm_user
      - DB_PASSWORD=crm_password_secure_2025
      - DB_DATABASE=crm_ari
      - DB_CHARSET=utf8mb4
      - JWT_SECRET_KEY=crm_super_secret_key_2025_secure
      - JWT_ALGORITHM=HS256
      - JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
      - APP_NAME=CRM ARI Family Assets
      - APP_VERSION=2.0.0
      - APP_ENVIRONMENT=production
    networks:
      - crm_network
    restart: unless-stopped

networks:
  crm_network:
    driver: bridge
EOF
docker-compose -f docker-compose.external-db.yml up -d && \
sleep 5 && \
docker-compose -f docker-compose.external-db.yml logs --tail=20
```

## 📞 Next Steps

1. **Ejecutar diagnóstico completo**
2. **Identificar el punto exacto de falla**  
3. **Aplicar la corrección específica**
4. **Verificar conexión exitosa**
5. **Probar endpoints de la API**
