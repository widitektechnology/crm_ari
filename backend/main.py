"""
Main FastAPI Application
Entry point for the ERP system API
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging

# Import all routers
from src.api.routers import (
    companies,
    ai,
    payroll,
    finance,
    external_api
)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting ERP System API...")
    logger.info("Initializing database connections...")
    logger.info("Loading AI models...")
    logger.info("Setting up external integrations...")
    logger.info("ERP System API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ERP System API...")
    logger.info("Closing database connections...")
    logger.info("Cleaning up resources...")
    logger.info("ERP System API shut down successfully")


# Create FastAPI application
app = FastAPI(
    title="Sistema ERP Empresarial",
    description="""
    Sistema de Planificación de Recursos Empresariales (ERP) modular, escalable y configurable.
    
    ## Características principales:
    
    * **Arquitectura empresarial**: Implementa patrones Domain Model, Repository, Unit of Work y Service Layer
    * **Gestión de compañías**: Soporte multi-empresa con configuración independiente
    * **Recursos humanos**: Gestión completa de empleados, estructuras salariales y nómina
    * **Finanzas**: Facturación electrónica B2B, gestión contable y reportes financieros
    * **Inteligencia artificial**: Clasificación automática de emails y agente conversacional
    * **Integraciones**: Conectores API flexibles para sistemas externos
    
    ## Módulos disponibles:
    
    * **Companies**: Gestión de empresas y configuración multi-tenant
    * **AI**: Servicios de inteligencia artificial y automatización
    * **Payroll**: Nómina, estructura salarial y gestión de empleados
    * **Finance**: Facturación, contabilidad y reportes financieros
    * **External API**: Integraciones con APIs externas
    """,
    version="1.0.0",
    contact={
        "name": "Equipo de Desarrollo ERP",
        "email": "dev@erp-sistema.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://localhost:3001",  # Alternative port
        "https://erp-sistema.com",  # Production domain
        "https://*.erp-sistema.com",  # Subdomains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception in {request.method} {request.url}: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": getattr(request.state, "request_id", "unknown"),
            "path": str(request.url.path),
            "method": request.method
        }
    )


# Health check endpoint
@app.get("/health", tags=["Health"], summary="Health Check")
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {
        "status": "healthy",
        "service": "ERP System API",
        "version": "1.0.0",
        "timestamp": "2024-01-15T10:00:00Z"
    }


# API info endpoint
@app.get("/api/info", tags=["API Info"], summary="API Information")
async def api_info():
    """Get API information and available endpoints"""
    return {
        "name": "Sistema ERP Empresarial",
        "version": "1.0.0",
        "description": "Sistema de Planificación de Recursos Empresariales modular y escalable",
        "modules": {
            "companies": {
                "description": "Gestión de empresas y configuración multi-tenant",
                "endpoints": [
                    "GET /api/companies - Lista de empresas",
                    "POST /api/companies - Crear empresa",
                    "GET /api/companies/{id} - Detalle de empresa",
                    "PUT /api/companies/{id} - Actualizar empresa",
                    "DELETE /api/companies/{id} - Eliminar empresa"
                ]
            },
            "ai": {
                "description": "Servicios de inteligencia artificial y automatización",
                "endpoints": [
                    "POST /api/ai/emails/classify - Clasificar emails",
                    "POST /api/ai/chat/message - Mensaje al agente conversacional",
                    "GET /api/ai/chat/history/{session_id} - Historial de conversación"
                ]
            },
            "payroll": {
                "description": "Nómina, estructura salarial y gestión de empleados",
                "endpoints": [
                    "GET /api/payroll/employees - Lista de empleados",
                    "POST /api/payroll/employees - Crear empleado",
                    "GET /api/payroll/salary-structures - Estructuras salariales",
                    "POST /api/payroll/calculate - Calcular nómina"
                ]
            },
            "finance": {
                "description": "Facturación, contabilidad y reportes financieros",
                "endpoints": [
                    "GET /api/finance/invoices - Lista de facturas",
                    "POST /api/finance/invoices - Crear factura",
                    "GET /api/finance/reports/income - Reporte de ingresos",
                    "POST /api/finance/electronic-invoice - Factura electrónica"
                ]
            },
            "external_api": {
                "description": "Integraciones con APIs externas",
                "endpoints": [
                    "POST /api/external-api/execute - Ejecutar petición personalizada",
                    "GET /api/external-api/integrations - Lista de integraciones",
                    "POST /api/external-api/integrations - Registrar integración"
                ]
            }
        },
        "features": [
            "Arquitectura empresarial con patrones Domain Model, Repository, Unit of Work",
            "Soporte multi-empresa y multi-tenant",
            "Inteligencia artificial integrada",
            "Facturação eletrônica B2B",
            "Integraciones API flexibles",
            "Documentación automática con OpenAPI/Swagger"
        ]
    }


# Include routers with prefixes
app.include_router(
    companies.router,
    prefix="/api/companies",
    tags=["Companies"],
    responses={404: {"description": "Company not found"}}
)

app.include_router(
    ai.router,
    prefix="/api/ai",
    tags=["Artificial Intelligence"],
    responses={404: {"description": "AI service not found"}}
)

app.include_router(
    payroll.router,
    prefix="/api/payroll",
    tags=["Payroll & HR"],
    responses={404: {"description": "Payroll resource not found"}}
)

app.include_router(
    finance.router,
    prefix="/api/finance",
    tags=["Finance"],
    responses={404: {"description": "Finance resource not found"}}
)

app.include_router(
    external_api.router,
    prefix="/api/external-api",
    tags=["External API Integration"],
    responses={404: {"description": "Integration not found"}}
)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API overview"""
    return {
        "message": "¡Bienvenido al Sistema ERP Empresarial!",
        "description": "Sistema de Planificación de Recursos Empresariales modular y escalable",
        "version": "1.0.0",
        "documentation": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "api_info": "/api/info",
        "modules": {
            "companies": "/api/companies",
            "ai": "/api/ai", 
            "payroll": "/api/payroll",
            "finance": "/api/finance",
            "external_api": "/api/external-api"
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )