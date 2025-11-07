# 🔥 FIX URGENTE - Variables de Entorno Docker

## ❌ Problema Actual
El contenedor Docker NO está leyendo las variables de entorno correctamente.

Error: `Access denied for user 'crm_user'@'172.18.0.2' (using password: NO)`

## ✅ Solución TODO-EN-UNO

### 1. Detener contenedor actual
```bash
docker-compose -f docker-compose.external-db.yml down
```

### 2. Crear archivo .env correcto
```bash
# Crear .env en el directorio raíz (NO en backend)
cat > .env << 'EOF'
# Base de datos
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET_KEY=crm_super_secret_key_2025_secure
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# App
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=production
EOF
```

### 3. Verificar que .env existe
```bash
ls -la .env
cat .env
```

### 4. Reconstruir y ejecutar
```bash
# Limpiar todo
docker-compose -f docker-compose.external-db.yml down
docker system prune -f

# Reconstruir sin cache
docker-compose -f docker-compose.external-db.yml build --no-cache

# Iniciar con logs
docker-compose -f docker-compose.external-db.yml up
```

## 🔧 Verificación del Fix

### Comprobar variables en el contenedor:
```bash
# En otra terminal
docker exec -it crm_ari_backend env | grep DB_
```

### Debería mostrar:
```
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
```

## 🚀 Comando TODO-EN-UNO (Copia y pega)

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
docker-compose -f docker-compose.external-db.yml down && \
cat > .env << 'EOF'
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
JWT_SECRET_KEY=crm_super_secret_key_2025_secure
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=production
EOF
echo "✅ Archivo .env creado" && \
cat .env && \
echo "🔄 Reconstruyendo contenedor..." && \
docker-compose -f docker-compose.external-db.yml build --no-cache && \
echo "🚀 Iniciando contenedor..." && \
docker-compose -f docker-compose.external-db.yml up -d && \
echo "📋 Verificando logs..." && \
docker-compose -f docker-compose.external-db.yml logs -f
```

## 🎯 Resultado Esperado

Los logs deberían mostrar:
```
crm_ari_backend | ✅ Database connection successful!
crm_ari_backend | 🚀 CRM ARI API Server started on http://0.0.0.0:8000
```

## 📝 Notas

- El archivo .env debe estar en el mismo directorio que docker-compose.external-db.yml
- DB_HOST debe ser `host.docker.internal` para acceder a MySQL desde Docker
- Si sigue fallando, verificar que MySQL permite conexiones desde 172.18.0.0/16

## 🔍 Debug Avanzado

Si sigue fallando:
```bash
# Ver variables de entorno en el contenedor
docker exec crm_ari_backend printenv | grep DB

# Ver archivo .env
ls -la .env

# Verificar red Docker
docker network ls
docker network inspect backend_crm_network
```