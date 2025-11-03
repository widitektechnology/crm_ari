# 🔧 Diagnóstico de Problemas - CRM Plesk

## ❌ Problema: `test-deployment.html` da 404

### 🕵️ Pasos de Diagnóstico:

#### 1. **Verificar archivos básicos**
Prueba estas URLs en orden:

1. `https://crm.arifamilyassets.com/test-simple.html`
   - Si funciona ✅: Los archivos HTML se sirven correctamente
   - Si da 404 ❌: Problema con Document Root o archivos no subidos

2. `https://crm.arifamilyassets.com/index.html`
   - Si funciona ✅: El CRM base está accesible
   - Si da 404 ❌: Document Root mal configurado

3. `https://crm.arifamilyassets.com/`
   - Si funciona ✅: Redirecciones funcionan parcialmente
   - Si da 404 ❌: .htaccess no está activo

#### 2. **Verificar configuración Plesk**

**Document Root debe ser exactamente:**
```
/httpdocs/frontend/build
```

**NO debe ser:**
- `/httpdocs/`
- `/httpdocs/frontend/`
- `/httpdocs/frontend/build/` (con barra final)

#### 3. **Verificar estructura de archivos en servidor**

En el servidor, debe existir:
```
/httpdocs/frontend/build/
├── .htaccess                ← IMPORTANTE
├── index.html
├── test-simple.html         ← NUEVO archivo de prueba
├── test-deployment.html
└── _next/
```

#### 4. **Soluciones por pasos**

**Solución A - .htaccess simple:**
1. Renombra `.htaccess` a `.htaccess-backup`
2. Renombra `.htaccess-simple` a `.htaccess`
3. Prueba `https://crm.arifamilyassets.com/test-simple.html`

**Solución B - Verificar permisos:**
```bash
chmod 644 .htaccess
chmod 644 *.html
chmod 755 _next/
```

**Solución C - Verificar Apache mod_rewrite:**
En Plesk > Apache & nginx Settings:
- Verificar que mod_rewrite esté habilitado

#### 5. **Test de URLs en orden:**

1. ✅ `https://crm.arifamilyassets.com/test-simple.html`
2. ✅ `https://crm.arifamilyassets.com/test-deployment.html`  
3. ✅ `https://crm.arifamilyassets.com/`
4. ✅ `https://crm.arifamilyassets.com/dashboard/`

### 🚨 Si nada funciona:

1. **Verificar logs de error en Plesk**
   - Plesk > Logs > Error Logs

2. **Verificar que Apache puede leer .htaccess**
   - Plesk > Apache & nginx Settings
   - Verificar "Allow override" está habilitado

3. **Probar sin .htaccess temporalmente**
   - Renombrar .htaccess a .htaccess-disabled
   - Probar URLs directas

### 📞 Información para soporte:

Si necesitas contactar soporte de Plesk, proporciona:
- URL que no funciona
- Error exacto (404, 500, etc.)
- Configuración actual de Document Root
- Contenido de los logs de error

---

**Siguiente paso:** Prueba `https://crm.arifamilyassets.com/test-simple.html` y reporta el resultado.