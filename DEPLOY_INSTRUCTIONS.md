# 🚀 INSTRUCCIONES DE DESPLIEGUE - CRM ARI

## 📋 Estado actual del sistema:

✅ **Correo electrónico**: Funcionando correctamente
✅ **Frontend**: Compilado y listo
❌ **Empleados**: Falta subir archivos del backend
❌ **Mixed Content**: Pendiente de resolverse con archivos actualizados

---

## 📁 ARCHIVOS BACKEND A SUBIR AL SERVIDOR

### 1. Archivo principal actualizado:
**Ubicación local**: `C:\Users\edu\Documents\GitHub\crm_ari\backend\src\api\main.py`
**Ubicación servidor**: `/backend/src/api/main.py`

### 2. Nuevo archivo de empleados:
**Ubicación local**: `C:\Users\edu\Documents\GitHub\crm_ari\backend\src\api\routers\employees.py`
**Ubicación servidor**: `/backend/src/api/routers/employees.py`

---

## 📁 ARCHIVOS FRONTEND A SUBIR VÍA PLESK

**Ubicación local**: `C:\Users\edu\Documents\GitHub\crm_ari\frontend\dist\`
**Ubicación servidor**: Carpeta raíz del dominio `crm.arifamilyassets.com`

### Archivos específicos:
- `index.html` (4.93 kB)
- `assets/index-DQHFXUO7.css` (5.65 kB)
- `assets/vendor-Dfoqj1Wf.js` (11.69 kB)
- `assets/router-6S1-IzBt.js` (32.51 kB)
- `assets/index-1gjszCy8.js` (323.55 kB)

---

## 🔧 ORDEN DE SUBIDA RECOMENDADO:

1. **PRIMERO**: Subir archivos del backend al servidor
2. **SEGUNDO**: Reiniciar el servicio backend en el servidor
3. **TERCERO**: Subir archivos del frontend vía Plesk
4. **CUARTO**: Probar el sistema completo

---

## ✅ VERIFICACIONES POST-DESPLIEGUE:

- [ ] `https://crm.arifamilyassets.com/api/employees` devuelve 200 OK
- [ ] `https://crm.arifamilyassets.com/api/companies` funciona
- [ ] `https://crm.arifamilyassets.com/api/mail/health` funciona
- [ ] Frontend carga sin errores Mixed Content
- [ ] Dashboard muestra empleados y empresas correctamente

---

## 🚨 PROBLEMAS ACTUALES A RESOLVER:

1. **404 /api/employees**: El endpoint no existe porque `employees.py` no está en el servidor
2. **Mixed Content HTTP**: Algunas requests siguen usando HTTP en lugar de HTTPS
3. **TypeError u.map**: La API no devuelve arrays como espera el frontend

**SOLUCIÓN**: Subir los archivos del backend actualizados al servidor de producción.