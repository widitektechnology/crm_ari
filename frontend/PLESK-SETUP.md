# 🌐 Configuración Plesk para CRM System

## 📋 Pasos para Configurar en Plesk

### 1. 📁 Estructura de Archivos en el Servidor

Sube la carpeta completa `frontend` a tu dominio `crm.arifamilyassets.com` en Plesk.

```
/httpdocs/
├── frontend/
│   ├── build/           # ← Archivos compilados del CRM
│   │   ├── index.html
│   │   ├── _next/
│   │   ├── dashboard/
│   │   ├── companies/
│   │   ├── employees/
│   │   ├── finance/
│   │   ├── ai/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── auth/
│   └── (otros archivos del proyecto)
```

### 2. 🎯 Configurar Document Root

En Plesk > Hosting Settings:
- **Document Root**: Cambiar de `/httpdocs` a `/httpdocs/frontend/build`

### 3. 🔄 Configurar Redirecciones SPA (Single Page Application)

El CRM es una SPA de React, necesitas redireccionar todas las rutas al `index.html`.

#### Opción A: Usando .htaccess (Apache)

Crear archivo `.htaccess` en `/httpdocs/frontend/build/.htaccess`:

```apache
RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Configurar headers de cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

#### Opción B: Usando Nginx (si tienes acceso)

Añadir a la configuración de Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
    
    # Headers para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 🔧 Variables de Entorno

En Plesk > PHP Settings > Environment Variables, añadir:

```
NEXT_PUBLIC_API_URL=https://crm.arifamilyassets.com
NEXT_PUBLIC_BASE_URL=https://crm.arifamilyassets.com
```

### 5. 🚀 Proceso de Despliegue Completo

1. **Subir archivos**: 
   - Sube toda la carpeta `frontend` por FTP/SFTP
   
2. **Configurar Document Root**:
   - Plesk > Hosting Settings
   - Document Root: `/httpdocs/frontend/build`
   
3. **Crear .htaccess**:
   - En `/httpdocs/frontend/build/.htaccess`
   - Copiar el contenido de arriba
   
4. **Verificar permisos**:
   - Archivos: 644
   - Directorios: 755

### 6. 🧪 Probar la Configuración

Visita estas URLs para verificar:
- ✅ `https://crm.arifamilyassets.com/` → Debe cargar el login
- ✅ `https://crm.arifamilyassets.com/dashboard/` → Debe cargar dashboard
- ✅ `https://crm.arifamilyassets.com/companies/` → Debe cargar empresas
- ✅ `https://crm.arifamilyassets.com/cualquierpagina/` → Debe redirigir al index.html

### 7. 📊 Verificar APIs

El CRM está configurado para usar:
- **Backend API**: `https://crm.arifamilyassets.com/api/`
- **Health Check**: `https://crm.arifamilyassets.com/health`

### 8. 🔐 Credenciales de Acceso

- **Usuario**: admin@crm.com
- **Contraseña**: admin123

## 🛠️ Solución de Problemas

### Problema: "404 Not Found" en rutas
**Solución**: Verificar que el `.htaccess` está configurado correctamente.

### Problema: Archivos CSS/JS no cargan
**Solución**: Verificar permisos de archivos y que el Document Root esté bien configurado.

### Problema: API no responde
**Solución**: Verificar que las variables de entorno NEXT_PUBLIC_API_URL estén configuradas.

### Problema: Páginas en blanco
**Solución**: Verificar la consola del navegador para errores JavaScript.

## 📞 Soporte

Para más ayuda:
- Verificar logs de error en Plesk > Logs
- Revisar configuración SSL
- Contactar soporte de Plesk si es necesario

---
**Fecha**: 3 de noviembre de 2025  
**Versión**: CRM System v1.0.0