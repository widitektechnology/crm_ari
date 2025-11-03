# 🔍 DIAGNÓSTICO 404 - SOLUCIÓN INMEDIATA

## ❌ Problema: Todas las URLs dan 404
- https://crm.arifamilyassets.com/ → 404
- https://crm.arifamilyassets.com/dashboard/ → 404  
- Etc.

---

## 🔧 COMANDOS DE DIAGNÓSTICO (EJECUTAR EN SSH):

### **1. Verificar que los archivos existen:**
```bash
echo "=== VERIFICANDO ARCHIVOS ===" 
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/
echo ""
echo "=== INDEX.HTML ===" 
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/index.html
echo ""
echo "=== .HTACCESS ===" 
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
cat /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
```

### **2. Verificar contenido de index.html:**
```bash
echo "=== PRIMERAS LÍNEAS DE INDEX.HTML ==="
head -n 20 /var/www/vhosts/arifamilyassets.com/httpdocs/index.html
```

### **3. Verificar permisos:**
```bash
echo "=== PERMISOS ==="
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/index.html
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
```

---

## 🎯 POSIBLES CAUSAS Y SOLUCIONES:

### **A. Document Root incorrecto en Plesk**
**Verificar en Plesk:**
1. Panel Plesk → Dominios → crm.arifamilyassets.com
2. Hosting Settings
3. Document Root debe ser: `/httpdocs/`

### **B. Archivo index.html corrupto o vacío**
**Solución:**
```bash
# Verificar tamaño
wc -l /var/www/vhosts/arifamilyassets.com/httpdocs/index.html

# Si está vacío, re-copiar:
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/index.html /var/www/vhosts/arifamilyassets.com/httpdocs/
```

### **C. Apache no permite .htaccess**
**Solución temporal - probar archivo directo:**
```bash
# Probar acceso directo al archivo
curl -I http://crm.arifamilyassets.com/index.html
```

---

## 🚀 SOLUCIÓN RÁPIDA - EJECUTAR ESTO:

```bash
echo "🔍 DIAGNÓSTICO COMPLETO..." && \
echo "=== ARCHIVOS EN HTTPDOCS ===" && \
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/ && \
echo "" && \
echo "=== TAMAÑO INDEX.HTML ===" && \
wc -l /var/www/vhosts/arifamilyassets.com/httpdocs/index.html && \
echo "" && \
echo "=== CONTENIDO .HTACCESS ===" && \
cat /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess && \
echo "" && \
echo "=== PERMISOS ===" && \
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/index.html && \
echo "" && \
echo "🌐 Probando acceso directo..." && \
curl -I http://crm.arifamilyassets.com/index.html
```

---

## 🔄 SI NADA FUNCIONA - ROLLBACK TEMPORAL:

```bash
# Volver al ERP original temporalmente
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs
mv /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup-20251103_174546 /var/www/vhosts/arifamilyassets.com/httpdocs
echo "🔄 ERP restaurado temporalmente"
```

---

## 📋 PRÓXIMOS PASOS:

1. **Ejecuta el comando de diagnóstico completo**
2. **Reporta los resultados**
3. **Basado en los resultados, aplicaremos la solución específica**

**¿Puedes ejecutar el comando de diagnóstico y mostrarme el resultado?**