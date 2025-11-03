# 🚨 DIAGNÓSTICO PROFUNDO - REDIRECCIÓN INFINITA PERSISTE

## 🔍 **NECESITAMOS IDENTIFICAR LA CAUSA EXACTA:**

### **1️⃣ VERIFICAR CONFIGURACIÓN DE PLESK ACTIVA:**
```bash
# Ver configuración del servidor web para este subdominio
find /var/www/vhosts/arifamilyassets.com -name "vhost.conf" -o -name "*.conf" | grep -v nginx-config.conf

# Ver configuración específica del subdominio
ls -la /var/www/vhosts/system/arifamilyassets.com/conf/
```

### **2️⃣ VERIFICAR TODAS LAS REDIRECCIONES ACTIVAS:**
```bash
# Buscar TODOS los archivos con redirecciones
grep -r "frontend/build" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ 2>/dev/null

# Buscar redirects en configuraciones
grep -r "redirect\|rewrite.*frontend" /var/www/vhosts/arifamilyassets.com/ 2>/dev/null | head -10
```

### **3️⃣ VERIFICAR SI HAY MÚLTIPLES INDEX.HTML:**
```bash
# Buscar todos los index.html
find /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com -name "index.html" -exec ls -la {} \;
```

---

## 🚀 **SOLUCIÓN DRÁSTICA - RECREAR DESDE CERO:**

### **OPCIÓN A: CREAR EN HTTPDOCS DEL DOMINIO PRINCIPAL**
```bash
# Crear directorio en el dominio principal
mkdir -p /var/www/vhosts/arifamilyassets.com/httpdocs/crm

# Copiar CRM tradicional
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/crm-completo/* /var/www/vhosts/arifamilyassets.com/httpdocs/crm/

# Dar permisos
chown -R ari_admin:psacln /var/www/vhosts/arifamilyassets.com/httpdocs/crm/

# Acceder vía: https://arifamilyassets.com/crm/
```

### **OPCIÓN B: ELIMINAR Y RECREAR SUBDOMINIO**
```bash
# Eliminar todo el directorio problemático
rm -rf /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com

# Recrear limpio
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com

# Copiar solo los archivos del CRM tradicional
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com.backup/crm-completo/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ 2>/dev/null || echo "Usar archivos de backup"
```

---

## ⚡ **COMANDO DE DIAGNÓSTICO COMPLETO:**
```bash
echo "🔍 DIAGNÓSTICO COMPLETO:" && \
echo "1. Archivos index encontrados:" && \
find /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com -name "index.html" -exec ls -la {} \; && \
echo "" && \
echo "2. Referencias a frontend/build:" && \
grep -r "frontend/build" /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ 2>/dev/null || echo "No encontradas" && \
echo "" && \
echo "3. Configuraciones del servidor:" && \
find /var/www/vhosts/system/arifamilyassets.com -name "*.conf" 2>/dev/null | head -5
```

---

## 🎯 **MI RECOMENDACIÓN:**

**USAR EL DOMINIO PRINCIPAL** con `/crm/`:
- ✅ Sin problemas de configuración de subdominio
- ✅ Más simple de gestionar
- ✅ Funciona inmediatamente

**¿Ejecutas el diagnóstico o probamos la solución del dominio principal?** 🚀