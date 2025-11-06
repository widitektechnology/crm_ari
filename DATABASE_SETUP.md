# 🚀 Configuración de Base de Datos - CRM ARI

Esta guía te ayudará a configurar la base de datos MySQL para el sistema CRM ARI con todas las tablas necesarias para autenticación, gestión de empresas, empleados, correo electrónico y más.

## 📋 Requisitos Previos

### 1. MySQL Server
Instala MySQL Server 8.0 o superior:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server mysql-client

# CentOS/RHEL
sudo yum install mysql-server mysql

# macOS (Homebrew)
brew install mysql

# Windows
# Descarga e instala desde: https://dev.mysql.com/downloads/mysql/
```

### 2. Python Dependencies
```bash
pip install mysql-connector-python python-dotenv
```

## 🛠️ Métodos de Configuración

### Método 1: Script Automático de Python (Recomendado)

```bash
# Desde el directorio raíz del proyecto
python setup_database.py
```

El script te pedirá:
- Host de MySQL (por defecto: localhost)
- Puerto de MySQL (por defecto: 3306)
- Usuario root de MySQL
- Contraseña de root de MySQL

### Método 2: Script Bash (Linux/macOS)

```bash
# Hacer el script ejecutable
chmod +x setup_database.sh

# Ejecutar
./setup_database.sh
```

### Método 3: Configuración Manual

#### 1. Conectar a MySQL como root
```bash
mysql -u root -p
```

#### 2. Crear la base de datos
```sql
CREATE DATABASE crm_ari CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Crear usuario de aplicación
```sql
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'crm_password_secure_2025';
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'crm_password_secure_2025';

GRANT ALL PRIVILEGES ON crm_ari.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON crm_ari.* TO 'crm_user'@'%';

FLUSH PRIVILEGES;
```

#### 4. Ejecutar script de creación de tablas
```bash
mysql -u root -p crm_ari < database/create_database.sql
```

#### 5. Configurar variables de entorno
```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### 🔐 Sistema de Autenticación
- **users**: Usuarios del sistema
- **roles**: Roles y permisos
- **user_roles**: Relación usuarios-roles
- **user_sessions**: Sesiones activas

#### 🏢 Gestión Empresarial
- **companies**: Empresas/clientes
- **employees**: Empleados de las empresas

#### 📧 Sistema de Correo
- **mail_accounts**: Cuentas de correo configuradas
- **mail_folders**: Carpetas IMAP
- **mail_messages**: Mensajes de correo
- **mail_attachments**: Archivos adjuntos

#### 📝 Actividades y Seguimiento
- **activities**: Llamadas, reuniones, tareas
- **notes**: Notas y documentación

#### ⚙️ Configuración y Auditoría
- **system_settings**: Configuración del sistema
- **user_settings**: Preferencias de usuario
- **audit_logs**: Logs de auditoría

## 🔑 Usuarios Por Defecto

### Usuario Administrador
- **Usuario**: `admin`
- **Email**: `admin@crm.arifamilyassets.com`
- **Contraseña**: `admin123`
- **Roles**: Administrador, Superusuario

⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer login.

### Acceso a Documentación
- **Usuario**: `admin`
- **Contraseña**: `crm2025@docs`
- **URL**: `http://localhost:8000/docs`

## 🧪 Verificación de la Instalación

### 1. Verificar conexión
```python
python -c "
from backend.src.database.connection import test_connection
print('✅ Conexión exitosa' if test_connection() else '❌ Error de conexión')
"
```

### 2. Verificar tablas
```sql
USE crm_ari;
SHOW TABLES;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'crm_ari';
```

### 3. Verificar usuario admin
```sql
SELECT id, username, email, is_admin FROM users WHERE username = 'admin';
```

## 🚀 Iniciar el Sistema

### 1. Instalar dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 2. Ejecutar el servidor
```bash
python main_new.py
```

### 3. Acceder a la API
- **API**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_secure_2025
DB_DATABASE=crm_ari
DB_CHARSET=utf8mb4
DB_ECHO=false  # true para debug SQL
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,https://crm.arifamilyassets.com

# Aplicación
APP_NAME=CRM ARI Family Assets
APP_VERSION=2.0.0
APP_ENVIRONMENT=development
```

### Pool de Conexiones

El sistema usa un pool de conexiones SQLAlchemy:
- **Tamaño del pool**: 10 conexiones
- **Overflow máximo**: 20 conexiones adicionales
- **Ping de salud**: Habilitado
- **Reciclaje**: 1 hora

### Índices y Optimización

La base de datos incluye índices optimizados para:
- Búsquedas por usuario/email
- Filtros por empresa/empleado
- Búsquedas de texto completo en mensajes
- Consultas de auditoría y logs

## 🛡️ Seguridad

### Contraseñas
- Hash con bcrypt (12 rounds por defecto)
- Salt único por contraseña
- Verificación con tiempo constante

### Sesiones
- Tokens JWT firmados
- Sesiones en base de datos
- Expiración automática
- Revocación de sesiones

### Datos Sensibles
- Contraseñas de correo encriptadas
- Configuración de JWT en variables de entorno
- Logs de auditoría para cambios críticos

## 📈 Monitoreo y Mantenimiento

### Logs de la Aplicación
```bash
# Ver logs en tiempo real
tail -f logs/crm_ari.log

# Buscar errores
grep -i error logs/crm_ari.log
```

### Consultas de Monitoreo
```sql
-- Usuarios activos
SELECT COUNT(*) FROM users WHERE is_active = TRUE;

-- Sesiones activas
SELECT COUNT(*) FROM user_sessions WHERE is_active = TRUE AND expires_at > NOW();

-- Cuentas de correo configuradas
SELECT COUNT(*) FROM mail_accounts WHERE is_active = TRUE;

-- Actividad reciente
SELECT action, COUNT(*) as count 
FROM audit_logs 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) 
GROUP BY action;
```

### Respaldo
```bash
# Backup completo
mysqldump -u root -p crm_ari > backup_crm_ari_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u root -p crm_ari < backup_crm_ari_20251106_140000.sql
```

## ❗ Solución de Problemas

### Error: "Access denied for user"
```bash
# Verificar usuario y permisos
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User = 'crm_user';"
mysql -u root -p -e "SHOW GRANTS FOR 'crm_user'@'localhost';"
```

### Error: "Unknown database 'crm_ari'"
```bash
# Verificar que la base de datos existe
mysql -u root -p -e "SHOW DATABASES LIKE 'crm_ari';"
```

### Error: "Table doesn't exist"
```bash
# Verificar tablas
mysql -u root -p crm_ari -e "SHOW TABLES;"

# Re-ejecutar script de creación
mysql -u root -p crm_ari < database/create_database.sql
```

### Error de conexión de pool
```bash
# Verificar configuración de pool en .env
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10

# Reiniciar aplicación
```

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs de la aplicación
2. Comprueba la configuración de `.env`
3. Verifica que MySQL esté ejecutándose
4. Confirma que las tablas existen
5. Revisa los permisos del usuario de base de datos

Para más ayuda, revisa la documentación de la API en `/docs` una vez que el sistema esté ejecutándose.