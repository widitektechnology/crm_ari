# 🔒 SOLUCIÓN DEFINITIVA: Eliminar Mixed Content en Plesk

## ❌ Problema Identificado
Los logs confirman que **axios está configurado correctamente con HTTPS**, pero **nginx está causando Mixed Content** por falta de headers de seguridad.

```
✅ AXIOS CORRECTO: baseURL: 'https://crm.arifamilyassets.com/api'
❌ NAVEGADOR VE:   'http://crm.arifamilyassets.com/api/companies/'
```

## 🎯 Solución: Headers Anti-Mixed Content

### Opción 1: Script Automático (Recomendado)
```bash
# En el servidor:
chmod +x fix-mixed-content-plesk.sh
./fix-mixed-content-plesk.sh
```

### Opción 2: Configuración Manual en Plesk

#### Paso 1: Acceder a Nginx Settings
1. Plesk Panel → Dominios → arifamilyassets.com
2. Apache & Nginx Settings
3. Nginx directives (Additional nginx directives)

#### Paso 2: Agregar Configuración Anti-Mixed Content

```nginx
# ====================================================================
# ANTI-MIXED CONTENT CONFIGURATION
# ====================================================================

# API Proxy con máxima seguridad
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
    
    # Proxy al backend
    proxy_pass http://127.0.0.1:8000/;
    proxy_buffering off;
}

# Health check
location /health {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
    proxy_pass http://127.0.0.1:8000/health;
}

# SPA routing
location / {
    try_files $uri $uri/ /index.html;
    
    # Headers de seguridad para SPA
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' https: 'unsafe-inline' 'unsafe-eval'" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Assets estáticos
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
}
```

#### Paso 3: Aplicar y Verificar
1. Click "Apply" en Plesk
2. Verificar en terminal: `nginx -t`
3. Recargar nginx: `systemctl reload nginx`

## 🔑 Headers Clave que Eliminan Mixed Content

| Header | Función |
|--------|---------|
| `X-Forwarded-Proto: https` | Fuerza HTTPS en proxy |
| `Content-Security-Policy: upgrade-insecure-requests` | Convierte HTTP → HTTPS automáticamente |
| `Strict-Transport-Security` | Fuerza HTTPS siempre |

## 📊 Verificación

Después de aplicar la configuración:

1. **Ctrl+Shift+R** para limpiar cache
2. **DevTools → Console** 
3. **Debería ver SOLO:**
   ```
   ✅ 🔧 API_BASE_URL configurada: https://crm.arifamilyassets.com/api
   ✅ 🌐 AXIOS REQUEST: baseURL: 'https://...'
   ```
4. **NO debería ver:**
   ```
   ❌ Mixed Content: requested an insecure XMLHttpRequest...
   ```

## 🎯 Resultado Esperado

**ANTES (con errores):**
```
❌ Mixed Content: The page at 'https://crm.arifamilyassets.com/dashboard' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://crm.arifamilyassets.com/api/companies/'
```

**DESPUÉS (sin errores):**
```
✅ API calls working over HTTPS
✅ No Mixed Content errors
✅ CRM funcionando perfectamente
```

## 🚨 Si Aún No Funciona

Si después de aplicar la configuración sigues viendo Mixed Content:

1. **Verificar backend SSL:**
   ```bash
   curl -k https://localhost:8000/health
   ```

2. **Verificar redirecciones:**
   ```bash
   curl -I https://crm.arifamilyassets.com/api/health
   ```

3. **Backend con SSL nativo:**
   ```bash
   # Opción: Correr FastAPI con SSL directo
   uvicorn main:app --host 0.0.0.0 --port 8443 --ssl-keyfile=key.pem --ssl-certfile=cert.pem
   
   # Cambiar nginx proxy_pass a:
   proxy_pass https://127.0.0.1:8443/;
   ```

La configuración actual debería eliminar los errores de Mixed Content. **¡El problema está en nginx, no en tu código React!**