# 🚨 SOLUCIÓN URGENTE - Problema de Variables de Entorno

## ❌ PROBLEMA IDENTIFICADO
El contenedor Docker **NO está leyendo las variables de entorno**. 

**Error**: `Access denied for user 'crm_user'@'172.18.0.2' (using password: NO)`

## 🎯 DIAGNÓSTICOS NECESARIOS

### 1. Conectarse al Servidor y Diagnosticar
```bash
ssh root@185.253.25.29
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend
```

### 2. Verificar si existe el archivo .env
```bash
ls -la .env
cat .env
```

### 3. Verificar configuración docker-compose
```bash
cat docker-compose.external-db.yml | grep -A 10 -B 5 env
```

## 🔧 SOLUCIÓN PASO A PASO

### PASO 1: Crear archivo .env correcto
```bash
cat > .env << 'EOF'
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
JWT_SECRET_KEY=your_super_secret_jwt_key_here_production_2025
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,https://crm.arifamilyassets.com
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=production
EOF
```

### PASO 2: Verificar docker-compose.external-db.yml
```bash
# El archivo debe tener esta configuración:
cat > docker-compose.external-db.yml << 'EOF'
version: '3.8'
services:
  backend:
    build: .
    container_name: crm_ari_backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - DB_HOST=host.docker.internal
      - DB_PASSWORD=crm_password_secure_2025
      - DB_USERNAME=crm_user
      - DB_DATABASE=crm_ari
      - DB_PORT=3306
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - crm_network
    restart: unless-stopped

networks:
  crm_network:
    driver: bridge
EOF
```

### PASO 3: Reconstruir contenedor
```bash
# Detener todo
docker-compose -f docker-compose.external-db.yml down

# Limpiar imagen
docker rmi backend_backend:latest 2>/dev/null || true

# Reconstruir
docker-compose -f docker-compose.external-db.yml build --no-cache

# Levantar
docker-compose -f docker-compose.external-db.yml up -d
```

### PASO 4: Verificar variables en el contenedor
```bash
# Verificar que las variables llegan al contenedor
docker exec crm_ari_backend env | grep DB_

# Ver logs
docker logs crm_ari_backend
```

## 🚀 COMANDO TODO-EN-UNO DEFINITIVO

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
echo "🔧 Creando archivo .env..." && \
cat > .env << 'EOF'
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
JWT_SECRET_KEY=your_super_secret_jwt_key_here_production_2025
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,https://crm.arifamilyassets.com
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=production
EOF
echo "🔧 Actualizando docker-compose..." && \
cat > docker-compose.external-db.yml << 'EOF'
version: '3.8'
services:
  backend:
    build: .
    container_name: crm_ari_backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - DB_HOST=host.docker.internal
      - DB_PASSWORD=crm_password_secure_2025
      - DB_USERNAME=crm_user
      - DB_DATABASE=crm_ari
      - DB_PORT=3306
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - crm_network
    restart: unless-stopped

networks:
  crm_network:
    driver: bridge
EOF
echo "🛑 Deteniendo contenedores..." && \
docker-compose -f docker-compose.external-db.yml down && \
echo "🗑️ Limpiando imagen..." && \
docker rmi backend_backend:latest 2>/dev/null || true && \
echo "🔨 Reconstruyendo..." && \
docker-compose -f docker-compose.external-db.yml build --no-cache && \
echo "🚀 Iniciando..." && \
docker-compose -f docker-compose.external-db.yml up -d && \
sleep 10 && \
echo "🔍 Verificando variables:" && \
docker exec crm_ari_backend env | grep DB_ && \
echo "📋 Logs del contenedor:" && \
docker logs crm_ari_backend | tail -15
```

## ✅ RESULTADO ESPERADO

Después de ejecutar esto, deberías ver:

```
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
```

Y en los logs:
```
✅ Database connection successful
✅ CRM ARI API started successfully
```

## 🔍 SI AÚN NO FUNCIONA

### Verificar conectividad MySQL desde el host
```bash
mysql -h localhost -u crm_user -p'crm_password_secure_2025' crm_ari -e "SELECT 1 as test;"
```

### Si hay problema con el usuario MySQL
```bash
mysql -u root -p -e "
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'crm_password_secure_2025';
GRANT ALL PRIVILEGES ON crm_ari.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
"
```

## 📊 ESTADO ACTUAL VS ESPERADO

**ACTUAL**: `(using password: NO)` ❌
**ESPERADO**: `(using password: YES)` ✅

**ACTUAL**: Contenedor falla al conectar ❌
**ESPERADO**: `✅ Database connection successful` ✅

¡Ejecuta el comando todo-en-uno y esto debería resolver definitivamente el problema! 🎉