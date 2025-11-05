# 📧 API Endpoints para Sistema de Correo Real

## Endpoints requeridos en el backend para conectividad IMAP/SMTP real

### 🔐 **Autenticación y Cuentas**

#### `POST /api/mail/accounts`
Registra una nueva cuenta de correo
```json
{
  "name": "Mi Gmail",
  "email": "usuario@gmail.com",
  "provider": "gmail",
  "settings": {
    "incoming": {
      "server": "imap.gmail.com",
      "port": 993,
      "ssl": true,
      "username": "usuario@gmail.com",
      "password": "contraseña_o_app_password"
    },
    "outgoing": {
      "server": "smtp.gmail.com", 
      "port": 587,
      "ssl": true,
      "username": "usuario@gmail.com",
      "password": "contraseña_o_app_password"
    }
  }
}
```

#### `GET /api/mail/accounts`
Obtiene todas las cuentas registradas del usuario

#### `PATCH /api/mail/accounts/{accountId}`
Actualiza una cuenta existente

#### `DELETE /api/mail/accounts/{accountId}`
Elimina una cuenta

---

### 🔍 **Conectividad y Pruebas**

#### `POST /api/mail/test-connection`
Prueba la conectividad IMAP/SMTP sin guardar la cuenta
```json
{
  "incoming": {
    "server": "imap.gmail.com",
    "port": 993,
    "ssl": true,
    "username": "usuario@gmail.com",
    "password": "password"
  },
  "outgoing": {
    "server": "smtp.gmail.com",
    "port": 587, 
    "ssl": true,
    "username": "usuario@gmail.com",
    "password": "password"
  }
}
```

Respuesta:
```json
{
  "success": true,
  "details": {
    "imap": "Connected successfully",
    "smtp": "Connected successfully"
  }
}
```

---

### 📁 **Gestión de Carpetas**

#### `GET /api/mail/accounts/{accountId}/folders`
Sincroniza y obtiene carpetas del servidor IMAP

Respuesta:
```json
[
  {
    "id": "inbox",
    "accountId": "account_id",
    "name": "INBOX",
    "displayName": "Bandeja de entrada",
    "type": "inbox",
    "unreadCount": 5,
    "totalCount": 150,
    "path": "INBOX",
    "attributes": []
  }
]
```

---

### 📧 **Gestión de Mensajes**

#### `GET /api/mail/accounts/{accountId}/folders/{folderId}/messages`
Obtiene mensajes de una carpeta específica

Parámetros:
- `limit`: Número máximo de mensajes (default: 50)
- `offset`: Desplazamiento para paginación (default: 0)

#### `GET /api/mail/accounts/{accountId}/messages/{messageId}`
Obtiene un mensaje completo con cuerpo y adjuntos

#### `PATCH /api/mail/accounts/{accountId}/messages/{messageId}/read`
Marca un mensaje como leído/no leído
```json
{
  "isRead": true
}
```

#### `PATCH /api/mail/accounts/{accountId}/messages/{messageId}/star`
Marca un mensaje como destacado
```json  
{
  "isStarred": true
}
```

#### `PATCH /api/mail/accounts/{accountId}/messages/{messageId}/move`
Mueve un mensaje a otra carpeta
```json
{
  "targetFolderId": "sent"
}
```

#### `DELETE /api/mail/accounts/{accountId}/messages/{messageId}`
Elimina un mensaje
```json
{
  "permanent": false
}
```

---

### 📤 **Envío de Mensajes**

#### `POST /api/mail/send`
Envía un mensaje usando SMTP

Content-Type: `multipart/form-data`

Campos:
- `accountId`: ID de la cuenta
- `to`: JSON array de destinatarios
- `subject`: Asunto
- `body`: JSON con texto y HTML
- `cc`: JSON array (opcional)
- `bcc`: JSON array (opcional)  
- `priority`: "low", "normal", "high"
- `requestReadReceipt`: boolean
- `attachment_0`, `attachment_1`, etc.: Archivos adjuntos

