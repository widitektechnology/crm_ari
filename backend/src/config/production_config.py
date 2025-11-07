"""
Configuración de producción hardcoded para evitar problemas con variables de entorno
"""

class ProductionDatabaseConfig:
    """Configuración de base de datos para producción"""
    
    # Configuración para servidor Linux de producción
    HOST = "172.17.0.1"  # Gateway Docker IP
    PORT = 3306
    USERNAME = "crm_user"
    PASSWORD = "crm_password_secure_2025"
    DATABASE = "crm_ari"
    CHARSET = "utf8mb4"
    
    # Pool de conexiones
    POOL_SIZE = 10
    MAX_OVERFLOW = 20
    ECHO = False  # Cambiar a True para debug
    
    @classmethod
    def get_url(cls) -> str:
        """Genera la URL de conexión MySQL"""
        return f"mysql+mysqlconnector://{cls.USERNAME}:{cls.PASSWORD}@{cls.HOST}:{cls.PORT}/{cls.DATABASE}?charset={cls.CHARSET}"

class ProductionSecurityConfig:
    """Configuración de seguridad para producción"""
    
    SECRET_KEY = "crm-ari-super-secret-key-2025-production-ready"
    JWT_SECRET_KEY = "crm_ari_jwt_secret_key_2025_change_in_production"
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas
    BCRYPT_ROUNDS = 12

class ProductionAppConfig:
    """Configuración de aplicación para producción"""
    
    APP_NAME = "CRM ARI Family Assets"
    APP_VERSION = "2.0.0"
    DEBUG = False
    
    # CORS
    CORS_ORIGINS = [
        "https://crm.arifamilyassets.com",
        "http://localhost:3000"
    ]
    
    # API Externa
    EXTERNAL_API_TIMEOUT = 30
    EXTERNAL_API_MAX_RETRIES = 3
    EXTERNAL_API_RETRY_DELAY = 1
    
    # IA
    AI_MODEL_PATH = "/app/models"
    AI_CLASSIFICATION_THRESHOLD = 0.7
    AI_AGENT_SYSTEM_PROMPT = "Responde el correo en nombre de Joel Araujo, utiliza un lenguaje amigable y poco técnico"

# Configuración principal de producción
PRODUCTION_CONFIG = {
    'database': ProductionDatabaseConfig,
    'security': ProductionSecurityConfig,
    'app': ProductionAppConfig
}