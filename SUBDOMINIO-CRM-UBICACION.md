# 🔧 CORRECCIÓN - ES SUBDOMINIO crm.arifamilyassets.com

## 🎯 **CORRECCIÓN IMPORTANTE:**
- ❌ NO es: `arifamilyassets.com`
- ✅ SÍ es: `crm.arifamilyassets.com`

---

## 📁 **UBICACIÓN CORRECTA DEL SUBDOMINIO:**

### **OPCIÓN 1: Buscar el directorio del subdominio**
```bash
find /var/www/vhosts/arifamilyassets.com -name "*crm*" -type d
```

### **OPCIÓN 2: Ver subdominios en Plesk**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/subdomains/
```

### **OPCIÓN 3: Ubicación típica de subdominios**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/subdomains/crm/httpdocs/
```

---

## 🚀 **COMANDOS PARA ENCONTRAR LA UBICACIÓN:**

### **1️⃣ Buscar directorio del subdominio:**
```bash
find /var/www/vhosts/arifamilyassets.com -name "*crm*" -type d 2>/dev/null
```

### **2️⃣ Ver estructura de subdominios:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/
```

### **3️⃣ Verificar configuración de Nginx/Apache:**
```bash
find /var/www/vhosts/arifamilyassets.com -name "*.conf" | grep -i crm
```

---

## 🔍 **UBICACIONES POSIBLES:**

1. `/var/www/vhosts/arifamilyassets.com/subdomains/crm/httpdocs/`
2. `/var/www/vhosts/crm.arifamilyassets.com/httpdocs/`
3. `/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/`

---

## ⚡ **EJECUTA PRIMERO:**
```bash
find /var/www/vhosts/arifamilyassets.com -name "*crm*" -type d
```

**¿Qué te devuelve este comando?** Así sabemos dónde copiar los archivos 🎯