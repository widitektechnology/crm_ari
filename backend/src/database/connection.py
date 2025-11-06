"""
Database connection and configuration
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

# Configuración de la base de datos desde variables de entorno
class DatabaseConfig:
    def __init__(self):
        self.host = os.getenv("DB_HOST", "localhost")
        self.port = os.getenv("DB_PORT", "3306")
        self.username = os.getenv("DB_USERNAME", "root")
        self.password = os.getenv("DB_PASSWORD", "")
        self.database = os.getenv("DB_DATABASE", "crm_ari")
        self.charset = os.getenv("DB_CHARSET", "utf8mb4")
        
    @property
    def url(self):
        return f"mysql+mysqlconnector://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}?charset={self.charset}"

# Instancia global de configuración
db_config = DatabaseConfig()

# Crear engine de SQLAlchemy
engine = create_engine(
    db_config.url,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
    pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "autocommit": False,
        "use_unicode": True,
        "collation": "utf8mb4_unicode_ci"
    }
)

# Crear sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@contextmanager
def get_db_session():
    """Context manager para manejar sesiones de base de datos"""
    session = SessionLocal()
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
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def get_db():
    """Dependency para FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()