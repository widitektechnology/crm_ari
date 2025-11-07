# 🔧 Comandos para Corregir Conexión de Base de Datos

## ❌ Problema Identificado

**Error**: `Access denied for user 'crm_user'@'172.18.0.2' (using password: NO)`

**Causa**: El contenedor Docker no está leyendo la contraseña de la base de datos desde las variables de entorno.

## 🔍 Diagnóstico

1. ✅ **Errores de compatibilidad resueltos** - SQLAlchemy, JWT, Pydantic ya funcionan
2. ❌ **Problema de configuración** - Variables de entorno no se están leyendo correctamente
3. ❌ **Archivo .env** - Puede que no esté en el lugar correcto o no tenga las variables necesarias

## 🛠️ Solución: Comandos para el Servidor

### 1. Conectarse al Servidor
```bash
ssh root@185.253.25.29
```

### 2. Ir al Directorio del Backend
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend
```

### 3. Verificar Variables de Entorno
```bash
# Verificar si existe el archivo .env
ls -la .env

# Ver el contenido del archivo .env
cat .env
```

### 4. Crear/Corregir el Archivo .env
```bash
# Crear el archivo .env con las variables correctas
cat > .env << 'EOF'
# Base de datos
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key_here_production_2025
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,https://crm.arifamilyassets.com

# Aplicación
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=production
EOF
```

### 5. Verificar Conectividad a MySQL desde el Host
```bash
# Probar conexión a MySQL desde el servidor
mysql -h localhost -u crm_user -p'crm_password_secure_2025' crm_ari -e "SELECT 1 as test;"
```

### 6. Si hay error de conectividad, verificar usuario MySQL
```bash
# Conectarse como root
mysql -u root -p

# Dentro de MySQL, verificar el usuario
SHOW GRANTS FOR 'crm_user'@'localhost';
SHOW GRANTS FOR 'crm_user'@'%';

# Si no existe, crearlo
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'crm_password_secure_2025';
GRANT ALL PRIVILEGES ON crm_ari.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 7. Reconstruir Contenedor con Variables de Entorno
```bash
# Detener contenedores
docker-compose -f docker-compose.external-db.yml down

# Limpiar imagen
docker rmi backend_backend:latest 2>/dev/null || true

# Reconstruir sin cache
docker-compose -f docker-compose.external-db.yml build --no-cache

# Levantar con logs
docker-compose -f docker-compose.external-db.yml up -d

# Ver logs inmediatamente
docker logs -f crm_ari_backend
```

### 8. Verificar Variables de Entorno en el Contenedor
```bash
# Verificar que las variables llegan al contenedor
docker exec crm_ari_backend env | grep DB_

# Verificar archivo .env dentro del contenedor
docker exec crm_ari_backend cat /app/.env
```

## 🔧 Comando Todo-en-Uno Completo

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
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
echo "✅ Archivo .env creado" && \
docker-compose -f docker-compose.external-db.yml down && \
docker rmi backend_backend:latest 2>/dev/null || true && \
docker-compose -f docker-compose.external-db.yml build --no-cache && \
docker-compose -f docker-compose.external-db.yml up -d && \
sleep 5 && \
echo "🔍 Verificando variables de entorno:" && \
docker exec crm_ari_backend env | grep DB_ && \
echo "📋 Logs del contenedor:" && \
docker logs crm_ari_backend | tail -20
```

## ✅ Verificaciones Post-Corrección

### 1. Verificar Conexión Exitosa
```bash
# Los logs deben mostrar:
# ✅ Database connection successful
# ✅ CRM ARI API started successfully
docker logs crm_ari_backend | grep -E "(successful|started|connection)"
```

### 2. Probar Health Check
```bash
curl http://localhost:8000/health
# Debe responder: {"status": "ok", "database": "ok"}
```

### 3. Probar Login de Admin
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
```

## 🎯 Cambios Clave Aplicados

1. **DB_HOST**: Cambiado a `host.docker.internal` para acceso desde contenedor
2. **Variables completas**: Todas las variables de entorno necesarias
3. **Archivo .env**: Colocado en el directorio correcto del backend
4. **Permisos MySQL**: Usuario configurado para acceso desde cualquier IP (%)

## ⚠️ Si Persiste el Problema

### Opción A: Verificar docker-compose.external-db.yml
```bash
cat docker-compose.external-db.yml
# Verificar que tenga:
# env_file:
#   - .env
```

### Opción B: Variables directas en docker-compose
```bash
# Editar docker-compose.external-db.yml para agregar variables directamente
nano docker-compose.external-db.yml

# Agregar en la sección de environment:
environment:
  - DB_HOST=host.docker.internal
  - DB_PASSWORD=crm_password_secure_2025
  - DB_USERNAME=crm_user
  - DB_DATABASE=crm_ari
```

## 🚀 Estado Esperado Final

- ✅ Contenedor inicia sin errores
- ✅ Conexión a base de datos exitosa
- ✅ API Health check responde OK
- ✅ Login de admin funciona
- ✅ Documentación accesible

¡Una vez que ejecutes estos comandos, el sistema debería estar completamente funcional! 🎉