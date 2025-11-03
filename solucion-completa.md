# 🔧 Solución Completa - Conectar Frontend con Backend

## 🎯 El Problema
El frontend (Next.js) no puede conectarse al backend porque:
1. El frontend en el navegador intenta conectar a `localhost:8000` (que no existe en el navegador del usuario)
2. Necesita conectarse através del dominio `crm.arifamilyassets.com`

## 🚀 Solución en 3 Pasos

### Paso 1: Configurar nginx en Plesk
En Plesk → `crm.arifamilyassets.com` → "Apache & nginx Settings" → "nginx directives":

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
}

location /docs {
    proxy_pass http://127.0.0.1:8000/docs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /health {
    proxy_pass http://127.0.0.1:8000/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /openapi.json {
    proxy_pass http://127.0.0.1:8000/openapi.json;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Paso 2: Actualizar Frontend con la URL correcta
En el servidor, ejecutar:

```bash
# Parar el contenedor frontend actual
docker stop erp_frontend
docker rm erp_frontend

# Recrear con la URL correcta del dominio
docker run -d \
    --name erp_frontend \
    --network erp_network \
    -p 3001:3000 \
    -e NEXT_PUBLIC_API_URL="https://crm.arifamilyassets.com" \
    --restart unless-stopped \
    erp_frontend
```

### Paso 3: Actualizar Backend con CORS para el dominio
```bash
# Parar el contenedor backend actual
docker stop erp_backend
docker rm erp_backend

# Recrear con CORS configurado para el dominio
docker run -d \
    --name erp_backend \
    --network erp_network \
    -p 8000:8000 \
    -e DATABASE_URL="mysql://erp_user:erp_user_pass@erp_mysql:3306/erp_system" \
    -e CORS_ORIGINS="https://crm.arifamilyassets.com,http://crm.arifamilyassets.com" \
    --restart unless-stopped \
    erp_backend_fixed
```

## 🧪 Verificación
Después de estos pasos:

1. **Configurar nginx en Plesk** (Paso 1)
2. **Ejecutar comandos en el servidor** (Pasos 2 y 3)
3. **Probar URLs:**
   - https://crm.arifamilyassets.com/ (Frontend)
   - https://crm.arifamilyassets.com/api/employees (API)
   - https://crm.arifamilyassets.com/health (Health check)

## 🎯 Resultado Esperado
- ✅ Frontend carga desde https://crm.arifamilyassets.com/
- ✅ Dashboard muestra "Backend FastAPI: ✅ Conectado"
- ✅ API funciona através del dominio
- ✅ No más errores 404

---
💡 **La clave**: El frontend necesita la variable `NEXT_PUBLIC_API_URL` apuntando al dominio, no a localhost.