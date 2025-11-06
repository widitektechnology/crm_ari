# 🚀 INSTRUCCIONES DE DESPLIEGUE - CRM ARI

## 📋 Estado actual del sistema:

✅ **Correo electrónico**: Funcionando correctamente
✅ **Frontend**: Compilado y listo
✅ **Backend**: Container Docker construido correctamente
✅ **main.py**: Verificado - configuración de empleados es correcta
✅ **employees.py**: Archivo existe en servidor (actualizado Nov 5)
✅ **__init__.py**: Employees ahora se importa correctamente
❌ **NUEVO ERROR**: ModuleNotFoundError: No module named 'src.config'
🔍 **Causa confirmada**: config/ existe en raíz pero falta en src/ (ubicación incorrecta)
🛠️ **Solución**: Copiar config/ dentro de src/ directorio

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

## 🔧 PRÓXIMOS PASOS REQUERIDOS:

1. **✅ COMPLETADO**: Archivos del backend subidos con Git
2. **🔄 SIGUIENTE**: Reiniciar el servicio backend en el servidor
3. **📝 PENDIENTE**: Verificar que `/api/employees` funciona correctamente
4. **🌐 OPCIONAL**: Subir archivos del frontend vía Plesk
5. **🧪 FINAL**: Probar el sistema completo

---

## ✅ VERIFICACIONES POST-DESPLIEGUE:

- [ ] `https://crm.arifamilyassets.com/api/employees` devuelve 200 OK
- [ ] `https://crm.arifamilyassets.com/api/companies` funciona
- [ ] `https://crm.arifamilyassets.com/api/mail/health` funciona
- [ ] Frontend carga sin errores Mixed Content
- [ ] Dashboard muestra empleados y empresas correctamente

---

## 🚨 PROBLEMA DETECTADO:

1. **✅ Backend reiniciado**: Container Docker funcionando correctamente
2. **❌ Router employees**: No se está cargando en el servidor
3. **🔍 Causa probable**: El `main.py` en el servidor no tiene las líneas de empleados

---

## �️ SOLUCIÓN REQUERIDA - VERIFICAR ARCHIVOS:

El servidor necesita tener exactamente estos archivos actualizados:

### 1️⃣ Archivo `main.py` debe contener:
```python
from .routers import companies, payroll, finance, ai, external_api, mail, employees

# Y las líneas:
app.include_router(employees.router, prefix="/api/v1/employees", tags=["Employees v1"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
```

### 2️⃣ Archivo `employees.py` debe existir en:
```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/routers/employees.py
```

### 3️⃣ Comandos para verificar/corregir:
```bash
# SSH al servidor
ssh root@ns31792975
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend

# Verificar si existe employees.py
ls -la src/api/routers/employees.py

# Verificar main.py contiene employees
grep -n "employees" src/api/main.py

# Si falta, copiar desde Git o repositorio local
```