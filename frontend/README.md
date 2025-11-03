# 🚀 CRM System - ARI Family Assets

Un sistema de gestión de relaciones con clientes (CRM) moderno y profesional construido con Next.js y FastAPI.

## 📋 Características Principales

### 🎯 Módulos del Sistema
- **Dashboard**: Panel de control con métricas y estadísticas en tiempo real
- **Gestión de Empresas**: CRUD completo para empresas cliente
- **Gestión de Empleados**: Administración de personal con análisis por departamentos
- **Módulo Financiero**: Gestión de facturas y análisis financiero
- **Herramientas IA**: Clasificación de emails y chat inteligente
- **Centro de Reportes**: Generación y gestión de reportes personalizados
- **Configuración**: Gestión de usuarios, permisos y configuración del sistema

### 🔐 Seguridad y Autenticación
- Sistema de login con validación
- Protección de rutas con middleware de autenticación
- Gestión de sesiones y logout
- Control de permisos por roles

### 🎨 Interfaz de Usuario
- Diseño responsive para dispositivos móviles, tabletas y desktop
- Interfaz moderna con Tailwind CSS
- Componentes reutilizables con Headless UI
- Iconografía consistente con Heroicons
- Sidebar navegable con estado activo
- Header con información del sistema y usuario

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework de React con Pages Router
- **React 18**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático (configurado)
- **Tailwind CSS**: Framework de estilos utilitarios
- **Headless UI**: Componentes de interfaz accesibles
- **Heroicons**: Biblioteca de iconos

### Backend (FastAPI)
- **FastAPI**: Framework web moderno para Python
- **Endpoints disponibles**:
  - `/api/companies/` - Gestión de empresas
  - `/api/payroll/employees` - Gestión de empleados
  - `/api/finance/` - Módulo financiero
  - `/api/ai/` - Herramientas de IA
  - `/health` - Estado del sistema

## 📁 Estructura del Proyecto

```
frontend/
├── components/
│   ├── layout/
│   │   ├── Layout.js         # Componente principal de layout
│   │   ├── Sidebar.js        # Navegación lateral
│   │   └── Header.js         # Cabecera con información del usuario
│   └── withAuth.js           # HOC para protección de rutas
├── pages/
│   ├── auth/
│   │   └── login.js          # Página de inicio de sesión
│   ├── dashboard/
│   │   └── index.js          # Panel principal del sistema
│   ├── companies/
│   │   └── index.js          # Gestión de empresas
│   ├── employees/
│   │   └── index.js          # Gestión de empleados
│   ├── finance/
│   │   └── index.js          # Módulo financiero
│   ├── ai/
│   │   └── index.js          # Herramientas de IA
│   ├── reports/
│   │   └── index.js          # Centro de reportes
│   ├── settings/
│   │   └── index.js          # Configuración del sistema
│   └── index.js              # Página de inicio con redirección
├── styles/
│   └── globals.css           # Estilos globales con Tailwind
├── package.json              # Dependencias y scripts
├── tailwind.config.js        # Configuración de Tailwind CSS
├── next.config.js            # Configuración de Next.js
└── README.md                 # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Backend FastAPI ejecutándose

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/usuario/crm_ari.git
cd crm_ari/frontend
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env.local
NEXT_PUBLIC_API_URL=https://crm.arifamilyassets.com
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🔑 Credenciales de Prueba

Para acceder al sistema en modo de desarrollo:
- **Email**: admin@crm.com
- **Contraseña**: admin123

## 📱 Funcionalidades por Módulo

### Dashboard
- Métricas en tiempo real del sistema
- Gráficos de ingresos y estadísticas
- Actividad reciente
- Acciones rápidas
- Estado de conexión con el backend

### Gestión de Empresas
- Listado completo de empresas cliente
- Formularios de creación y edición
- Estados: Activa, Inactiva, Pendiente
- Búsqueda y filtrado
- Estadísticas por estado

### Gestión de Empleados
- Administración completa de personal
- Información por departamentos
- Gestión de roles y cargos
- Estadísticas de distribución
- Formularios completos con validación

### Módulo Financiero
- Gestión de facturas y pagos
- Estados: Pendiente, Pagada, Vencida
- Análisis financiero con gráficos
- Resumen de ingresos y gastos
- Generación de reportes financieros

### Herramientas IA
- Clasificador de emails con probabilidades
- Chat inteligente con historial
- Análisis de performance de IA
- Métricas de uso y efectividad

### Centro de Reportes
- Generación de reportes por módulo
- Historial de reportes generados
- Reportes programados
- Visualización de datos con gráficos
- Exportación en múltiples formatos

### Configuración
- Gestión de perfil de usuario
- Configuración de notificaciones
- Ajustes del sistema (idioma, zona horaria)
- Configuración de seguridad
- Gestión de permisos y roles

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Formateo de código
npm run format
```

## 🌐 Integración con Backend

El frontend está configurado para integrarse con la API FastAPI:

- **Base URL**: Configurable mediante `NEXT_PUBLIC_API_URL`
- **Endpoints**: Mapeo completo con todas las rutas del backend
- **Estado de conexión**: Verificación automática del estado del backend
- **Manejo de errores**: Gestión de errores de red y respuestas de la API

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Estructura base del proyecto Next.js
- [x] Sistema de navegación completo
- [x] Dashboard con métricas y estadísticas
- [x] Módulo de gestión de empresas
- [x] Módulo de gestión de empleados  
- [x] Módulo financiero completo
- [x] Herramientas de IA
- [x] Centro de reportes
- [x] Sistema de configuración
- [x] Autenticación y protección de rutas
- [x] Diseño responsive completo
- [x] Integración con API preparada

### 🔄 Pendiente (Próximas versiones)
- [ ] Integración real con endpoints FastAPI
- [ ] Implementación de WebSockets para actualizaciones en tiempo real
- [ ] Sistema de notificaciones push
- [ ] Módulo de backup y restauración
- [ ] Optimización de performance
- [ ] Testing automatizado
- [ ] Internacionalización (i18n)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit los cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

**ARI Family Assets**
- Sistema desarrollado para gestión empresarial
- Contacto: admin@arifamilyassets.com

## 🔗 Enlaces Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Headless UI](https://headlessui.dev/)
- [Heroicons](https://heroicons.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024