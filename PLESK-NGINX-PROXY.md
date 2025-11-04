# 🚀 CONFIGURACIÓN NGINX PROXY PARA PLESK

## 📋 **OPCIÓN 1 - VÍA PANEL PLESK (RECOMENDADO):**

### **1️⃣ ACCEDER A PLESK:**
- Ve a: **Dominios** → **crm.arifamilyassets.com**
- Busca: **"Apache & nginx Settings"** o **"Configuración de servidor web"**

### **2️⃣ CONFIGURAR DIRECTIVAS NGINX:**
En la sección **"Additional nginx directives"** o **"Directivas nginx adicionales"**, añade:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header Access-Control-Allow-Credentials false always;
    
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header Access-Control-Max-Age 1728000 always;
        add_header Content-Type 'text/plain charset=UTF-8' always;
        add_header Content-Length 0 always;
        return 204;
    }
}
```

### **3️⃣ APLICAR CAMBIOS:**
- Haz clic en **"OK"** o **"Aplicar"**
- Plesk recargará nginx automáticamente

---

## 📋 **OPCIÓN 2 - VÍA SSH (SI NO FUNCIONA PLESK):**

### **1️⃣ ENCONTRAR ARCHIVO DE CONFIGURACIÓN PLESK:**
```bash
# Buscar archivo de configuración del dominio
find /var/www/vhosts/system -name "*crm.arifamilyassets.com*" -type f

# O buscar en configuraciones nginx de Plesk
find /etc/nginx -name "*crm.arifamilyassets.com*" -type f
```

### **2️⃣ CREAR CONFIGURACIÓN PERSONALIZADA:**
```bash
# Crear archivo de configuración personalizada
cat > /var/www/vhosts/system/crm.arifamilyassets.com/conf/vhost_nginx.conf << 'NGINXCONF'
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header Access-Control-Allow-Headers 'Content-Type, Authorization, X-Requested-With' always;
    
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization, X-Requested-With' always;
        add_header Access-Control-Max-Age 1728000 always;
        add_header Content-Type 'text/plain charset=UTF-8' always;
        add_header Content-Length 0 always;
        return 204;
    }
}
NGINXCONF

# Recargar configuración de Plesk
/usr/local/psa/admin/bin/httpdmng --reconfigure-domain crm.arifamilyassets.com

echo "✅ Configuración nginx aplicada"
```

---

## 📋 **OPCIÓN 3 - CONFIGURACIÓN GLOBAL NGINX:**

```bash
# Crear configuración en sites-available
cat > /etc/nginx/sites-available/crm-api-proxy << 'GLOBALCONF'
# Proxy para API del CRM
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # CORS completo
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header Access-Control-Allow-Credentials false always;
    
    # Preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header Access-Control-Max-Age 1728000 always;
        add_header Content-Type 'text/plain charset=UTF-8' always;
        add_header Content-Length 0 always;
        return 204;
    }
}
GLOBALCONF

# Incluir en configuración principal si es necesario
echo "include /etc/nginx/sites-available/crm-api-proxy;" >> /etc/nginx/nginx.conf

# Verificar y recargar
nginx -t && nginx -s reload

echo "✅ Configuración global aplicada"
```

---

## 🔄 **ACTUALIZAR FRONTEND PARA USAR /api/:**

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com

# Restaurar backup original
cp index.html.backup index.html

# Cambiar URLs para usar /api/
sed -i 's|http://localhost:8000|/api|g' index.html
sed -i 's|http://57.129.144.154:8000|/api|g' index.html

echo "✅ Frontend configurado para usar /api/"
```

---

## 🎯 **COMANDOS PARA EJECUTAR:**

**1. Configurar frontend:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && cp index.html.backup index.html && sed -i 's|http://.*:8000|/api|g' index.html && echo "✅ Frontend listo para /api/"
```

**2. Configurar nginx via Plesk (recomendado):**
- Ve al panel Plesk → Dominios → crm.arifamilyassets.com → Apache & nginx Settings
- Añade las directivas nginx de la OPCIÓN 1

**¿Prefieres configurarlo via panel Plesk o SSH?** 🎛️