---

### 💾 **Borradores**

#### `POST /api/mail/accounts/{accountId}/drafts`
Guarda un borrador
```json
{
  "to": [{"email": "destino@ejemplo.com", "name": "Destino"}],
  "subject": "Borrador",
  "body": {"text": "Contenido", "html": "<p>Contenido</p>"}
}
```

---

### 🔍 **Búsqueda**

#### `GET /api/mail/accounts/{accountId}/search`
Busca mensajes

Parámetros:
- `q`: Consulta de búsqueda
- `folderId`: Carpeta específica (opcional)
- `limit`: Límite de resultados

---

### 📎 **Archivos Adjuntos**

#### `GET /api/mail/accounts/{accountId}/messages/{messageId}/attachments/{attachmentId}`
Descarga un archivo adjunto

---

### 🔄 **Sincronización**

#### `GET /api/mail/accounts/{accountId}/sync/status`
Obtiene el estado de sincronización

#### `POST /api/mail/accounts/{accountId}/sync`
Inicia sincronización manual

---

## 🛠️ **Implementación Backend Requerida**

### **Dependencias Python recomendadas:**
```bash
pip install imaplib2 smtplib email-validator
```

### **Funcionalidades clave a implementar:**

1. **Cliente IMAP**
   - Conexión SSL/TLS segura
   - Autenticación (password y OAuth2)
   - Sincronización de carpetas y mensajes
   - Manejo de flags (leído, destacado, etc.)

2. **Cliente SMTP**
   - Envío de mensajes multipart
   - Soporte para adjuntos
   - Autenticación segura
   - Headers personalizados

3. **Almacenamiento local**
   - Cache de mensajes para acceso rápido
   - Indexación para búsqueda
   - Sincronización incremental

4. **Seguridad**
   - Encriptación de contraseñas
   - Validación de certificados SSL
   - Rate limiting para evitar bloqueos

### **Ejemplo de estructura de respuesta para mensajes:**
```json
{
  "id": "msg_123",
  "accountId": "acc_456", 
  "messageId": "<unique@server.com>",
  "subject": "Asunto del mensaje",
  "from": {"name": "Remitente", "email": "from@ejemplo.com"},
  "to": [{"name": "Destinatario", "email": "to@ejemplo.com"}],
  "cc": [],
  "bcc": [],
  "body": {
    "text": "Contenido en texto plano",
    "html": "<p>Contenido HTML</p>"
  },
  "attachments": [
    {
      "id": "att_789",
      "filename": "documento.pdf",
      "contentType": "application/pdf", 
      "size": 1024,
      "isInline": false
    }
  ],
  "isRead": false,
  "isStarred": false,
  "isFlagged": false,
  "isImportant": false,
  "labels": [],
  "folderId": "inbox",
  "receivedAt": "2025-11-05T10:30:00Z",
  "sentAt": "2025-11-05T10:29:45Z",
  "size": 2048,
  "hasAttachments": true,
  "snippet": "Extracto del contenido del mensaje..."
}
```

---

## 📋 **Lista de Tareas Backend**

### ✅ **Alta Prioridad**
- [ ] Implementar cliente IMAP básico
- [ ] Implementar cliente SMTP básico  
- [ ] Endpoint de prueba de conexión
- [ ] Registro y gestión de cuentas
- [ ] Sincronización de carpetas

### 🔄 **Media Prioridad**
- [ ] Sincronización de mensajes
- [ ] Envío de correos con adjuntos
- [ ] Marcado de mensajes (leído/destacado)
- [ ] Búsqueda de mensajes
- [ ] Gestión de borradores

### 📈 **Baja Prioridad**
- [ ] Soporte OAuth2 para Gmail/Outlook
- [ ] Sincronización en tiempo real
- [ ] Filtros automáticos
- [ ] Notificaciones push
- [ ] Métricas y estadísticas

El frontend ya está listo para consumir estos endpoints. Una vez implementado el backend, el sistema funcionará con correo real.