# 🔄 REEMPLAZAR ERP ACTUAL CON CRM

## ✅ Estado Confirmado
- **Servidor funcionando**: ✅ test-simple.html se ve correctamente
- **Plesk configurado**: ✅ Document Root funcional
- **CRM compilado**: ✅ Listo en `plesk-deploy/crm-build/`

---

## 🎯 PLAN DE REEMPLAZO

### **Paso 1: Hacer Backup del ERP Actual** 📦
```bash
# Por SSH en el servidor Linux
cd /var/www/vhosts/arifamilyassets.com/
mv httpdocs httpdocs-backup-$(date +%Y%m%d)
mkdir httpdocs
```

### **Paso 2: Subir CRM Completo** 🚀
**Método A: Via Plesk File Manager**
1. Panel Plesk → Files → httpdocs (ya vacío)
2. Upload todo el contenido de `plesk-deploy/crm-build/`
3. Mantener estructura de carpetas `_next/`

**Método B: Via SFTP/SCP**
```bash
# Desde Windows PowerShell
scp -r plesk-deploy/crm-build/* usuario@crm.arifamilyassets.com:/var/www/vhosts/arifamilyassets.com/httpdocs/
```

### **Paso 3: Configurar Permisos** 🔧
```bash
# SSH en servidor
cd /var/www/vhosts/arifamilyassets.com/httpdocs/
chmod 644 *.html
chmod 755 */
chmod 644 .htaccess
chown -R psaadm:psacln *
```

---

## 📋 VERIFICACIÓN POST-DESPLIEGUE

### **URLs a Probar** (deberían funcionar inmediatamente):
- ✅ **Login**: https://crm.arifamilyassets.com/
- ✅ **Dashboard**: https://crm.arifamilyassets.com/dashboard/
- ✅ **Empresas**: https://crm.arifamilyassets.com/companies/
- ✅ **Empleados**: https://crm.arifamilyassets.com/employees/
- ✅ **Finanzas**: https://crm.arifamilyassets.com/finance/
- ✅ **IA**: https://crm.arifamilyassets.com/ai/
- ✅ **Reportes**: https://crm.arifamilyassets.com/reports/
- ✅ **Configuración**: https://crm.arifamilyassets.com/settings/

### **Funcionalidades a Verificar**:
- 🔐 **Login funcional** (formulario responsive)
- 🧭 **Navegación entre módulos** (SPA routing)
- 📱 **Responsive design** (móvil/tablet/desktop)
- 🎨 **UI moderna** (Tailwind CSS aplicado)
- ⚡ **Carga rápida** (assets optimizados)

---

## 🛠️ SOLUCIÓN A PROBLEMAS COMUNES

### **Si aparece 404 en rutas internas**:
```bash
# Verificar que .htaccess existe y tiene contenido
cat /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess

# Debe contener reglas de reescritura para React Router
```

### **Si faltan estilos/imágenes**:
```bash
# Verificar que carpeta _next existe
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/_next/

# Verificar permisos de assets
chmod -R 644 /var/www/vhosts/arifamilyassets.com/httpdocs/_next/
```

### **Si hay errores de JavaScript**:
- Verificar que todos los archivos .js se subieron
- Comprobar logs del navegador (F12 → Console)
- Verificar Content-Type en servidor Apache

---

## 🚀 PROCESO RECOMENDADO PASO A PASO

### **Paso 1**: Backup del ERP actual
```bash
# Renombrar carpeta actual (mantener como backup)
mv /var/www/vhosts/arifamilyassets.com/httpdocs /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup
mkdir /var/www/vhosts/arifamilyassets.com/httpdocs
```

### **Paso 2**: Subir CRM via Plesk
- Files → httpdocs → Upload
- Seleccionar todo el contenido de `plesk-deploy/crm-build/`
- ⚠️ **IMPORTANTE**: Mantener estructura de carpetas

### **Paso 3**: Probar inmediatamente
- https://crm.arifamilyassets.com/ → Debería mostrar login del CRM

### **Paso 4**: Si hay problemas, rollback rápido
```bash
# Volver al ERP original
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs
mv /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup /var/www/vhosts/arifamilyassets.com/httpdocs
```

---

## 📊 CONTENIDO DEL CRM LISTO

### **Páginas Principales** (estáticas, funcionan sin backend):
```
✅ index.html        → Login/Autenticación
✅ dashboard/        → Panel principal con KPIs
✅ companies/        → Gestión de empresas
✅ employees/        → Gestión de empleados  
✅ finance/          → Módulo financiero
✅ ai/               → Asistente con IA
✅ reports/          → Sistema de reportes
✅ settings/         → Configuración
```

### **Assets y Recursos**:
```
✅ _next/static/     → CSS, JS, imágenes optimizados
✅ .htaccess         → Configuración Apache
✅ 404.html          → Página de error personalizada
```

---

## 🎯 RESULTADO ESPERADO

Después del reemplazo, **https://crm.arifamilyassets.com/** mostrará:

1. **🔐 Página de Login moderna** con campos de usuario/contraseña
2. **🎨 Diseño profesional** con Tailwind CSS
3. **📱 Completamente responsive** 
4. **🧭 Navegación fluida** entre módulos
5. **⚡ Carga rápida** (archivos optimizados)

---

## 📞 ¿LISTO PARA EL REEMPLAZO?

**¿Prefieres que:**
1. **Te guíe paso a paso** por Plesk File Manager (más seguro)
2. **Te dé comandos SSH** para hacerlo rápido
3. **Primero hacer backup** del ERP actual

**El CRM está 100% listo. Solo necesitamos sustituir los archivos.**