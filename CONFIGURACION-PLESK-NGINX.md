# 🔧 CONFIGURACIÓN NGINX PARA PLESK - CRM ESTÁTICO

## 📋 CONFIGURACIÓN ACTUAL vs NUEVA:

### ❌ ACTUAL (proxy a contenedor):
```nginx
location / {
	proxy_pass http://127.0.0.1:3001;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
}
```

### ✅ NUEVA (archivos estáticos):
```nginx
location / {
	root /var/www/vhosts/arifamilyassets.com/httpdocs;
	try_files $uri $uri/ /index.html;
	index index.html;
	
	# Headers para SPA (Single Page Application)
	add_header Cache-Control "no-cache, no-store, must-revalidate";
	add_header Pragma "no-cache";
	add_header Expires "0";
}
```

---

## 🎯 CONFIGURACIÓN COMPLETA PARA PLESK:

```nginx
# CRM ARI - Archivos estáticos + Backend API
location / {
	root /var/www/vhosts/arifamilyassets.com/httpdocs;
	try_files $uri $uri/ /index.html;
	index index.html;
	
	# Headers para React SPA
	add_header Cache-Control "no-cache, no-store, must-revalidate";
	add_header Pragma "no-cache";
	add_header Expires "0";
}

location /api/ {
	proxy_pass http://127.0.0.1:8000/api/;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
	add_header Access-Control-Allow-Origin "*" always;
}

location /health {
	proxy_pass http://127.0.0.1:8000/health;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
}

location /admin {
	proxy_pass http://127.0.0.1:8000/admin;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
}

location /docs {
	proxy_pass http://127.0.0.1:8000/docs;
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

---

## 🔧 CÓMO APLICAR EN PLESK:

### **Método 1: Panel Plesk (Recomendado)**
1. **Panel Plesk** → **Dominios** → **crm.arifamilyassets.com**
2. **Apache & nginx Settings**
3. **Additional nginx directives**
4. **Pegar la configuración completa de arriba**
5. **OK** → **Apply**

### **Método 2: SSH (Alternativo)**
```bash
# Editar configuración directamente
nano /var/www/vhosts/system/crm.arifamilyassets.com/conf/vhost_nginx.conf
# O
nano /etc/nginx/plesk.conf.d/vhosts/crm.arifamilyassets.com.conf
```

---

## 📋 EXPLICACIÓN DE CAMBIOS:

### **Lo que cambia:**
- ❌ **Antes**: `proxy_pass http://127.0.0.1:3001` (enviaba a contenedor Docker)
- ✅ **Ahora**: `root /var/www/vhosts/arifamilyassets.com/httpdocs` (sirve archivos)

### **Lo que se mantiene:**
- ✅ **API Backend**: `/api/` sigue funcionando (puerto 8000)
- ✅ **Admin/Docs**: `/admin`, `/docs` siguen funcionando
- ✅ **Health check**: `/health` sigue funcionando

### **Nuevas características:**
- ✅ **SPA Support**: `try_files $uri $uri/ /index.html` maneja rutas React
- ✅ **No caché**: Headers para desarrollo sin caché
- ✅ **Archivos estáticos**: Sirve desde `/httpdocs/`

---

## 🚀 DESPUÉS DE APLICAR:

1. **Crear página de prueba**:
```bash
cat > /var/www/vhosts/arifamilyassets.com/httpdocs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>🎉 CRM ARI - FUNCIONANDO</title>
    <style>body{font-family:Arial;text-align:center;padding:50px;background:#f0f8ff}</style>
</head>
<body>
    <h1 style="color:#2563eb">🎉 CRM ARI FUNCIONANDO</h1>
    <p>¡Configuración Plesk exitosa!</p>
    <p>Nginx ahora sirve archivos estáticos.</p>
    <div style="margin:20px 0">
        <a href="/dashboard/" style="background:#2563eb;color:white;padding:10px;text-decoration:none;margin:5px">📊 Dashboard</a>
        <a href="/companies/" style="background:#059669;color:white;padding:10px;text-decoration:none;margin:5px">🏢 Empresas</a>
        <a href="/api/health" style="background:#dc2626;color:white;padding:10px;text-decoration:none;margin:5px">💚 API Health</a>
    </div>
    <p style="color:#666;font-size:12px">Backend API funcionando en puerto 8000 ✅</p>
</body>
</html>
EOF
```

2. **Probar**: https://crm.arifamilyassets.com/

---

## 📞 ¿LISTO PARA APLICAR?

**Copia la configuración completa de arriba y pégala en Plesk → Apache & nginx Settings → Additional nginx directives**

**¿Necesitas que te guíe paso a paso por el panel de Plesk?**