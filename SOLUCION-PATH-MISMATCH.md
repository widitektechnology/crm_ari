# 🔧 PROBLEMA IDENTIFICADO: Path Mismatch en Nginx

## ❌ **El Problema**

**Nginx está eliminando el prefijo `/api/` cuando hace el proxy:**

```nginx
# CONFIGURACIÓN ACTUAL (INCORRECTA)
location /api/ {
    proxy_pass http://127.0.0.1:8000/;  # ← Elimina /api/ del path
}
```

**Resultado:**
- 🌐 **Frontend solicita**: `https://crm.arifamilyassets.com/api/companies`
- 🔀 **Nginx envía a backend**: `http://127.0.0.1:8000/companies` (sin /api/)
- 🐍 **Backend espera**: `http://127.0.0.1:8000/api/companies`
- ❌ **Resultado**: 404 → HTML de error

## ✅ **La Solución**

Cambiar la configuración de nginx para **conservar el prefijo `/api/`**:

### Opción 1: Conservar /api/ en el proxy (Recomendado)

```nginx
# CONFIGURACIÓN CORREGIDA
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;  # ← Conserva /api/
    
    # Headers seguros (mantener los existentes)
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port 443;
    
    # Headers anti-Mixed Content (mantener)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' https: 'unsafe-inline' 'unsafe-eval'" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    proxy_buffering off;
}
```

### Opción 2: Sin prefijo en backend (Alternativa)

```nginx
# CONFIGURACIÓN ALTERNATIVA
location /api/ {
    proxy_pass http://127.0.0.1:8000/;  # Sin /api/
    
    # Reescribir URL para eliminar /api/
    rewrite ^/api/(.*)$ /$1 break;
    
    # Headers seguros (mantener los existentes)
    # ... resto de headers igual
}
```

## 🚀 **Aplicar el Cambio**

### En Plesk:

1. **Plesk Panel** → Dominios → arifamilyassets.com
2. **Apache & Nginx Settings**
3. **Modificar la línea:**
   ```nginx
   # CAMBIAR ESTO:
   proxy_pass http://127.0.0.1:8000/;
   
   # POR ESTO:
   proxy_pass http://127.0.0.1:8000/api/;
   ```
4. **Apply** → **Reload nginx**

### Script de Corrección:

```bash
# En el servidor
sed -i 's|proxy_pass http://127.0.0.1:8000/;|proxy_pass http://127.0.0.1:8000/api/;|g' /var/www/vhosts/arifamilyassets.com/conf/vhost_nginx.conf
systemctl reload nginx
```

## 📊 **Verificación**

Después del cambio, estos comandos deberían funcionar:

```bash
# Probar endpoints directos
curl http://localhost:8000/api/companies
curl http://localhost:8000/api/employees

# Probar a través de nginx
curl https://crm.arifamilyassets.com/api/companies
curl https://crm.arifamilyassets.com/api/employees
```

## 🎯 **Resultado Esperado**

**ANTES (error HTML):**
```
Error: SyntaxError: Unexpected token '<', "<!doctype"... is not valid JSON
```

**DESPUÉS (JSON correcto):**
```json
{
  "companies": [...],
  "total": 0,
  "status": "success"
}
```

**¡El problema es un simple path mismatch en nginx, no en tu código!** 🎯