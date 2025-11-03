# 🚨 ERROR DE RUTA EN PLESK - PATH DUPLICADO

## 📊 **PROBLEMA IDENTIFICADO:**
```
Error: 'www_root' = '/var/www/vhosts/arifamilyassets.com/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com'
                    ↑ DUPLICADO ↑
```

## 🔍 **CAUSA:**
- ❌ **Ruta duplicada**: Plesk está añadiendo el path base dos veces
- ✅ **Ruta correcta**: `/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com`

---

## 🚀 **SOLUCIONES EN PLESK:**

### **OPCIÓN A: Usar ruta relativa**
```
Directorio raíz: crm.arifamilyassets.com
```

### **OPCIÓN B: Usar solo el nombre del subdominio**
```
Directorio raíz: crm.arifamilyassets.com
```

### **OPCIÓN C: Usar ruta desde httpdocs del dominio principal**
```
Directorio raíz: ../crm.arifamilyassets.com
```

### **OPCIÓN D: Crear un subdominio nuevo**
```
- Crear subdominio "crm"
- Directorio: crm.arifamilyassets.com
```

---

## 🎯 **CONFIGURACIÓN CORRECTA EN PLESK:**

### **1️⃣ En el campo "Directorio raíz del documento":**
```
crm.arifamilyassets.com
```
*(Sin la ruta completa, solo el nombre del directorio)*

### **2️⃣ O usar ruta corta:**
```
../crm.arifamilyassets.com
```

### **3️⃣ Archivo índice:**
```
index.html
```

---

## 🔧 **ALTERNATIVA - MOVER LOS ARCHIVOS:**

Si Plesk sigue dando problemas:

```bash
# Crear directorio en httpdocs del dominio principal
mkdir -p /var/www/vhosts/arifamilyassets.com/httpdocs/crm

# Copiar archivos
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/*.html /var/www/vhosts/arifamilyassets.com/httpdocs/crm/

# Acceder vía: https://arifamilyassets.com/crm/
```

---

## ⚡ **PRUEBA ESTAS RUTAS EN PLESK:**

1. **`crm.arifamilyassets.com`** (más probable que funcione)
2. **`../crm.arifamilyassets.com`**
3. **Crear nuevo subdominio** desde cero

**¿Cuál de estas opciones pruebas en Plesk?** 🚀