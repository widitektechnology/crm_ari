"""
Database Connection and Session Management
"""
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
import logging
from ...config.settings import get_settings

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
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=settings.debug  # Log SQL queries in debug mode
        )
    return _engine

def get_session_local():
    """Get or create session factory (lazy initialization)"""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

# Create base class for ORM models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()


def get_db_session() -> Generator[Session, None, None]:
    """
    Dependency function to get database session
    Used for dependency injection in FastAPI
    """
    session_factory = get_session_local()
    session = session_factory()
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()


def create_tables():
    """Create all tables in the database"""
    try:
        Base.metadata.create_all(bind=get_engine())
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise


def drop_tables():
    """Drop all tables in the database"""
    try:
        Base.metadata.drop_all(bind=get_engine())
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {str(e)}")
        raise