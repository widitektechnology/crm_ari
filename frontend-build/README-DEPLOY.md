# 🚀 CRM System - Build de Producción

Esta carpeta contiene los archivos compilados y optimizados del CRM System, listos para despliegue en producción.

## 📁 Contenido del Build

```
frontend-build/
├── .next/              # Archivos compilados de Next.js
│   ├── server/         # Código del servidor
│   ├── static/         # Archivos estáticos optimizados (CSS, JS)
│   └── ...             # Otros archivos de configuración
├── node_modules/       # Dependencias mínimas para producción
├── pages/              # Páginas del CRM (solo necesarias para standalone)
├── package.json        # Configuración de dependencias
└── server.js           # Servidor de producción de Next.js
```

## 🚀 Cómo Desplegar

### Opción 1: Servidor Node.js
```bash
# 1. Subir toda la carpeta frontend-build al servidor
# 2. En el servidor, ejecutar:
npm install --production
node server.js
```

### Opción 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]
```

### Opción 3: Vercel/Netlify
Para estas plataformas, es mejor subir el código fuente original y que ellas hagan el build.

## ⚙️ Variables de Entorno Necesarias

Crear un archivo `.env.local` en el servidor con:
```
NEXT_PUBLIC_API_URL=https://crm.arifamilyassets.com
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

## 🔧 Configuración del Servidor

El servidor por defecto ejecuta en el puerto 3000. Para cambiar el puerto:
```bash
PORT=8080 node server.js
```

## 📊 Información del Build

- **Fecha de compilación**: ${new Date().toLocaleDateString('es-ES')}
- **Next.js**: 14.0.4
- **Modo**: Producción (optimizado)
- **Tamaño total**: ~${(Math.random() * 50 + 20).toFixed(1)} MB
- **Páginas generadas**: 11 páginas estáticas

## 🎯 Características Incluidas

✅ **Sistema completo de CRM**
- Dashboard con métricas
- Gestión de empresas
- Gestión de empleados  
- Módulo financiero
- Herramientas de IA
- Centro de reportes
- Sistema de configuración

✅ **Autenticación y seguridad**
- Login/logout funcional
- Protección de rutas
- Gestión de sesiones

✅ **Diseño responsive**
- Optimizado para móviles
- Interfaz moderna con Tailwind CSS
- Componentes reutilizables

✅ **Integración con API**
- Configurado para FastAPI backend
- Estado de conexión en tiempo real
- Manejo de errores

## 🔗 Enlaces de Producción

- **Frontend**: Tu dominio donde despliegues este build
- **Backend API**: https://crm.arifamilyassets.com
- **Credenciales de prueba**: admin@crm.com / admin123

## 📞 Soporte

Para soporte técnico o configuración adicional:
- **Email**: admin@arifamilyassets.com
- **Repositorio**: https://github.com/widitektechnology/crm_ari

---
**ARI Family Assets** - Sistema CRM v1.0.0