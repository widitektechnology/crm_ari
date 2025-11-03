# ✅ CHECKLIST: REEMPLAZO ERP → CRM

## 📋 PRE-REQUISITOS VERIFICADOS
- [x] **test-simple.html funciona** → Servidor OK
- [x] **CRM compilado** → plesk-deploy/crm-build/ listo  
- [x] **Archivos organizados** → Estructura correcta
- [x] **Plesk accesible** → Panel funcionando

---

## 🎯 PROCESO DE REEMPLAZO

### **PASO 1: BACKUP DEL ERP ACTUAL** 📦
**Por SSH:**
```bash
cd /var/www/vhosts/arifamilyassets.com/
mv httpdocs httpdocs-erp-backup-$(date +%Y%m%d)
mkdir httpdocs
```

**Por Plesk:**
1. Files → httpdocs → Select All → Download (crear backup local)
2. Files → httpdocs → Select All → Delete
3. ✅ Directorio httpdocs ahora vacío

---

### **PASO 2: SUBIR CRM COMPLETO** 🚀

**Archivos a subir desde `plesk-deploy/crm-build/`:**
```
📁 crm-build/
├── index.html          ← SUBIR ✅
├── dashboard/          ← SUBIR ✅
├── companies/          ← SUBIR ✅
├── employees/          ← SUBIR ✅
├── finance/            ← SUBIR ✅
├── ai/                 ← SUBIR ✅
├── reports/            ← SUBIR ✅
├── settings/           ← SUBIR ✅
├── _next/              ← SUBIR ✅ (IMPORTANTE: toda la carpeta)
├── .htaccess           ← SUBIR ✅
└── 404.html            ← SUBIR ✅
```

**Método recomendado: Plesk File Manager**
1. Panel Plesk → Files → httpdocs
2. Upload → Select Files → Elegir TODO de crm-build/
3. ⚠️ **CRÍTICO**: Mantener estructura de carpetas

---

### **PASO 3: VERIFICACIÓN INMEDIATA** 🔍

**URLs a probar inmediatamente:**
- [ ] https://crm.arifamilyassets.com/ → Login del CRM
- [ ] https://crm.arifamilyassets.com/dashboard/ → Dashboard
- [ ] https://crm.arifamilyassets.com/companies/ → Empresas

**Si funciona:** ✅ **¡ÉXITO! CRM desplegado**

**Si da error:** ❌ **Ver sección de problemas abajo**

---

### **PASO 4: CONFIGURAR PERMISOS** (si es necesario) 🔧

**Por SSH:**
```bash
cd /var/www/vhosts/arifamilyassets.com/httpdocs/
chmod 644 *.html
chmod 755 */
chmod 644 .htaccess
chown -R psaadm:psacln *
```

---

## 🆘 SOLUCIÓN A PROBLEMAS

### **❌ Problema: 404 en página principal**
**Causa**: Archivo index.html no se subió
**Solución**: Verificar que index.html está en /httpdocs/

### **❌ Problema: Estilos no cargan**
**Causa**: Carpeta _next/ no se subió correctamente
**Solución**: Re-subir carpeta _next/ completa

### **❌ Problema: Rutas internas dan 404**
**Causa**: .htaccess no funciona
**Solución**: 
```bash
# Verificar contenido .htaccess
cat /var/www/vhosts/arifamilyassets.com/httpdocs/.htaccess
```

### **🔄 ROLLBACK DE EMERGENCIA**
```bash
# Volver al ERP original
rm -rf /var/www/vhosts/arifamilyassets.com/httpdocs
mv /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup-* /var/www/vhosts/arifamilyassets.com/httpdocs
```

---

## 🎯 RESULTADO ESPERADO

### **✅ DESPUÉS DEL REEMPLAZO EXITOSO:**

**https://crm.arifamilyassets.com/** mostrará:
```
🔐 Pantalla de Login moderna
📊 Formulario de autenticación
🎨 Diseño Tailwind CSS
📱 100% Responsive
⚡ Carga rápida
```

**Navegación funcionando:**
```
/dashboard/  → Panel principal
/companies/  → Gestión empresas
/employees/  → Gestión empleados
/finance/    → Módulo financiero
/ai/         → Asistente IA
/reports/    → Reportes
/settings/   → Configuración
```

---

## 📞 ESTADO ACTUAL

- ✅ **ERP detectado funcionando**
- ✅ **CRM compilado y listo**
- ⏳ **Esperando confirmación para reemplazo**

**¿Procedo con el backup y reemplazo? ¿Prefieres método SSH o Plesk File Manager?**