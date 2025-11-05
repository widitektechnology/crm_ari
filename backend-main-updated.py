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
    external_api,
    mail  # ← NUEVO: Router de correo
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting CRM ARI API Server...")
    logger.info("📧 Mail endpoints enabled")  # ← NUEVO
    yield
    # Shutdown
    logger.info("⛔ Shutting down CRM ARI API Server...")

# Create FastAPI application
app = FastAPI(
    title="CRM ARI API",
    description="Complete ERP system with mail integration",  # ← ACTUALIZADO
    version="2.0.0",  # ← ACTUALIZADO
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(companies.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(payroll.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(external_api.router, prefix="/api")
app.include_router(mail.router, prefix="/api")  # ← NUEVO: Endpoints de correo

@app.get("/")
async def root():
    """Root endpoint with API overview"""
    return {
        "message": "🎯 CRM ARI API Server",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "👥 Companies Management",
            "💼 Payroll System", 
            "💰 Finance & Invoicing",
            "🤖 AI Email Classification",
            "🔗 External API Integrations",
            "📧 Real Mail IMAP/SMTP Support"  # ← NUEVO
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/api/health",
            "mail": "/api/mail/health"  # ← NUEVO
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CRM ARI API",
        "version": "2.0.0",
        "mail_support": True  # ← NUEVO
    }

@app.get("/api/info")
async def api_info():
    """API information endpoint"""
    return {
        "name": "CRM ARI API",
        "version": "2.0.0",
        "description": "Complete ERP system with mail integration",
        "modules": {
            "companies": "✅ Enabled",
            "payroll": "✅ Enabled", 
            "finance": "✅ Enabled",
            "ai": "✅ Enabled",
            "external_api": "✅ Enabled",
            "mail": "✅ Enabled - IMAP/SMTP Support"  # ← NUEVO
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if app.debug else "Something went wrong"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )