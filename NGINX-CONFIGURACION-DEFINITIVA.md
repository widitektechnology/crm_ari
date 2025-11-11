# 🔧 CONFIGURACIÓN NGINX CORREGIDA - Mixed Content + Path Fix

## 🎯 **Problema Confirmado**

Los logs confirman **2 problemas que hemos solucionado paso a paso:**

1. ✅ **Mixed Content eliminado** - Headers de seguridad funcionando
2. ❌ **Path mismatch** - nginx elimina `/api/` del path

**Evidencia de los logs:**
```bash
✅ Mixed Content ELIMINADO - No más errores HTTP/HTTPS
❌ GET https://crm.arifamilyassets.com/api/companies 404 (Not Found)
❌ GET https://crm.arifamilyassets.com/api/employees 404 (Not Found)
```

## 🔧 **Configuración Nginx DEFINITIVA**

**Aplicar esta configuración CORREGIDA en Plesk:**

```nginx
# ====================================================================
# CONFIGURACIÓN DEFINITIVA: Mixed Content + Path Fix
# ====================================================================

# API Proxy con máxima seguridad Y path correcto
location /api/ {
    # Headers de proxy seguros
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port 443;
    
    # CRÍTICO: Headers anti-Mixed Content
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' https: 'unsafe-inline' 'unsafe-eval'" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 🔧 CRÍTICO: Conservar /api/ en el path
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_buffering off;
}

# Health check con path correcto
location /health {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
    
    # 🔧 CRÍTICO: Usar /api/health
    proxy_pass http://127.0.0.1:8000/api/health;
}

# SPA routing (sin cambios)
location / {
    try_files $uri $uri/ /index.html;
    
    # Headers de seguridad para SPA
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' https: 'unsafe-inline' 'unsafe-eval'" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Assets estáticos (sin cambios)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
}
```

## 🔄 **Cambios Exactos Necesarios**

**En tu configuración actual de Plesk, cambiar:**

```nginx
# ❌ ANTES (causa 404):
proxy_pass http://127.0.0.1:8000/;
proxy_pass http://127.0.0.1:8000/health;

# ✅ DESPUÉS (funciona):
proxy_pass http://127.0.0.1:8000/api/;
proxy_pass http://127.0.0.1:8000/api/health;
```

## 📋 **Pasos en Plesk**

1. **Plesk Panel** → Dominios → arifamilyassets.com
2. **Apache & Nginx Settings** → **Additional nginx directives**
3. **Encontrar estas 2 líneas y cambiarlas:**
   ```nginx
   proxy_pass http://127.0.0.1:8000/;      → proxy_pass http://127.0.0.1:8000/api/;
   proxy_pass http://127.0.0.1:8000/health; → proxy_pass http://127.0.0.1:8000/api/health;
   ```
4. **Apply** → **Test** → **Reload nginx**

## 🎯 **Resultado Esperado**

**DESPUÉS del cambio:**
```bash
✅ GET https://crm.arifamilyassets.com/api/companies 200 OK
✅ GET https://crm.arifamilyassets.com/api/employees 200 OK
✅ GET https://crm.arifamilyassets.com/api/health 200 OK
✅ CRM cargando datos correctamente
```

## 📊 **Por Qué Funciona**

| Request Flow | Antes (404) | Después (200) |
|--------------|-------------|---------------|
| 1. Frontend | `/api/companies` | `/api/companies` |
| 2. Nginx recibe | `/api/companies` | `/api/companies` |
| 3. Nginx envía | `/companies` ❌ | `/api/companies` ✅ |
| 4. Backend | 404 (no existe) | 200 (existe) |

**Solo necesitas agregar `/api/` a las 2 líneas de `proxy_pass`.**

¡Estamos súper cerca! Solo este cambio y el CRM debería funcionar al 100%. 🚀