# 🚀 Backend Example - CRM ARI Mail API

Este es un backend completo de ejemplo que implementa todos los endpoints necesarios para el sistema de correo.

## 📋 Características Implementadas

### ✅ **Endpoints Funcionales**
- `GET /api/health` - Health check del servidor
- `POST /api/mail/test-connection` - Probar conectividad IMAP/SMTP
- `POST /api/mail/accounts` - Registrar nueva cuenta
- `GET /api/mail/accounts` - Listar todas las cuentas
- `GET /api/mail/accounts/{id}/folders` - Obtener carpetas IMAP
- `GET /api/mail/accounts/{id}/folders/{folder}/messages` - Obtener mensajes
- `POST /api/mail/send` - Enviar mensajes con adjuntos
- `DELETE /api/mail/accounts/{id}` - Eliminar cuenta

### ✅ **Funcionalidades**
- **Base de datos SQLite** para persistencia
- **Conexiones IMAP/SMTP reales** con soporte SSL/TLS
- **Envío de correos** con texto, HTML y adjuntos
- **Sincronización de carpetas** desde servidores IMAP
- **Obtención de mensajes** con paginación
- **Validación completa** de datos con Pydantic
- **Logging detallado** para debugging
- **CORS configurado** para desarrollo

## 🛠️ **Instalación Rápida**

### 1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

### 2. **Ejecutar servidor:**
```bash
python main.py
```

El servidor se ejecutará en `http://localhost:8000`

### 3. **Verificar funcionamiento:**
```bash
curl http://localhost:8000/api/health
```

## 📧 **Prueba con Gmail**

### **Configurar App Password:**
1. Ir a: https://myaccount.google.com/apppasswords
2. Generar contraseña de aplicación
3. Copiar la contraseña generada

### **Probar conexión:**
```bash
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

### **Registrar cuenta:**
```bash
curl -X POST http://localhost:8000/api/mail/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Gmail",
    "email": "tu-email@gmail.com",
    "provider": "gmail",
    "settings": {
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
    }
  }'
```

## 🔧 **Configuración Frontend**

El frontend debe apuntar al backend en desarrollo. Asegúrate de que las URLs coincidan:

- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000` o `http://localhost:5173`

## 📁 **Estructura de Archivos**

```
backend-example/
├── main.py           # Servidor FastAPI principal
├── requirements.txt  # Dependencias Python
├── README.md         # Esta documentación
└── mail_accounts.db  # Base de datos SQLite (se crea automáticamente)
```

## 🐛 **Debugging**

### **Logs del servidor:**
El servidor muestra logs detallados en la consola. Busca:
- `INFO` para operaciones exitosas
- `ERROR` para problemas de conexión

### **Base de datos:**
Puedes inspeccionar la DB SQLite:
```bash
sqlite3 mail_accounts.db
.tables
.schema accounts
SELECT * FROM accounts;
```

### **Testing con Postman:**
Importa la colección disponible en `/docs` (Swagger UI):
`http://localhost:8000/docs`

## ⚡ **Próximos Pasos**

Una vez que el backend funcione:

1. ✅ **Ejecutar frontend** (`npm start`)
2. ✅ **Probar configuración de cuenta** en la UI
3. ✅ **Verificar sincronización** de mensajes
4. ✅ **Probar envío** de correos
5. ✅ **Monitoring** de logs para debugging

## 🔒 **Seguridad**

⚠️ **IMPORTANTE**: Este es un ejemplo para desarrollo. Para producción:

- Encriptar contraseñas en la DB
- Usar variables de entorno para configuración
- Implementar autenticación JWT
- Configurar HTTPS
- Validar entrada de usuarios más estrictamente

## 📊 **Performance**

Para mejorar rendimiento en producción:

- Implementar cache de mensajes
- Usar pool de conexiones
- Optimizar queries SQLite
- Implementar paginación real
- Cache de carpetas y metadatos

---

¡El backend está listo para conectar con el frontend! 🚀