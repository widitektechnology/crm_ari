# 🌐 Configuración de crm.arifamilyassets.com en Plesk

## 📋 Pasos para Configurar el Dominio en Plesk

### 1. 🔧 Configuración del Subdominio

1. **Acceder a Plesk Panel**
   - Ir a **Dominios** → **arifamilyassets.com**
   - Crear subdominio **crm** o ir a subdominios existentes

2. **Crear/Editar Subdominio crm**
   - Nombre: `crm`
   - Documento root: `/httpdocs/crm` (o directorio deseado)

### 2. 🔄 Configuración de Proxy Reverso (Opción Recomendada)

#### Opción A: Usando Apache & nginx Settings

1. **Ir a crm.arifamilyassets.com** → **Apache & nginx Settings**

2. **En "Additional directives for HTTP"** agregar:
```apache
# ERP System Proxy Configuration
ProxyPreserveHost On
ProxyRequests Off

# Frontend (Next.js) - Puerto 3001
ProxyPass / http://127.0.0.1:3001/
ProxyPassReverse / http://127.0.0.1:3001/

# API Backend (FastAPI) - Puerto 8000
ProxyPass /api/ http://127.0.0.1:8000/api/
ProxyPassReverse /api/ http://127.0.0.1:8000/api/

# Documentación API
ProxyPass /docs http://127.0.0.1:8000/docs
ProxyPassReverse /docs http://127.0.0.1:8000/docs

ProxyPass /openapi.json http://127.0.0.1:8000/openapi.json
ProxyPassReverse /openapi.json http://127.0.0.1:8000/openapi.json

# Health checks
ProxyPass /health http://127.0.0.1:8000/health
ProxyPassReverse /health http://127.0.0.1:8000/health

ProxyPass /status http://127.0.0.1:8000/status
ProxyPassReverse /status http://127.0.0.1:8000/status

# Headers para CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

3. **En "Additional directives for HTTPS"** agregar la misma configuración

#### Opción B: Usando Extensión Proxy (si está disponible)

1. **Ir a Extensiones** → buscar **Proxy**
2. **Configurar reglas de proxy:**
   - **Frontend**: `https://crm.arifamilyassets.com/` → `http://127.0.0.1:3001/`
   - **API**: `https://crm.arifamilyassets.com/api/` → `http://127.0.0.1:8000/api/`

### 3. 📁 Configuración Alternativa con .htaccess

Si no tienes acceso a Apache Settings, crear archivo `.htaccess` en `/httpdocs/crm/`:

```apache
RewriteEngine On

# Proxy para API Backend
RewriteRule ^api/(.*)$ http://127.0.0.1:8000/api/$1 [P,L]
RewriteRule ^docs$ http://127.0.0.1:8000/docs [P,L]
RewriteRule ^openapi\.json$ http://127.0.0.1:8000/openapi.json [P,L]
RewriteRule ^health$ http://127.0.0.1:8000/health [P,L]
RewriteRule ^status$ http://127.0.0.1:8000/status [P,L]

# Todo lo demás va al frontend
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Headers CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### 4. 🔒 Configuración SSL

1. **Ir a SSL/TLS Certificates**
2. **Instalar certificado** para `crm.arifamilyassets.com`
3. **Habilitar "Redirect HTTP to HTTPS"**

### 5. 🚨 Verificación de Puertos

**Importante**: Verificar que los puertos estén abiertos en el firewall:
- Puerto **3001** (Frontend Next.js)
- Puerto **8000** (Backend FastAPI)
- Puerto **3307** (MySQL - solo interno)

### 6. 🐳 Asegurar que Docker esté corriendo

Antes de configurar Plesk, asegúrate de que los contenedores estén funcionando:

```powershell
# Verificar Docker
docker ps

# Si no están corriendo, usar el script de despliegue
bash final-deploy.sh
```

## 🧪 Pruebas Después de Configurar

### URLs de Prueba:
- **Frontend**: https://crm.arifamilyassets.com/
- **API**: https://crm.arifamilyassets.com/api/employees
- **Docs**: https://crm.arifamilyassets.com/docs
- **Health**: https://crm.arifamilyassets.com/health

### Comandos de Verificación:
```bash
curl https://crm.arifamilyassets.com/health
curl https://crm.arifamilyassets.com/api/employees
```

## 🛠️ Solución de Problemas Comunes

### Error 404:
- ✅ Verificar que los contenedores Docker estén corriendo
- ✅ Comprobar que los puertos 3001 y 8000 estén accesibles
- ✅ Revisar la configuración del proxy en Plesk
- ✅ Verificar que SSL esté correctamente configurado

### Error 502/503:
- ✅ Verificar que los servicios estén corriendo en los puertos correctos
- ✅ Comprobar logs de Docker: `docker logs erp_backend` y `docker logs erp_frontend`
- ✅ Verificar firewall del servidor

### CORS Errors:
- ✅ Asegurar que los headers CORS están configurados en Apache
- ✅ Verificar la configuración de CORS en el backend FastAPI

## 📝 Notas Importantes

1. **Usar 127.0.0.1** en lugar de localhost en la configuración de Plesk
2. **Configurar tanto HTTP como HTTPS** si usas SSL
3. **Reiniciar Apache** después de cambios: `service apache2 restart`
4. **Monitorear logs** de Plesk para errores: `/var/log/apache2/error.log`

---

💡 **Tip**: Si tienes problemas, puedes usar la extensión "Website Import" de Plesk para importar la configuración completa del sitio.