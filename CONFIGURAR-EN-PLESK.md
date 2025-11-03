# 🎯 CONFIGURAR EN PLESK - LA MEJOR OPCIÓN

## 🚀 **PASOS EN PLESK PARA crm.arifamilyassets.com:**

### **1️⃣ ACCEDER AL SUBDOMINIO:**
```
Panel de Plesk → Dominios → crm.arifamilyassets.com
```

### **2️⃣ CAMBIAR CONFIGURACIÓN:**
```
Hosting y DNS → Configuración del Hosting
```

### **3️⃣ CONFIGURAR DIRECTORIO RAÍZ:**
```
Directorio raíz del documento: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
Página de inicio: index.html
```

### **4️⃣ DESACTIVAR PROXY:**
```
- Desmarcar "Proxy inverso"
- Asegurarse que está en modo "Archivos estáticos"
```

### **5️⃣ APLICAR CAMBIOS:**
```
Guardar → Aplicar configuración
```

---

## 🔍 **CONFIGURACIONES IMPORTANTES:**

### **Directorio raíz:**
```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
```

### **Página de inicio:**
```
index.html
```

### **Tipo de hosting:**
```
☑️ Archivos estáticos/PHP
❌ Proxy inverso
```

---

## 🎯 **DESPUÉS DE CONFIGURAR EN PLESK:**

1. **Esperar** 1-2 minutos para que se aplique
2. **Refrescar** `https://crm.arifamilyassets.com/`
3. **Debería aparecer** el login del CRM tradicional

---

## 🚀 **MIENTRAS CONFIGURAS, VERIFICAR:**

### **¿Están los archivos donde deben?**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html
```

### **¿Permisos correctos?**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/*.html
```

---

**👨‍💻 ¿Tienes acceso al panel de Plesk?**

**¡Configúralo desde Plesk y me dices cuando esté listo!** 🔥

Esa es definitivamente la manera más limpia y profesional. 🎯