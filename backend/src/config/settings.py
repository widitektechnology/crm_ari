"""
ERP System - Configuration Module
Manages application configuration and environment variables
"""
import os
from typing import Optional, List
from pydantic import Field, ConfigDict, model_validator
from pydantic_settings import BaseSettings
from functools import lru_cache

# Importar configuración de producción
try:
    from .production_config import PRODUCTION_CONFIG
    USE_PRODUCTION_CONFIG = True
except ImportError:
    USE_PRODUCTION_CONFIG = False


class DatabaseSettings(BaseSettings):
    """Database configuration"""
    host: str = Field(default="localhost", env="DB_HOST")
    port: int = Field(default=3306, env="DB_PORT")
    username: str = Field(default="root", env="DB_USERNAME")
    password: str = Field(default="", env="DB_PASSWORD")
    database: str = Field(default="erp_system", env="DB_DATABASE")
    
    model_config = ConfigDict(extra="allow")
    
    @model_validator(mode='after')
    def apply_production_config(self):
        """Aplicar configuración de producción si es necesario"""
        if USE_PRODUCTION_CONFIG and os.environ.get("ENVIRONMENT") == "production":
            print("🔧 Aplicando configuración de producción para la base de datos...")
            prod_db = PRODUCTION_CONFIG['database']
            self.host = prod_db.HOST
            self.port = prod_db.PORT
            self.username = prod_db.USERNAME
            self.password = prod_db.PASSWORD
            self.database = prod_db.DATABASE
        return self
    
    @property
    def connection_string(self) -> str:
        return f"mysql+mysqlconnector://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"


class SecuritySettings(BaseSettings):
    """Security and authentication configuration"""
    secret_key: str = Field(default="your-secret-key-here", env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    model_config = ConfigDict(extra="allow")
    
    @model_validator(mode='after')
    def apply_production_config(self):
        """Aplicar configuración de producción si es necesario"""
        if USE_PRODUCTION_CONFIG and os.environ.get("ENVIRONMENT") == "production":
            print("🔧 Aplicando configuración de producción para seguridad...")
            prod_sec = PRODUCTION_CONFIG['security']
            self.secret_key = prod_sec.SECRET_KEY
            self.algorithm = prod_sec.JWT_ALGORITHM
            self.access_token_expire_minutes = prod_sec.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        return self
    
    
class ExternalAPISettings(BaseSettings):
    """External API configuration"""
    max_retries: int = Field(default=3, env="API_MAX_RETRIES")
    timeout_seconds: int = Field(default=30, env="API_TIMEOUT")
    backoff_factor: float = Field(default=1.0, env="API_BACKOFF_FACTOR")
    
    model_config = ConfigDict(extra="allow")


class AISettings(BaseSettings):
    """AI and ML configuration"""
    model_path: str = Field(default="./models", env="AI_MODEL_PATH")
    classification_threshold: float = Field(default=0.7, env="AI_CLASSIFICATION_THRESHOLD")
    agent_system_prompt: str = Field(
        default="Responde el correo en nombre de Joel Araujo, utiliza un lenguaje amigable y poco técnico",
        env="AI_AGENT_SYSTEM_PROMPT"
    )
    
    model_config = ConfigDict(extra="allow")


class Settings(BaseSettings):
    """Main application settings"""
    app_name: str = Field(default="ERP System", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=True, env="DEBUG")
    
    # Sub-configurations - se inicializarán directamente con las variables de entorno
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    security: SecuritySettings = Field(default_factory=SecuritySettings)
    external_api: ExternalAPISettings = Field(default_factory=ExternalAPISettings)
    ai: AISettings = Field(default_factory=AISettings)
    
    # Multi-company support
    default_company_id: Optional[int] = Field(default=None, env="DEFAULT_COMPANY_ID")
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow"  # Permite campos extra del archivo .env
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    print(f"🔍 ENVIRONMENT = {os.environ.get('ENVIRONMENT', 'NOT SET')}")
    print(f"🔍 USE_PRODUCTION_CONFIG = {USE_PRODUCTION_CONFIG}")
    return Settings()