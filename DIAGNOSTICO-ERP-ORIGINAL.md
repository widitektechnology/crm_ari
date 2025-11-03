# 🔍 DIAGNÓSTICO: ¿POR QUÉ SIGUE MOSTRANDO ERP?

## ❌ PROBLEMA: Sigue mostrando ERP original
- Texto: "🚀 Sistema ERP"
- Backend: ✅ Conectado
- MySQL: ✅ Funcionando

---

## 🔧 VERIFICACIONES URGENTES EN SSH:

### **1. Verificar qué archivo está sirviendo realmente:**
```bash
echo "=== ¿QUÉ HAY EN HTTPDOCS REALMENTE? ==="
pwd
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/
echo ""
echo "=== CONTENIDO ACTUAL DE INDEX.HTML ==="
head -n 10 /var/www/vhosts/arifamilyassets.com/httpdocs/index.html
echo ""
echo "=== BUSCAR TEXTO 'Sistema ERP' ==="
grep -r "Sistema ERP" /var/www/vhosts/arifamilyassets.com/httpdocs/ || echo "No encontrado en httpdocs"
```

### **2. Verificar si hay múltiples ubicaciones:**
```bash
echo "=== BUSCAR DONDE ESTÁ EL ERP ORIGINAL ==="
find /var/www/vhosts/arifamilyassets.com/ -name "*.html" -exec grep -l "Sistema ERP" {} \; 2>/dev/null
echo ""
echo "=== VERIFICAR BACKUPS ==="
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup-*
```

### **3. Verificar configuración de Plesk:**
```bash
echo "=== VERIFICAR DOCUMENT ROOT ==="
ls -la /var/www/vhosts/arifamilyassets.com/
echo ""
echo "=== VERIFICAR SYMLINKS ==="
ls -la /var/www/vhosts/arifamilyassets.com/ | grep httpdocs
```

---

## 🚀 SOLUCIONES POSIBLES:

### **A. Si el ERP está en httpdocs (rollback accidental):**
```bash
# Verificar timestamp del backup
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup-20251103_174546/

# Re-limpiar y re-copiar CRM
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs/*
cp -r /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/* /var/www/vhosts/arifamilyassets.com/httpdocs/
```

### **B. Si Document Root apunta a lugar incorrecto:**
- Ir a **Panel Plesk** → **Dominios** → **crm.arifamilyassets.com**
- **Hosting Settings** → Verificar Document Root
- Debe ser: `/httpdocs/` (no otra carpeta)

### **C. Limpiar caché del navegador:**
```bash
# Forzar refresh sin caché:
# Ctrl + F5 (Windows)
# Cmd + Shift + R (Mac)
# O abrir en ventana incógnita/privada
```

---

## 🎯 COMANDO DE VERIFICACIÓN COMPLETA:

```bash
echo "🔍 DIAGNÓSTICO COMPLETO - ¿DÓNDE ESTÁ EL ERP?" && \
echo "=== CONTENIDO HTTPDOCS ===" && \
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/ && \
echo "" && \
echo "=== PRIMERAS LÍNEAS INDEX.HTML ===" && \
head -n 5 /var/www/vhosts/arifamilyassets.com/httpdocs/index.html && \
echo "" && \
echo "=== BUSCAR 'Sistema ERP' EN HTTPDOCS ===" && \
grep -r "Sistema ERP" /var/www/vhosts/arifamilyassets.com/httpdocs/ 2>/dev/null || echo "❌ No encontrado en httpdocs" && \
echo "" && \
echo "=== BUSCAR 'Sistema ERP' EN TODO EL DOMINIO ===" && \
find /var/www/vhosts/arifamilyassets.com/ -name "*.html" -exec grep -l "Sistema ERP" {} \; 2>/dev/null && \
echo "" && \
echo "=== VERIFICAR SYMLINKS ===" && \
ls -la /var/www/vhosts/arifamilyassets.com/ | grep httpdocs && \
echo "" && \
echo "=== TIMESTAMP ACTUAL ===" && \
date
```

---

## 🚨 SOLUCIÓN RÁPIDA - FORZAR REEMPLAZO:

```bash
# Limpiar completamente httpdocs y re-copiar
echo "🧹 LIMPIANDO HTTPDOCS COMPLETAMENTE..." && \
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs/* && \
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs/.* 2>/dev/null && \
echo "📋 COPIANDO CRM COMPLETO..." && \
cp -r /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/* /var/www/vhosts/arifamilyassets.com/httpdocs/ && \
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/crm-build/.htaccess /var/www/vhosts/arifamilyassets.com/httpdocs/ 2>/dev/null && \
echo "✅ FORZANDO NUEVO INDEX.HTML..." && \
cat > /var/www/vhosts/arifamilyassets.com/httpdocs/index.html << 'EOF'
<!DOCTYPE html>
<html><head><title>CRM ARI</title></head>
<body><h1>🎉 CRM ARI FUNCIONANDO</h1><p>Si ves esto, el reemplazo funcionó!</p></body></html>
EOF
chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/index.html && \
echo "🌐 Probar: https://crm.arifamilyassets.com/ (usar Ctrl+F5)"
```

**¿Puedes ejecutar primero el comando de diagnóstico para ver dónde está realmente el ERP?**