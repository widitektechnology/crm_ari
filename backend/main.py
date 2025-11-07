"""
Main FastAPI Application with Database Integration
Entry point for the CRM ARI system API
"""

from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from contextlib import asynccontextmanager
import uvicorn
import logging
import secrets
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database imports
from src.database.connection import test_connection, get_engine
from src.database.models import init_db, Base

# Services
from src.services.auth import AuthService, get_current_user

# Import all routers
from src.api.routers import (
    companies,
    ai,
    payroll,
    finance,
    external_api,
    mail
)

# Import new routers with database integration
from src.api.routers.auth import router as auth_router
from src.api.routers.users import router as users_router


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
    logger.info("🚀 Starting CRM ARI API Server...")
    
    # Test database connection
    logger.info("Testing database connection...")
    if not test_connection():
        logger.error("❌ Database connection failed!")
        raise Exception("Database connection failed")
    logger.info("✅ Database connection successful")
    
    # Initialize database
    logger.info("Initializing database...")
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=get_engine())
        
        # Initialize with default data
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    logger.info("Loading AI models...")
    logger.info("Setting up external integrations...")
    logger.info("📧 Mail endpoints enabled")
    logger.info("🔐 Authentication system enabled")
    logger.info("✅ CRM ARI API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CRM ARI API...")
    logger.info("Closing database connections...")
    logger.info("Cleaning up resources...")
    logger.info("✅ CRM ARI API shut down successfully")


# Security configuration for docs
security = HTTPBasic()

# Credentials for docs access
DOCS_USERNAME = "admin"
DOCS_PASSWORD = "crm2025@docs"

def get_current_docs_user(credentials: HTTPBasicCredentials = Depends(security)):
    """Authenticate user for docs access"""
    is_correct_username = secrets.compare_digest(credentials.username, DOCS_USERNAME)
    is_correct_password = secrets.compare_digest(credentials.password, DOCS_PASSWORD)
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials for documentation access",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Create FastAPI application
app = FastAPI(
    title="CRM ARI Family Assets",
    description="Sistema de gestión integral para ARI Family Assets con autenticación, correo electrónico y base de datos MySQL",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
    openapi_url=None  # Disable default openapi
)

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    
    openapi_schema = get_openapi(
        title="CRM ARI Family Assets API",
        version="2.0.0",
        description="Sistema de gestión integral con autenticación, correo electrónico y base de datos MySQL",
        routes=app.routes,
    )
    
    # Ensure OpenAPI version is set correctly
    openapi_schema["openapi"] = "3.0.2"
    
    # Add authentication schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        },
        "BasicAuth": {
            "type": "http",
            "scheme": "basic"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://crm.arifamilyassets.com").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "status_code": exc.status_code,
                "path": request.url.path
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error",
                "status_code": 500,
                "path": request.url.path
            }
        }
    )

# Custom middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    
    return response


# Health check endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "ok" if test_connection() else "error"
    return {
        "status": "ok",
        "service": "CRM ARI API",
        "version": "2.0.0",
        "database": db_status,
        "timestamp": "2025-11-06T14:00:00Z"
    }


# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(payroll.router, prefix="/api/payroll", tags=["payroll"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(external_api.router, prefix="/api/external", tags=["external"])
app.include_router(mail.router, prefix="/api/mail", tags=["mail"])


# Protected documentation endpoints
# Protected documentation endpoints
@app.get("/docs", include_in_schema=False)
async def get_documentation(username: str = Depends(get_current_docs_user)):
    """Protected Swagger UI documentation"""
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="CRM ARI API Docs",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png"
    )

@app.get("/redoc", include_in_schema=False)
async def get_redoc_documentation(username: str = Depends(get_current_docs_user)):
    """Protected ReDoc documentation"""
    from fastapi.openapi.docs import get_redoc_html
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="CRM ARI API Docs"
    )

@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_endpoint(username: str = Depends(get_current_docs_user)):
    """Protected OpenAPI schema"""
    return custom_openapi()

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CRM ARI Family Assets API",
        "version": "2.0.0",
        "status": "operational",
        "documentation": "/docs",
        "health": "/health"
    }





if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )