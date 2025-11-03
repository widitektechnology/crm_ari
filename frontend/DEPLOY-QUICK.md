# 🎯 GUÍA RÁPIDA: Desplegar CRM en Plesk

## 📦 Lo que tienes listo para subir:

```
frontend/
├── build/                    ← ESTA CARPETA contiene el CRM compilado
│   ├── index.html           ← Página principal
│   ├── .htaccess            ← Configuración Apache (ya incluido)
│   ├── test-deployment.html ← Página de verificación
│   ├── _next/               ← Archivos JavaScript y CSS
│   ├── dashboard/           ← Página del dashboard
│   ├── companies/           ← Página de empresas
│   ├── employees/           ← Página de empleados
│   ├── finance/             ← Página de finanzas
│   ├── ai/                  ← Página de IA
│   ├── reports/             ← Página de reportes
│   ├── settings/            ← Página de configuración
│   └── auth/                ← Página de login
└── PLESK-SETUP.md           ← Instrucciones detalladas
```

## 🚀 PASOS RÁPIDOS (5 minutos):

### 1. Subir Archivos
- Sube TODA la carpeta `frontend` a tu servidor Plesk por FTP/SFTP
- Ubicación: `/httpdocs/frontend/`

### 2. Configurar Document Root en Plesk
1. Ve a **Plesk > Hosting Settings**
2. Cambia **Document Root** de `/httpdocs` a `/httpdocs/frontend/build`
3. Guarda cambios

### 3. ¡LISTO! 🎉
- Visita: `https://crm.arifamilyassets.com/`
- Usuario: `admin@crm.com`
- Contraseña: `admin123`

## 🧪 Verificar Despliegue
- Ve a: `https://crm.arifamilyassets.com/test-deployment.html`
- Esta página verificará automáticamente que todo funcione

## ⚡ Si algo no funciona:

### Problema: Error 404 en rutas del CRM
**Solución**: Verifica que el archivo `.htaccess` esté en `frontend/build/.htaccess`

### Problema: Página en blanco
**Solución**: 
1. Verifica que Document Root sea `/httpdocs/frontend/build`
2. Revisa los logs de error en Plesk

### Problema: No cargan estilos/JavaScript
**Solución**: Verifica permisos de archivos (644 para archivos, 755 para carpetas)

## 📁 Estructura Final en el Servidor:
```
/httpdocs/frontend/build/ ← Document Root apunta aquí
├── index.html
├── .htaccess
├── _next/
└── (resto de archivos)
```

## 🔗 URLs que funcionarán:
- ✅ `https://crm.arifamilyassets.com/` → Login
- ✅ `https://crm.arifamilyassets.com/dashboard/` → Dashboard  
- ✅ `https://crm.arifamilyassets.com/companies/` → Empresas
- ✅ `https://crm.arifamilyassets.com/cualquier-ruta/` → Funciona por SPA

---
**¡El CRM está listo para usar!** 🚀