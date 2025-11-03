# 🚀 CRM System - Build de Producción

Esta carpeta contiene el build estático del CRM System, listo para despliegue directo en cualquier servidor web.

## 📁 Contenido del Build

```
build/
├── index.html          # Página de inicio (redirige al login)
├── auth/               # Páginas de autenticación
│   └── login.html      # Página de login del sistema
├── dashboard/          # Dashboard principal
│   └── index.html      # Panel de control con métricas
├── companies/          # Módulo de empresas
│   └── index.html      # Gestión de empresas cliente
├── employees/          # Módulo de empleados
│   └── index.html      # Gestión de personal
├── finance/            # Módulo financiero
│   └── index.html      # Gestión de facturas y finanzas
├── ai/                 # Herramientas de IA
│   └── index.html      # Clasificación de emails y chat IA
├── reports/            # Centro de reportes
│   └── index.html      # Generación y gestión de reportes
├── settings/           # Configuración del sistema
│   └── index.html      # Gestión de usuarios y configuración
├── _next/              # Archivos estáticos optimizados
│   ├── static/         # CSS, JS y recursos minificados
│   └── ...
└── 404.html            # Página de error 404
```

## 🚀 Despliegue Directo

### Opción 1: Servidor Web Simple (Apache/Nginx)
```bash
# 1. Subir toda la carpeta 'build' al directorio web del servidor
# 2. Configurar el servidor para servir archivos estáticos
# 3. ¡Listo! El CRM estará disponible
```

### Opción 2: Hosting Estático (Netlify, Vercel, GitHub Pages)
```bash
# 1. Comprimir la carpeta 'build' en un .zip
# 2. Subir el .zip directamente a la plataforma
# 3. La plataforma automáticamente desplegará el sitio
```

### Opción 3: Servidor Local de Prueba
```bash
# Para probar localmente con Python:
cd build
python -m http.server 8080

# Para probar localmente con Node.js:
cd build
npx serve -s . -l 8080
```

## ⚙️ Configuración

### Variables de Entorno (ya incluidas en el build)
- **API URL**: https://crm.arifamilyassets.com
- **Modo**: Producción
- **Optimización**: Activada

### Credenciales de Prueba
- **Email**: admin@crm.com
- **Contraseña**: admin123

## 📊 Información del Build

- **Fecha de compilación**: 3 de noviembre de 2025
- **Next.js**: 14.0.4
- **Modo**: Static Export (SPA)
- **Páginas generadas**: 11 páginas estáticas
- **Tamaño total**: ~15 MB
- **Tipo**: Single Page Application (SPA)

## 🎯 Características del Sistema

✅ **CRM Completo**
- Dashboard con métricas en tiempo real
- Gestión completa de empresas cliente
- Administración de empleados y departamentos
- Módulo financiero con facturas y reportes
- Herramientas de IA para emails y chat
- Centro de reportes con gráficos
- Sistema de configuración avanzado

✅ **Seguridad y Autenticación**
- Sistema de login/logout
- Protección de rutas
- Gestión de sesiones localStorage
- Control de permisos por roles

✅ **Diseño Profesional**
- Interfaz moderna con Tailwind CSS
- Completamente responsive
- Optimizado para móviles y tablets
- Componentes reutilizables

✅ **Integración con Backend**
- Configurado para FastAPI
- Endpoints: /api/companies/, /api/employees/, /api/finance/, /api/ai/
- Estado de conexión en tiempo real
- Manejo robusto de errores

## 🔧 Configuración del Servidor Web

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📱 Compatibilidad

- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Dispositivos**: Desktop, Tablet, Mobile
- **Resoluciones**: 320px - 4K
- **Tecnologías**: HTML5, CSS3, JavaScript ES6+

## 🔗 URLs del Sistema

Una vez desplegado, las rutas disponibles serán:
- `/` - Página de inicio (redirige automáticamente)
- `/auth/login` - Página de login
- `/dashboard` - Panel principal
- `/companies` - Gestión de empresas
- `/employees` - Gestión de empleados
- `/finance` - Módulo financiero
- `/ai` - Herramientas de IA
- `/reports` - Centro de reportes
- `/settings` - Configuración

## 📞 Soporte Técnico

- **Repositorio**: https://github.com/widitektechnology/crm_ari
- **Documentación API**: https://crm.arifamilyassets.com/docs
- **Email**: admin@arifamilyassets.com

---

## 🚀 Instrucciones Rápidas de Despliegue

1. **Descargar**: Comprimir la carpeta `build` completa
2. **Subir**: Subir el contenido a tu servidor web
3. **Configurar**: Asegurar que el servidor redirija todas las rutas a `index.html`
4. **Probar**: Acceder a tu dominio y usar admin@crm.com / admin123

**¡Tu CRM estará listo para usar!**

---
**ARI Family Assets** - Sistema CRM v1.0.0 - Build Estático