# 🔍 VERIFICACIÓN Y CORRECCIÓN POST-DESPLIEGUE

## 📋 Estado Actual:
- ✅ **CRM copiado** → Archivos principales transferidos
- ⚠️ **Falta .htaccess** → No se encontró el archivo
- ✅ **Permisos configurados** → Para archivos HTML y carpetas

---

## 🔧 COMANDOS DE VERIFICACIÓN Y CORRECCIÓN:

### **1. Verificar qué se copió:**
```bash
# Listar contenido principal
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/

# Verificar archivos principales
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/index.html
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/_next/
```

### **2. Copiar .htaccess manualmente:**
```bash
# Verificar si existe .htaccess en crm-build
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/.htaccess

# Si existe, copiarlo:
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/.htaccess /var/www/vhosts/arifamilyassets.com/httpdocs/

# Configurar permisos del .htaccess
chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
```

### **3. Si no existe .htaccess, crearlo:**
```bash
# Crear .htaccess básico para React SPA
cat > /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle Angular/React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
EOF

chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
```

---

## 🌐 PROBAR INMEDIATAMENTE:

**Después de corregir .htaccess:**
- **https://crm.arifamilyassets.com/** → Login del CRM
- **https://crm.arifamilyassets.com/dashboard/** → Dashboard
- **https://crm.arifamilyassets.com/companies/** → Empresas

---

## 📊 VERIFICACIÓN COMPLETA:

```bash
# Comando completo de verificación:
echo "=== VERIFICACIÓN CRM DESPLEGADO ===" && \
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/ && \
echo "" && \
echo "=== ARCHIVOS PRINCIPALES ===" && \
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/index.html && \
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess && \
echo "" && \
echo "=== ASSETS _next ===" && \
ls /var/www/vhosts/arifamilyassets.com/httpdocs/_next/ && \
echo "" && \
echo "✅ Verificación completa. Probar: https://crm.arifamilyassets.com/"
```

---

## 🎯 COMANDO RÁPIDO PARA ARREGLAR:

**Ejecuta esto para completar el despliegue:**

```bash
# Copiar .htaccess si existe, o crear uno nuevo
if [ -f /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/.htaccess ]; then
    cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/.htaccess /var/www/vhosts/arifamilyassets.com/httpdocs/
    echo "✅ .htaccess copiado"
else
    cat > /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF
    echo "✅ .htaccess creado"
fi

chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
echo "🌐 Probar: https://crm.arifamilyassets.com/"
```

**¡El CRM debería estar funcionando ahora! ¿Qué ves al probar la URL?**