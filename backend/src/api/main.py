"""
FastAPI Main Application
Entry point for the ERP system REST API
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

# Import routers
from .routers import companies, payroll, finance, ai, external_api, mail
from ..infrastructure.database.connection import create_tables, get_db_session
from ..config.settings import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting ERP System API")
    try:
        create_tables()
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ERP System API")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise Resource Planning System with AI capabilities",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for web and mobile app access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc) if settings.debug else "An error occurred"}
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "timestamp": "2024-01-01T00:00:00Z"  # Would use datetime.now() in real implementation
    }


# Include routers
app.include_router(companies.router, prefix="/api/v1/companies", tags=["Companies"])
app.include_router(payroll.router, prefix="/api/v1/payroll", tags=["Payroll"])
app.include_router(finance.router, prefix="/api/v1/finance", tags=["Finance"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(external_api.router, prefix="/api/v1/integrations", tags=["External APIs"])
# Mail router: expose under /api so that mail.router (which has prefix="/mail")
# becomes available at /api/mail/... and matches the frontend baseUrl (/api/mail)
app.include_router(mail.router, prefix="/api", tags=["Mail"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )