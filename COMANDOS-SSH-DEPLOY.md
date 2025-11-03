# 🚀 COMANDOS PARA EJECUTAR EN SSH

## 📍 Tu ubicación actual:
```bash
# Estás en: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/plesk-deploy/
# Backup creado: httpdocs-erp-backup-20251103_174546 ✅
# Directorio httpdocs vacío: ✅
```

---

## 🔥 COMANDOS A EJECUTAR SECUENCIALMENTE:

### **1. Copiar todo el CRM:**
```bash
# Desde tu ubicación actual, copiar contenido de crm-build/
cp -r crm-build/* /var/www/vhosts/arifamilyassets.com/httpdocs/
```

### **2. Verificar que se copió:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/
```

### **3. Configurar permisos:**
```bash
cd /var/www/vhosts/arifamilyassets.com/httpdocs/
chmod 644 *.html
chmod 755 */
chmod 644 .htaccess
chown -R psaadm:psacln *
```

### **4. Verificar archivos principales:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/_next/
```

---

## 🌐 PROBAR INMEDIATAMENTE:

Después de ejecutar los comandos, prueba:
- **https://crm.arifamilyassets.com/** → Debería mostrar login del CRM

---

## ⚡ COMANDO TODO EN UNO (si prefieres):

```bash
# Ejecutar todo de una vez:
cp -r crm-build/* /var/www/vhosts/arifamilyassets.com/httpdocs/ && \
cd /var/www/vhosts/arifamilyassets.com/httpdocs/ && \
chmod 644 *.html && \
chmod 755 */ && \
chmod 644 .htaccess && \
chown -R psaadm:psacln * && \
echo "✅ CRM desplegado. Probar: https://crm.arifamilyassets.com/"
```

---

## 🆘 SI HAY PROBLEMAS:

**Rollback inmediato:**
```bash
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs
mv /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup-20251103_174546 /var/www/vhosts/arifamilyassets.com/httpdocs
```

---

## 📋 ¿QUÉ ESPERAR?

**Después de copiar, deberías ver:**
```bash
httpdocs/
├── index.html        ← Login del CRM
├── dashboard/        ← Panel principal  
├── companies/        ← Empresas
├── employees/        ← Empleados
├── finance/          ← Finanzas
├── ai/               ← IA
├── reports/          ← Reportes
├── settings/         ← Configuración
├── _next/            ← Assets (CSS/JS)
└── .htaccess         ← Configuración Apache
```

**¡Ejecuta el comando de copia y reporta el resultado!**