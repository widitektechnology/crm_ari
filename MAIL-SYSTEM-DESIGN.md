# 📧 SISTEMA DE CORREO ELECTRÓNICO - CRM ARI

## 🎯 **ARQUITECTURA DEL MAIL SYSTEM:**

### **📋 FUNCIONALIDADES CLAVE:**
1. **👤 Múltiples cuentas de correo**
   - Gmail, Outlook, Yahoo, IMAP/POP3
   - Configuración automática de proveedores
   - Sincronización en tiempo real

2. **📥 Bandeja unificada**
   - Vista consolidada de todas las cuentas
   - Filtros por cuenta, fecha, remitente
   - Búsqueda avanzada en todos los correos

3. **✉️ Gestión de correos**
   - Leer, responder, reenviar, eliminar
   - Marcado como leído/no leído
   - Etiquetas y carpetas personalizadas

4. **📝 Composer avanzado**
   - Editor rich text (HTML)
   - Adjuntos de archivos
   - Plantillas de correo
   - Programación de envío

5. **🔄 Sincronización**
   - Push notifications
   - Sincronización bidireccional
   - Estado offline

6. **🏷️ Organización**
   - Carpetas personalizadas
   - Etiquetas de colores
   - Filtros automáticos
   - Reglas de correo

## 🏗️ **COMPONENTES A CREAR:**

### **1. Mail Manager (Principal):**
```tsx
- MailDashboard.tsx     // Vista principal
- MailSidebar.tsx       // Navegación de cuentas/carpetas
- MailList.tsx          // Lista de correos
- MailViewer.tsx        // Visor de correo individual
- MailComposer.tsx      // Editor de correos
```

### **2. Configuración:**
```tsx
- AccountSetup.tsx      // Configurar cuentas
- MailSettings.tsx      // Configuración general
- FolderManager.tsx     // Gestión de carpetas
```

### **3. Componentes auxiliares:**
```tsx
- AttachmentHandler.tsx // Manejo de adjuntos
- SearchBar.tsx         // Búsqueda avanzada
- FilterPanel.tsx       // Filtros y ordenamiento
```

## 📊 **MODELOS DE DATOS:**

### **MailAccount:**
```typescript
interface MailAccount {
  id: string
  name: string
  email: string
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap' | 'pop3'
  settings: {
    incoming: { server: string, port: number, ssl: boolean }
    outgoing: { server: string, port: number, ssl: boolean }
    username: string
    password: string // Encriptado
  }
  isActive: boolean
  lastSync: Date
  unreadCount: number
}
```

### **MailMessage:**
```typescript
interface MailMessage {
  id: string
  accountId: string
  subject: string
  from: { name: string, email: string }
  to: Array<{ name: string, email: string }>
  cc?: Array<{ name: string, email: string }>
  bcc?: Array<{ name: string, email: string }>
  body: { text: string, html: string }
  attachments: Array<{ name: string, size: number, url: string }>
  isRead: boolean
  isStarred: boolean
  labels: string[]
  folderId: string
  receivedAt: Date
  sentAt?: Date
}
```

### **MailFolder:**
```typescript
interface MailFolder {
  id: string
  accountId: string
  name: string
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom'
  color?: string
  unreadCount: number
  totalCount: number
}
```

## 🎨 **DISEÑO UI/UX:**

### **Layout Principal:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: CRM ARI - Mail                    [🔍] [⚙️] [👤] │
├─────────────────────────────────────────────────────────┤
│ 📧 Mail  📊 Dashboard  🏢 Companies  👥 Employees       │
├─────────────────────────────────────────────────────────┤
│ Sidebar         │ Mail List      │ Mail Preview          │
│ ┌─────────────┐ │ ┌────────────┐ │ ┌─────────────────────┐ │
│ │📧 Cuentas   │ │ │[✉️] From   │ │ │ Subject: ...        │ │
│ │ Gmail (12)  │ │ │ Subject... │ │ │ From: user@...      │ │
│ │ Outlook (5) │ │ │ Preview... │ │ │ Date: ...           │ │
│ │             │ │ │ 2h ago     │ │ │                     │ │
│ │📁 Carpetas  │ │ │────────────│ │ │ Body content...     │ │
│ │ Entrada     │ │ │[✉️] From   │ │ │                     │ │
│ │ Enviados    │ │ │ Subject... │ │ │ [↩️ Reply] [↪️ Fwd] │ │
│ │ Borradores  │ │ │ Preview... │ │ │                     │ │
│ │ Papelera    │ │ │ 5h ago     │ │ │                     │ │
│ └─────────────┘ │ └────────────┘ │ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🔧 **INTEGRACIONES BACKEND:**

### **APIs necesarias:**
```typescript
// Endpoints del mail system
GET    /api/mail/accounts           // Listar cuentas
POST   /api/mail/accounts           // Crear cuenta
PUT    /api/mail/accounts/:id       // Actualizar cuenta
DELETE /api/mail/accounts/:id       // Eliminar cuenta

GET    /api/mail/messages           // Listar mensajes
GET    /api/mail/messages/:id       // Obtener mensaje
POST   /api/mail/messages           // Enviar mensaje
PUT    /api/mail/messages/:id       // Marcar leído/estrella
DELETE /api/mail/messages/:id       // Eliminar mensaje

GET    /api/mail/folders            // Listar carpetas
POST   /api/mail/folders            // Crear carpeta
PUT    /api/mail/folders/:id        // Actualizar carpeta

POST   /api/mail/sync               // Sincronizar cuentas
POST   /api/mail/search             // Búsqueda avanzada
```

## 🚀 **PLAN DE IMPLEMENTACIÓN:**

### **FASE 1: Fundamentos (Día 1)**
1. ✅ Crear tipos TypeScript
2. ✅ Estructura de componentes básicos
3. ✅ Layout principal con sidebar

### **FASE 2: Configuración (Día 2)**
4. ✅ Componente de configuración de cuentas
5. ✅ Validación de credenciales
6. ✅ Proveedores automáticos (Gmail, Outlook)

### **FASE 3: Funcionalidad Core (Día 3)**
7. ✅ Lista de correos con paginación
8. ✅ Visor de correos individuales
9. ✅ Marcado leído/no leído

### **FASE 4: Composer (Día 4)**
10. ✅ Editor de correos rich text
11. ✅ Manejo de adjuntos
12. ✅ Responder/Reenviar

### **FASE 5: Avanzado (Día 5)**
13. ✅ Búsqueda y filtros
14. ✅ Carpetas personalizadas
15. ✅ Sincronización automática

## 🎯 **OBJETIVO FINAL:**
Crear un sistema de correo tan completo como BlueMail o Mailbird, integrado nativamente en el CRM para gestión empresarial completa.

**¿Comenzamos con la FASE 1?** 🚀