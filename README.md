# Sistema ERP Empresarial

## Descripción

Sistema de Planificación de Recursos Empresariales (ERP) modular, escalable y configurable, desarrollado con arquitectura empresarial moderna.

## Características Principales

### 🏗️ Arquitectura Empresarial
- **Domain Model**: Modelos de dominio ricos con lógica de negocio encapsulada
- **Repository Pattern**: Abstracción de acceso a datos
- **Unit of Work**: Gestión de transacciones y coordinación de cambios
- **Service Layer**: Orquestación de operaciones de negocio

### 🏢 Gestión Multi-Empresa
- Soporte para múltiples empresas en una sola instancia
- Configuración independiente por empresa
- Localización y parametrización avanzada

### 👥 Recursos Humanos y Nómina  
- Gestión completa de empleados
- Estructuras salariales configurables
- Cálculo automático de nómina
- Registro de tiempo y asistencia

### 💰 Finanzas y Facturación
- Facturación electrónica B2B
- Cumplimiento normativo
- Reportes financieros avanzados
- Gestión de pagos e impuestos

### 🤖 Inteligencia Artificial
- Clasificación automática de emails
- Agente conversacional para soporte
- Análisis predictivo de ingresos
- Procesamiento de documentos

### 🔗 Integraciones API
- Sistema flexible de integración con APIs externas
- Autenticación múltiple (Bearer, API Key, Basic Auth)
- Retry logic y handling de errores
- Monitoreo y métricas

## Estructura del Proyecto

```
crm_ari/
├── backend/                    # API Backend (Python/FastAPI)
│   ├── src/
│   │   ├── domain/            # Modelos de dominio
│   │   ├── infrastructure/    # Acceso a datos y servicios externos
│   │   ├── application/       # Servicios de aplicación
│   │   ├── ai/               # Módulos de IA
│   │   └── api/              # REST API endpoints
│   ├── main.py               # Punto de entrada
│   └── requirements.txt      # Dependencias Python
└── frontend/                  # Frontend (Next.js/React)
    ├── src/
    │   ├── app/              # App Router de Next.js
    │   ├── components/       # Componentes React
    │   ├── services/         # Servicios API
    │   ├── types/            # Definiciones TypeScript
    │   └── lib/              # Utilidades
    ├── package.json          # Dependencias Node.js
    └── tailwind.config.js    # Configuración Tailwind CSS
```

## Tecnologías Utilizadas

### Backend
- **Python 3.11+**: Lenguaje principal
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para base de datos
- **MySQL**: Base de datos relacional
- **Pydantic**: Validación de datos
- **scikit-learn**: Machine Learning
- **NLTK**: Procesamiento de lenguaje natural
- **httpx**: Cliente HTTP asíncrono

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework CSS utility-first
- **React Query**: Gestión de estado del servidor
- **Axios**: Cliente HTTP
- **Heroicons**: Iconografía
- **Recharts**: Gráficos y visualizaciones

### Base de Datos
- **MySQL 8.0+**: Base de datos principal
- **Redis** (opcional): Caché y sesiones

## Instalación y Configuración

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git

### Backend Setup

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/crm_ari.git
cd crm_ari/backend
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar base de datos**
```bash
# Crear base de datos MySQL
mysql -u root -p -e "CREATE DATABASE erp_system;"
mysql -u root -p -e "CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'your_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON erp_system.* TO 'erp_user'@'localhost';"
```

5. **Configurar variables de entorno**
```bash
# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones
```

6. **Ejecutar migraciones**
```bash
# Las tablas se crean automáticamente con SQLAlchemy
python -c "from src.infrastructure.database import init_db; init_db()"
```

7. **Iniciar servidor**
```bash
python main.py
# o usar uvicorn directamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Navegar al directorio frontend**
```bash
cd ../frontend
```

2. **Instalar dependencias**
```bash
npm install
# o usar yarn
yarn install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
# o usar yarn
yarn dev
```

El frontend estará disponible en `http://localhost:3000`

## API Documentation

La documentación interactiva de la API está disponible en:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Endpoints Principales

#### Empresas
- `GET /api/companies` - Lista de empresas
- `POST /api/companies` - Crear empresa
- `GET /api/companies/{id}` - Detalle de empresa
- `PUT /api/companies/{id}` - Actualizar empresa

#### Recursos Humanos
- `GET /api/payroll/employees` - Lista de empleados
- `POST /api/payroll/employees` - Crear empleado
- `GET /api/payroll/salary-structures` - Estructuras salariales
- `POST /api/payroll/calculate` - Calcular nómina

#### Finanzas
- `GET /api/finance/invoices` - Lista de facturas
- `POST /api/finance/invoices` - Crear factura
- `POST /api/finance/electronic-invoice` - Factura electrónica
- `GET /api/finance/reports/income` - Reporte de ingresos

#### Inteligencia Artificial
- `POST /api/ai/emails/classify` - Clasificar email
- `POST /api/ai/chat/message` - Mensaje al agente conversacional
- `GET /api/ai/chat/history/{session_id}` - Historial de chat

#### Integraciones
- `POST /api/external-api/execute` - Ejecutar petición personalizada
- `GET /api/external-api/integrations` - Lista de integraciones
- `POST /api/external-api/integrations` - Registrar integración

## Configuración de Producción

### Backend (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Vercel/Netlify)
```bash
npm run build
npm start
```

### Variables de Entorno de Producción

#### Backend (.env)
```env
DATABASE_URL=mysql://user:password@host:port/database
SECRET_KEY=your-secret-key
DEBUG=False
CORS_ORIGINS=https://your-frontend-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Licencia

Este proyecto está licenciado bajo la MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para soporte técnico o consultas:
- 📧 Email: dev@erp-sistema.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/crm_ari/issues)
- 📖 Documentación: [Wiki del proyecto](https://github.com/tu-usuario/crm_ari/wiki)

## Roadmap

### v1.1 (Próxima versión)
- [ ] Autenticación JWT completa
- [ ] Roles y permisos granulares
- [ ] Reportes avanzados con gráficos
- [ ] Notificaciones en tiempo real
- [ ] API móvil (React Native)

### v1.2 (Futuro)
- [ ] Integración con blockchain
- [ ] Machine Learning avanzado
- [ ] Soporte multi-idioma completo
- [ ] Workflows automatizados
- [ ] Marketplace de plugins

---

**Desarrollado con ❤️ para empresas modernas**