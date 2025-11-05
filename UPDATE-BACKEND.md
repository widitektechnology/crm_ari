# 🚀 Script para Actualizar Backend con Endpoints de Correo

## Paso 1: Subir nuevo código del backend

# Desde tu máquina local (otra terminal):
scp -r backend-example/ root@57.129.144.154:/root/backend-mail/

## Paso 2: En el servidor SSH, actualizar el contenedor

# 1. Parar el contenedor actual
docker stop erp_backend

# 2. Hacer backup del contenedor actual (opcional)
docker commit erp_backend erp_backend_backup

# 3. Ir al directorio del nuevo backend
cd /root/backend-mail

# 4. Construir nueva imagen con endpoints de correo
docker build -t erp_backend_mail .

# 5. Ejecutar nuevo contenedor
docker run -d \
  --name erp_backend_mail \
  -p 8000:8000 \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:8000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  erp_backend_mail

# 6. Verificar que está corriendo
docker ps

# 7. Probar nuevo endpoint de correo
curl http://localhost:8000/api/health
curl http://localhost:8000/api/mail/test-connection

## Paso 3: Limpiar contenedor viejo (opcional)
# docker rm erp_backend