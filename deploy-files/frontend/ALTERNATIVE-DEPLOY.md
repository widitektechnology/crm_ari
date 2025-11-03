# 🚨 SOLUCIÓN ALTERNATIVA - Si Document Root no funciona

## Método 1: Mover CRM al directorio raíz

Si no puedes cambiar el Document Root en Plesk, vamos a mover los archivos del CRM directamente al directorio raíz:

### En el servidor, ejecuta estos comandos:

```bash
# 1. Hacer backup del contenido actual
cd /httpdocs
mkdir backup-$(date +%Y%m%d)
mv *.py *.txt requirements.txt backup-* 2>/dev/null || true

# 2. Copiar archivos del CRM al root
cp -r frontend/build/* ./

# 3. Verificar que se copiaron
ls -la | grep index.html
```

### Estructura resultante:
```
/httpdocs/
├── index.html           ← CRM Login (nuevo)
├── .htaccess           ← CRM rules (nuevo)
├── _next/              ← CRM assets (nuevo)
├── dashboard/
├── companies/
├── frontend/           ← Carpeta original (mantener)
└── backup-20251103/    ← Backend original (backup)
```

## Método 2: Configurar subdirectorio

Si prefieres mantener el backend y CRM separados:

### 1. Crear configuración en el root `/httpdocs/.htaccess`:

```apache
RewriteEngine On

# Redireccionar root al CRM
RewriteRule ^$ /frontend/build/ [R=301,L]

# Servir archivos del CRM desde subdirectorio
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/health
RewriteCond %{REQUEST_URI} !^/docs
RewriteCond %{REQUEST_URI} !^/admin
RewriteRule ^(.*)$ /frontend/build/$1 [L]
```

## Método 3: Configuración de Nginx (si tienes acceso)

Si usas Nginx en lugar de Apache:

```nginx
server {
    server_name crm.arifamilyassets.com;
    root /httpdocs/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API backend en subdirectorio
    location /api/ {
        proxy_pass http://localhost:8000;
    }
    
    location /health {
        proxy_pass http://localhost:8000;
    }
}
```

## Método 4: Verificar configuración actual de Plesk

Para debuggear qué está pasando, verifica:

### 1. Document Root actual:
```bash
# En el servidor
pwd
ls -la
# Debe mostrar index.html del CRM, no del backend
```

### 2. Configuración de Apache:
```bash
# Buscar configuración del dominio
find /etc -name "*crm.arifamilyassets.com*" 2>/dev/null
```

### 3. Logs de Apache:
```bash
tail -f /var/log/apache2/error.log
# Mientras intentas acceder a la URL
```

## ✅ RECOMENDACIÓN: Usar Método 1

El más simple es **mover los archivos del CRM al root**:

1. **Backup del backend actual**
2. **Copiar archivos de `frontend/build/*` a `/httpdocs/`**
3. **Verificar que `https://crm.arifamilyassets.com/` muestre el login**

¿Tienes acceso SSH al servidor para ejecutar estos comandos?