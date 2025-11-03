# 🚨 PROBLEMA DE REDIRECCIÓN - NGINX MAL CONFIGURADO

## 📊 **PROBLEMA IDENTIFICADO:**
```
https://crm.arifamilyassets.com/ → https://crm.arifamilyassets.com/frontend/build/
```

## 🔍 **CAUSA:**
- ❌ **Nginx/Apache** está mal configurado
- ❌ **Redirección** apunta a `/frontend/build/`
- ❌ **Debería** apuntar a `/httpdocs/`

---

## 🚀 **SOLUCIONES INMEDIATAS:**

### **OPCIÓN A: Verificar configuración de Nginx**
```bash
# Buscar archivos de configuración
find /var/www/vhosts/arifamilyassets.com -name "*.conf" | head -5

# Ver configuración actual
cat /var/www/vhosts/arifamilyassets.com/conf/nginx.conf
```

### **OPCIÓN B: Verificar .htaccess**
```bash
# Ver si hay .htaccess que redirija
cat /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/.htaccess 2>/dev/null || echo "No .htaccess"
```

### **OPCIÓN C: Crear index.html directamente en la raíz**
```bash
# Copiar también a la carpeta raíz
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/index.html /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html
```

---

## 🔧 **SOLUCIÓN RÁPIDA - CREAR REDIRECCIÓN CORRECTA:**

### **1️⃣ Crear index.html en la raíz del subdominio:**
```bash
cat > /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=httpdocs/">
    <script>window.location.href = 'httpdocs/';</script>
</head>
<body>
    <p>Redirigiendo al CRM...</p>
</body>
</html>
EOF
```

### **2️⃣ O copiar directamente el CRM a la raíz:**
```bash
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

---

## ⚡ **COMANDO DE DIAGNÓSTICO:**
```bash
echo "🔍 Configuración actual:" && \
find /var/www/vhosts/arifamilyassets.com -name "*.conf" | head -3 && \
echo "📁 Estructura de archivos:" && \
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ | head -10
```

**¿Ejecutas el diagnóstico o probamos la solución rápida?** 🚀