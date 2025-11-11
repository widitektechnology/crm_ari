# 🏢 CONFIGURACIÓN PLESK PARA SPA REACT

## 📋 PASOS EN PLESK:

### 1️⃣ IR A APACHE & NGINX SETTINGS:
- Subdominio: crm.arifamilyassets.com
- Ir a "Apache & nginx Settings"

### 2️⃣ CONFIGURACIÓN NGINX:
En "Additional nginx directives":

```nginx
# Configuración para SPA React
location / {
    try_files $uri $uri/ /index.html;
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Proxy para API Backend
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Health check
location /health {
    proxy_pass http://127.0.0.1:8000/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Docs
location /docs {
    proxy_pass http://127.0.0.1:8000/docs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3️⃣ CONFIGURACIÓN APACHE (Si es necesario):
En "Additional Apache directives":

```apache
# Fallback para SPA React
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Headers para CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### 4️⃣ CONFIGURACIÓN DE SSL:
- Asegurar que SSL está activado
- "Force HTTPS connections" debe estar ON

---

## 🔧 ALTERNATIVA: .htaccess en el directorio web

Si no funciona lo anterior, crear este archivo:
```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/.htaccess
```