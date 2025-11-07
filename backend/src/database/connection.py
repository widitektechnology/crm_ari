"""
Database connection and configuration
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import logging
from ..config.settings import get_settings

logger = logging.getLogger(__name__)

# Global variables for lazy initialization
_engine = None
_SessionLocal = None

def get_engine():
    """Get or create SQLAlchemy engine (lazy initialization)"""
    global _engine
    if _engine is None:
        # Get settings fresh each time to ensure production config is applied
        settings = get_settings()
        logger.info(f"🔗 Creating database engine with connection string: {settings.database.connection_string}")
        _engine = create_engine(
            settings.database.connection_string,
            echo=settings.debug,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={
                "autocommit": False,
                "use_unicode": True,
                "charset": "utf8mb4"
            }
        )
    return _engine

def get_session_local():
    """Get or create session factory (lazy initialization)"""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

@contextmanager
def get_db_session():
    """Context manager para manejar sesiones de base de datos"""
    session_factory = get_session_local()
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        session.close()

def test_connection():
    """Probar la conexión a la base de datos"""
    try:
        with get_engine().connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def get_db():
    """Dependency para FastAPI"""
    session_factory = get_session_local()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()