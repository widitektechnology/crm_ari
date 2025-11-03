# 🎯 ESTRUCTURA CRM ENCONTRADA

## 📁 **DIRECTORIOS CRM ENCONTRADOS:**
```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
├── crm-completo/                    ← CRM tradicional que creamos
├── plesk-deploy/crm-build/          ← Build scripts
└── (otros archivos...)
```

## 🔍 **NECESITO VERIFICAR QUÉ SIRVE EL SUBDOMINIO:**

### **1️⃣ ¿Hay httpdocs en crm.arifamilyassets.com?**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

### **2️⃣ ¿O está en subdomains?**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/subdomains/
```

### **3️⃣ Ver configuración de Nginx para crm:**
```bash
find /var/www/vhosts/arifamilyassets.com -name "*.conf" -exec grep -l "crm" {} \;
```

---

## 🎯 **UBICACIONES POSIBLES PARA COPIAR BUILD:**

### **Opción A: Si hay httpdocs:**
```bash
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/
```

### **Opción B: Si es subdominio:**
```bash
/var/www/vhosts/arifamilyassets.com/subdomains/crm/httpdocs/
```

### **Opción C: Si usa el directorio principal:**
```bash
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

---

## ⚡ **EJECUTA ESTOS COMANDOS:**

### **1️⃣ Ver contenido del directorio CRM:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

### **2️⃣ Buscar httpdocs:**
```bash
find /var/www/vhosts/arifamilyassets.com -name "httpdocs" | grep crm
```

**¿Qué te devuelven estos comandos?** Así sabemos exactamente dónde copiar el build 🚀