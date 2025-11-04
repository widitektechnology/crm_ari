# 🔧 ELIMINAR REDIRECCIÓN DEFINITIVAMENTE

## 🚨 **PROBLEMA:** 
- La redirección a `/frontend/build/` sigue activa
- Necesitamos encontrar y eliminar la configuración que causa esto

## ⚡ **SOLUCIÓN PASO A PASO:**

### **1. BUSCAR EL ORIGEN DE LA REDIRECCIÓN:**
```bash
# Buscar archivos de configuración
find . -name ".htaccess" -o -name "*.conf" -o -name "web.config" | head -5
```

### **2. VER CONTENIDO DE ARCHIVOS DE CONFIGURACIÓN:**
```bash
# Ver .htaccess si existe
cat .htaccess 2>/dev/null || echo "No hay .htaccess"

# Ver otros archivos de configuración
ls -la | grep -E "(htaccess|conf|config)"
```

### **3. CREAR .htaccess LIMPIO PARA ANULAR REDIRECCIONES:**
```bash
cat > .htaccess << 'HTEND'
# CRM ARI - Configuración limpia
DirectoryIndex index.html
RewriteEngine Off

# Evitar redirecciones automáticas
<IfModule mod_rewrite.c>
    RewriteEngine Off
</IfModule>

# Servir archivos estáticos
<Files "*.html">
    Header always set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
HTEND
```

### **4. VERIFICAR EN PLESK:**
```bash
# Comando para verificar la configuración de dominio
echo "🔍 Verificar en Plesk:"
echo "1. Ir a Dominios > crm.arifamilyassets.com"
echo "2. Buscar 'Redirecciones' o 'Redirects'"
echo "3. Eliminar cualquier redirección a /frontend/build/"
```

## 🚀 **COMANDO COMPLETO DE LIMPIEZA:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && echo "🧹 Limpiando redirecciones..." && rm -f .htaccess web.config 2>/dev/null && cat > .htaccess << 'HTEND'
DirectoryIndex index.html
RewriteEngine Off
HTEND
echo "✅ Configuración limpia creada" && ls -la .htaccess
```

## 🎯 **ALTERNATIVA DRÁSTICA:**
```bash
# Si nada funciona, eliminar TODO y empezar limpio
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
rm -rf * .[^.]*
echo '<!DOCTYPE html><html><head><title>TEST</title></head><body><h1>FUNCIONA</h1></body></html>' > index.html
```

---

## ⚡ **EJECUTA PRIMERO ESTO:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
find . -name ".htaccess" -o -name "*.conf" | head -3
cat .htaccess 2>/dev/null || echo "No .htaccess"
```

**¿Ejecutas el diagnóstico para ver qué está causando la redirección?** 🔍