# 📋 Instrucciones para Actualizar Backend con Endpoints de Correo

## 🎯 Estructura del Proyecto

```
crm_ari/
├── frontend/           # ✅ Sistema React con componentes de correo
├── backend/            # 🔄 Backend FastAPI - ACTUALIZAR
│   ├── src/
│   │   └── api/
│   │       └── routers/
│   │           ├── companies.py
│   │           ├── ai.py
│   │           ├── payroll.py
│   │           ├── finance.py
│   │           ├── external_api.py
│   │           └── mail.py      # ← NUEVO
│   ├── main.py         # ← ACTUALIZADO
│   └── update-backend.sh        # ← NUEVO
└── docs/
```

## 🎯 Archivos Creados/Actualizados

### **1. Router de Correo**
- **Archivo**: `backend/src/api/routers/mail.py` ✅ CREADO
- **Función**: Endpoints IMAP/SMTP con conectividad real

### **2. Main.py Actualizado**
- **Archivo**: `backend/main.py` ✅ ACTUALIZADO
- **Función**: Integración del router de correo, versión 2.0.0

### **3. Script de Actualización**
- **Archivo**: `backend/update-backend.sh` ✅ CREADO
- **Función**: Deployment automático con 1 comando

---

## 🚀 Pasos para Subir y Aplicar

### **Paso 1: Verificar archivos locales creados**
```bash
# En tu máquina local, verifica que tienes:
ls -la backend/
# Debe mostrar:
# - src/api/routers/mail.py (NUEVO)
# - main.py (ACTUALIZADO) 
# - update-backend.sh (NUEVO)
```

### **Paso 2: Subir archivos al servidor**
```bash
# Subir router de correo (NUEVO)
scp backend/src/api/routers/mail.py root@57.129.144.154:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/routers/

# Subir main.py actualizado
scp backend/main.py root@57.129.144.154:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/

# Subir script de actualización
scp backend/update-backend.sh root@57.129.144.154:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/
```

### **Paso 3: Ejecutar en el servidor**
```bash
# SSH al servidor
ssh root@57.129.144.154

# Ir al directorio backend
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend

# Verificar que los archivos están
ls -la src/api/routers/mail.py
ls -la main.py
ls -la update-backend.sh

# Dar permisos de ejecución al script
chmod +x update-backend.sh

# Ejecutar actualización automática
./update-backend.sh
```

---

## ✨ Funcionalidades del Script `update-backend.sh`

### **🔄 Proceso Automático:**
1. **Backup automático** del contenedor actual
2. **Stop y remove** del contenedor anterior
3. **Rebuild** de la imagen con cambios
4. **Deploy** del nuevo contenedor
5. **Health checks** automáticos
6. **Logs** de verificación

### **🛡️ Seguridad:**
- Backup antes de cambios
- Verificación de errores en cada paso
- Rollback automático si falla

### **📊 Monitoring:**
- Tests de conectividad
- Logs en tiempo real
- Estado del contenedor

---

## 🧪 Endpoints Agregados

Una vez aplicados los cambios, tendrás disponibles:

### **📧 Mail API:**
- `GET /api/mail/health` - Health check del sistema de correo
- `POST /api/mail/test-connection` - Probar conectividad IMAP/SMTP
- `POST /api/mail/accounts` - Registrar cuenta de correo
- `GET /api/mail/accounts` - Listar cuentas
- `GET /api/mail/accounts/{id}/folders` - Obtener carpetas IMAP
- `POST /api/mail/send` - Enviar mensajes

### **🔍 Testing:**
```bash
# Test general del API
curl http://localhost:8000/api/health

# Test específico de correo
curl http://localhost:8000/api/mail/health

# Test de conectividad con Gmail
curl -X POST http://localhost:8000/api/mail/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "incoming": {
      "server": "imap.gmail.com",
      "port": 993,
      "ssl": true,
      "username": "tu-email@gmail.com", 
      "password": "tu-app-password"
    },
    "outgoing": {
      "server": "smtp.gmail.com",
      "port": 587,
      "ssl": true,
      "username": "tu-email@gmail.com",
      "password": "tu-app-password"
    }
  }'
```

---

## 🎯 Uso Futuro

### **Para futuras actualizaciones, solo necesitas:**
```bash
# SSH al servidor
ssh root@57.129.144.154

# Ir al directorio backend
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend

# Ejecutar actualización automática
./update-backend.sh
```

**¡Eso es todo!** El script se encarga de todo el proceso automáticamente. 🚀

---

## 📝 Notas Importantes

1. **Backup Automático**: Cada actualización crea un backup del contenedor anterior
2. **Zero Downtime**: El proceso minimiza el tiempo de inactividad
3. **Health Checks**: Verificación automática de que todo funciona
4. **Logs Detallados**: Todo el proceso queda registrado con timestamps
5. **Error Handling**: Si algo falla, el script se detiene y muestra el error

¡El sistema de correo estará listo después de ejecutar estos pasos! 📧✨