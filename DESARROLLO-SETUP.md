# 🚀 Guía de Desarrollo - Sistema de Correo

## Estado Actual del Proyecto

### ✅ **Frontend Completado**
- **Componentes de interfaz**: MailDashboard, MailList, MailViewer, MailComposer, AccountSetup
- **Servicios avanzados**: MailAutodiscovery (DNS SRV, Autodiscover, ISPDB), MailConnectionService
- **Contexto actualizado**: MailContext integrado con servicios reales
- **Estado de conexión**: ConnectionStatus para monitorear conectividad en tiempo real

### 🔄 **Próximo Paso: Implementar Backend**

El frontend está completamente preparado para conectividad real. Necesitas implementar los endpoints del backend documentados en `MAIL-API-BACKEND.md`.

---

## 🛠️ **Setup de Desarrollo**

### **Estructura de carpetas recomendada:**
```
crm_ari/
├── frontend/          # React + TypeScript (✅ LISTO)
├── backend/           # 🔄 CREAR: Python FastAPI 
├── docs/              # Documentación
└── docker/            # Contenedores (opcional)
```

### **Backend mínimo requerido:**

1. **Crear directorio backend:**
```bash
mkdir backend
cd backend
```

2. **Instalar dependencias Python:**
```bash
pip install fastapi uvicorn imaplib2 smtplib email-validator python-multipart
```

3. **Crear `main.py` básico:**
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import imaplib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = FastAPI(title="CRM ARI Mail API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "CRM ARI Mail API"}

@app.post("/api/mail/test-connection")
async def test_connection(config: dict):
    try:
        # Probar IMAP
        imap = imaplib.IMAP4_SSL(
            config["incoming"]["server"], 
            config["incoming"]["port"]
        )
        imap.login(
            config["incoming"]["username"], 
            config["incoming"]["password"]
        )
        imap.close()
        
        # Probar SMTP
        smtp = smtplib.SMTP(
            config["outgoing"]["server"], 
            config["outgoing"]["port"]
        )
        smtp.starttls()
        smtp.login(
            config["outgoing"]["username"], 
            config["outgoing"]["password"]
        )
        smtp.quit()
        
        return {
            "success": True,
            "details": {
                "imap": "Connected successfully",
                "smtp": "Connected successfully"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

4. **Ejecutar backend:**
```bash
python main.py
```

---

## 🧪 **Testing del Sistema**

### **1. Verificar backend:**
```bash
curl http://localhost:8000/api/health
```

### **2. Probar conexión mail:**
```bash
curl -X POST http://localhost:8000/api/mail/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "incoming": {
      "server": "imap.gmail.com",
      "port": 993,
      "username": "tu-email@gmail.com",
      "password": "tu-app-password"
    },
    "outgoing": {
      "server": "smtp.gmail.com", 
      "port": 587,
      "username": "tu-email@gmail.com",
      "password": "tu-app-password"
    }
  }'
```

### **3. Probar frontend:**
```bash
cd frontend
npm start
```

---

## 📝 **Lista de Endpoints Prioritarios**

### **Fase 1 - Básico (CRÍTICO)**
- ✅ `GET /api/health` 
- ✅ `POST /api/mail/test-connection`
- 🔄 `POST /api/mail/accounts` (registrar cuenta)
- 🔄 `GET /api/mail/accounts` (listar cuentas)

### **Fase 2 - Mensajes (ALTA PRIORIDAD)**  
- 🔄 `GET /api/mail/accounts/{id}/folders` (sincronizar carpetas)
- 🔄 `GET /api/mail/accounts/{id}/folders/{folder}/messages` (obtener mensajes)
- 🔄 `POST /api/mail/send` (enviar mensaje)

### **Fase 3 - Operaciones (MEDIA PRIORIDAD)**
- 🔄 `PATCH /api/mail/accounts/{id}/messages/{msg}/read` (marcar leído)
- 🔄 `DELETE /api/mail/accounts/{id}/messages/{msg}` (eliminar)
- 🔄 `GET /api/mail/accounts/{id}/search` (búsqueda)

---

## ⚡ **Quick Start para Pruebas**

### **Con Gmail (recomendado para pruebas):**

1. **Configurar App Password:**
   - Ir a: https://myaccount.google.com/apppasswords
   - Generar contraseña de aplicación
   - Usar esa contraseña en lugar de la normal

2. **Configurar en el frontend:**
   - Email: `tu-email@gmail.com`
   - Servidor IMAP: `imap.gmail.com:993` (SSL)
   - Servidor SMTP: `smtp.gmail.com:587` (TLS)
   - Usuario: `tu-email@gmail.com`
   - Contraseña: `app-password-generada`

---

## 🔧 **Debugging y Troubleshooting**

### **Frontend Debug:**
- Abrir DevTools → Network tab
- Verificar llamadas a `/api/mail/*`
- Revisar Console para errores

### **Backend Debug:**
- Logs en terminal donde corre `python main.py`
- Agregar `print()` statements en endpoints
- Usar Postman/curl para probar endpoints directamente

### **Errores Comunes:**
- **CORS**: Verificar `allow_origins` en FastAPI
- **SSL/TLS**: Gmail requiere SSL para IMAP, TLS para SMTP
- **Auth**: Usar App Passwords, no contraseña normal
- **Ports**: 993 (IMAP), 587 (SMTP) son estándar

---

## 📚 **Recursos Útiles**

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Python imaplib**: https://docs.python.org/3/library/imaplib.html
- **Gmail IMAP/SMTP**: https://support.google.com/mail/answer/7126229
- **Mozilla ISPDB**: https://autoconfig.thunderbird.net/

---

## 🎯 **Objetivo Final**

Una vez implementado el backend básico:

1. ✅ **Frontend conecta a backend real**
2. ✅ **Puede probar conectividad IMAP/SMTP**  
3. ✅ **Registra cuentas en base de datos**
4. ✅ **Sincroniza mensajes reales**
5. ✅ **Envía correos por SMTP**

**Status actual**: Frontend 100% listo → Backend 0% implementado

¡El frontend ya está preparado para recibir datos reales! 🚀