# 🌐 Configuración de crm.arifamilyassets.com en Plesk con Nginx

## 📋 Pasos para Configurar con Nginx en Plesk

### 1. 🔧 Configuración del Subdominio en Plesk

1. **Acceder a Plesk Panel**
2. **Ir a Dominios** → **arifamilyassets.com**
3. **Crear/editar subdominio:** `crm`

### 2. 🔄 Configuración de Nginx (Método Principal)

#### Opción A: Apache & nginx Settings (Recomendado)

1. **Ir a:** `crm.arifamilyassets.com` → **"Apache & nginx Settings"**
2. **En la sección "nginx directives"** (no Apache), agregar el contenido de `plesk-nginx-config.txt`
3. **Aplicar cambios**

#### Opción B: Configuración Manual de Nginx

Si tienes acceso directo al archivo de configuración nginx:

1. **Editar:** `/etc/nginx/sites-available/crm.arifamilyassets.com`
2. **O en:** `/var/www/vhosts/arifamilyassets.com/conf/nginx.conf`

Agregar dentro del bloque `server`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name crm.arifamilyassets.com;
    
    # Tu configuración SSL aquí
    
    # ERP System Proxy Configuration
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
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
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Otros locations para /docs, /health, etc.
}
```

### 3. 🔒 Verificación SSL

1. **Asegurar que SSL esté configurado** para `crm.arifamilyassets.com`
2. **Habilitar redirección HTTP → HTTPS**

### 4. 🔄 Reiniciar Nginx

Después de los cambios:

```bash
# Verificar configuración
nginx -t

# Reiniciar nginx
systemctl reload nginx
# o
service nginx reload
```

## 🧪 URLs de Prueba

- **Frontend**: https://crm.arifamilyassets.com/
- **API**: https://crm.arifamilyassets.com/api/employees  
- **Docs**: https://crm.arifamilyassets.com/docs
- **Health**: https://crm.arifamilyassets.com/health

## 🛠️ Verificación de Problemas

### Comandos útiles:

```bash
# Verificar configuración nginx
nginx -t

# Ver logs de nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Verificar puertos
netstat -tlnp | grep :3001
netstat -tlnp | grep :8000

# Probar conexión local
curl http://127.0.0.1:3001
curl http://127.0.0.1:8000/health
```

## 📝 Diferencias clave entre Apache y Nginx:

- **Apache**: Usa `ProxyPass` y `ProxyPassReverse`
- **Nginx**: Usa `proxy_pass` y headers específicos
- **CORS**: En nginx se usan `add_header` en lugar de `Header`
- **Configuración**: Nginx es más estricto con la sintaxis

## 🚨 Notas Importantes:

1. **Usar 127.0.0.1** en lugar de localhost
2. **Configurar tanto HTTP como HTTPS**
3. **Los puertos 3001 y 8000 deben estar abiertos**
4. **Verificar que Docker esté corriendo**
5. **Aplicar cambios y recargar nginx**

---

💡 **Tip**: Si Plesk usa nginx como proxy reverso frontal, la configuración va en "nginx directives", no en "Apache directives".