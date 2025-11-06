# 📁 ORGANIZACIÓN DE ARCHIVOS CRM ARI

## Estructura correcta del proyecto:

```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
├── � backend/
│   ├── 📄 main.py                          # ✅ Archivo principal actualizado
│   ├── 📄 requirements.txt                 # ✅ Con todas las dependencias
│   ├── 📄 Dockerfile                       # ✅ Ya existe
│   ├── 📄 .env                            # ✅ Variables de entorno del backend
│   ├── 📄 docker-compose.external-db.yml  # ✅ Docker compose para BD externa
│   ├── 📄 .env.docker                     # ✅ Variables para Docker
│   ├── 📄 deploy_docker_external_db.sh    # ✅ Script de deployment
│   ├── 📄 docker_manage.sh                # ✅ Gestión de contenedores
│   ├── 📄 verify_installation.py          # ✅ Script de verificación
│   ├── 📄 test_connection.py              # ✅ Test rápido de conexión
│   └── 📁 src/
│       ├── 📁 database/
│       │   ├── 📄 models.py               # ✅ SQLAlchemy models
│       │   └── 📄 connection.py           # ✅ Conexión a DB
│       ├── 📁 services/
│       │   └── 📄 auth.py                 # ✅ Servicio de autenticación
│       └── 📁 api/
│           └── 📁 routers/
│               ├── 📄 auth.py             # ✅ Router de autenticación
│               └── 📄 users.py            # ✅ Router de usuarios
└── 📁 frontend/
    └── (archivos del frontend)
```

## 🚀 COMANDOS PARA EJECUTAR:

### Desde el directorio backend (TODO desde aquí):
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend

# Hacer ejecutables los scripts
chmod +x *.sh

# Deployment completo
./deploy_docker_external_db.sh

# Gestión de contenedores
./docker_manage.sh status

# Test de conexión local (sin Docker)
python3 test_connection.py

# Verificación completa
python3 verify_installation.py
```

## 🔧 ARCHIVOS PRINCIPALES:

### TODO en backend/ (/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/):
- **docker-compose.external-db.yml**: Configuración de Docker con BD externa
- **.env.docker**: Variables de entorno para Docker Compose
- **deploy_docker_external_db.sh**: Script de deployment automático
- **docker_manage.sh**: Gestión rápida de contenedores
- **main.py**: API actualizada con integración MySQL
- **.env**: Variables de entorno del backend
- **src/**: Código fuente con models, services, y routers

## ⚡ DEPLOYMENT RÁPIDO:

```bash
# 1. Ir al directorio backend
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend

# 2. Ejecutar deployment
./deploy_docker_external_db.sh

# 3. Verificar
./docker_manage.sh status
```

## 🔍 VERIFICACIÓN:

Una vez deployado, estas URLs deberían funcionar:
- http://localhost:8000/health
- http://localhost:8000/docs (admin/crm2025@docs)
- http://localhost:8000/api/auth/login