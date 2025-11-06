"""
Database configuration and models for CRM ARI
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, Enum, JSON, ForeignKey, Index
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
import bcrypt

# Configuración de la base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+mysqlconnector://root:password@localhost/crm_ari"
)

# Crear engine de SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Crear sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# =====================================================
# MODELOS DE BASE DE DATOS
# =====================================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    avatar_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    companies = relationship("Company", back_populates="creator", foreign_keys="Company.created_by")
    employees = relationship("Employee", back_populates="creator")
    mail_accounts = relationship("MailAccount", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user")
    notes = relationship("Note", back_populates="user")
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    permissions = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class UserRole(Base):
    __tablename__ = "user_roles"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), primary_key=True)
    assigned_at = Column(DateTime, default=func.now())
    assigned_by = Column(Integer, ForeignKey("users.id"))


class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(String(255), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    legal_name = Column(String(200))
    tax_id = Column(String(50))
    industry = Column(String(100))
    website = Column(String(255))
    description = Column(Text)
    logo_url = Column(String(255))
    
    # Información de contacto
    email = Column(String(100))
    phone = Column(String(50))
    mobile = Column(String(50))
    fax = Column(String(50))
    
    # Dirección
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100), default="España")
    
    # Información financiera
    annual_revenue = Column(Decimal(15,2))
    employee_count = Column(Integer)
    
    # Metadatos
    status = Column(Enum('active', 'inactive', 'prospect', 'client'), default='prospect')
    priority = Column(Enum('low', 'medium', 'high', 'critical'), default='medium')
    source = Column(String(100))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    creator = relationship("User", back_populates="companies", foreign_keys=[created_by])
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="company")
    notes = relationship("Note", back_populates="company")


class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Información personal
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100))
    phone = Column(String(50))
    mobile = Column(String(50))
    
    # Información profesional
    job_title = Column(String(100))
    department = Column(String(100))
    employee_id = Column(String(50))
    hire_date = Column(DateTime)
    salary = Column(Decimal(10,2))
    
    # Dirección personal
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100), default="España")
    
    # Información adicional
    birth_date = Column(DateTime)
    avatar_url = Column(String(255))
    notes = Column(Text)
    
    # Estado
    status = Column(Enum('active', 'inactive', 'terminated'), default='active')
    
    # Metadatos
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    company = relationship("Company", back_populates="employees")
    creator = relationship("User", back_populates="employees")
    activities = relationship("Activity", back_populates="employee")
    notes = relationship("Note", back_populates="employee")


class MailAccount(Base):
    __tablename__ = "mail_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Información básica
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    provider = Column(String(50), default='imap')
    
    # Configuración IMAP
    imap_server = Column(String(200), nullable=False)
    imap_port = Column(Integer, nullable=False, default=993)
    imap_ssl = Column(Boolean, default=True)
    imap_username = Column(String(200), nullable=False)
    imap_password = Column(String(500), nullable=False)  # Encriptado
    
    # Configuración SMTP
    smtp_server = Column(String(200), nullable=False)
    smtp_port = Column(Integer, nullable=False, default=587)
    smtp_ssl = Column(Boolean, default=True)
    smtp_username = Column(String(200), nullable=False)
    smtp_password = Column(String(500), nullable=False)  # Encriptado
    
    # Estado y configuración
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    auto_sync = Column(Boolean, default=True)
    sync_interval = Column(Integer, default=15)
    
    # Estadísticas
    last_sync = Column(DateTime)
    unread_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    
    # Metadatos
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="mail_accounts")
    folders = relationship("MailFolder", back_populates="account", cascade="all, delete-orphan")
    messages = relationship("MailMessage", back_populates="account", cascade="all, delete-orphan")


class MailFolder(Base):
    __tablename__ = "mail_folders"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("mail_accounts.id"), nullable=False)
    
    # Información de la carpeta
    name = Column(String(200), nullable=False)
    display_name = Column(String(200), nullable=False)
    type = Column(Enum('inbox', 'sent', 'drafts', 'trash', 'spam', 'custom', 'archive'), default='custom')
    path = Column(String(500), nullable=False)
    parent_id = Column(Integer, ForeignKey("mail_folders.id"))
    
    # Atributos IMAP
    attributes = Column(JSON)
    
    # Configuración
    color = Column(String(7))
    icon = Column(String(50))
    is_selectable = Column(Boolean, default=True)
    auto_expunge = Column(Boolean, default=False)
    
    # Estadísticas
    unread_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    
    # Metadatos
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    account = relationship("MailAccount", back_populates="folders")
    messages = relationship("MailMessage", back_populates="folder")
    parent = relationship("MailFolder", remote_side=[id])


class MailMessage(Base):
    __tablename__ = "mail_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("mail_accounts.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("mail_folders.id"), nullable=False)
    
    # Identificadores únicos
    message_id = Column(String(500), nullable=False)
    uid = Column(String(100))
    thread_id = Column(String(100))
    
    # Headers principales
    subject = Column(Text)
    from_name = Column(String(200))
    from_email = Column(String(200), nullable=False)
    to_addresses = Column(JSON)
    cc_addresses = Column(JSON)
    bcc_addresses = Column(JSON)
    reply_to_email = Column(String(200))
    
    # Contenido
    body_text = Column(Text)
    body_html = Column(Text)
    snippet = Column(Text)
    
    # Estados y flags
    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Metadatos del mensaje
    size_bytes = Column(Integer, default=0)
    has_attachments = Column(Boolean, default=False)
    labels = Column(JSON)
    
    # Referencias para hilos
    in_reply_to = Column(String(500))
    references = Column(Text)
    
    # Fechas
    sent_at = Column(DateTime)
    received_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    account = relationship("MailAccount", back_populates="messages")
    folder = relationship("MailFolder", back_populates="messages")
    attachments = relationship("MailAttachment", back_populates="message", cascade="all, delete-orphan")


class MailAttachment(Base):
    __tablename__ = "mail_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("mail_messages.id"), nullable=False)
    
    # Información del archivo
    filename = Column(String(500), nullable=False)
    content_type = Column(String(200))
    content_id = Column(String(200))
    size_bytes = Column(Integer, default=0)
    
    # Almacenamiento
    file_path = Column(String(1000))
    is_inline = Column(Boolean, default=False)
    
    # Metadatos
    created_at = Column(DateTime, default=func.now())
    
    # Relaciones
    message = relationship("MailMessage", back_populates="attachments")


class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    company_id = Column(Integer, ForeignKey("companies.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Información básica
    type = Column(Enum('call', 'meeting', 'email', 'task', 'note', 'follow_up'), nullable=False)
    subject = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Estado y prioridad
    status = Column(Enum('planned', 'in_progress', 'completed', 'cancelled'), default='planned')
    priority = Column(Enum('low', 'medium', 'high', 'critical'), default='medium')
    
    # Fechas y tiempo
    scheduled_at = Column(DateTime)
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    duration_minutes = Column(Integer)
    
    # Ubicación
    location = Column(String(200))
    
    # Resultado
    outcome = Column(Text)
    next_action = Column(Text)
    
    # Metadatos
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    company = relationship("Company", back_populates="activities")
    employee = relationship("Employee", back_populates="activities")
    user = relationship("User", back_populates="activities")


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    company_id = Column(Integer, ForeignKey("companies.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Contenido
    title = Column(String(200))
    content = Column(Text, nullable=False)
    content_type = Column(Enum('text', 'markdown', 'html'), default='text')
    
    # Categorización
    category = Column(String(100))
    tags = Column(JSON)
    
    # Privacidad
    is_private = Column(Boolean, default=False)
    
    # Metadatos
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    company = relationship("Company", back_populates="notes")
    employee = relationship("Employee", back_populates="notes")
    user = relationship("User", back_populates="notes")


class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    key_name = Column(String(100), nullable=False)
    value = Column(JSON)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class UserSetting(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)
    key_name = Column(String(100), nullable=False)
    value = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Información de la acción
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer)
    
    # Detalles del cambio
    old_values = Column(JSON)
    new_values = Column(JSON)
    
    # Contexto
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Timestamp
    created_at = Column(DateTime, default=func.now())


# =====================================================
# FUNCIONES DE UTILIDAD
# =====================================================

def get_db():
    """Dependency para obtener la sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Crear todas las tablas"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")


def init_db():
    """Inicializar la base de datos con datos por defecto"""
    create_tables()
    
    db = SessionLocal()
    try:
        # Verificar si ya existe el usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            # Crear usuario admin
            admin_user = User(
                username="admin",
                email="admin@crm.arifamilyassets.com",
                password_hash=User.hash_password("admin123"),
                first_name="Administrador",
                last_name="Sistema",
                is_admin=True,
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Usuario administrador creado")
        
        # Verificar roles
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            roles = [
                Role(name="admin", description="Administrador del sistema", permissions=["*"]),
                Role(name="manager", description="Gerente con acceso completo", 
                     permissions=["companies.*", "employees.*", "activities.*", "notes.*", "mail.read"]),
                Role(name="user", description="Usuario estándar", 
                     permissions=["companies.read", "employees.read", "activities.*", "notes.*", "mail.*"]),
                Role(name="readonly", description="Solo lectura", 
                     permissions=["companies.read", "employees.read", "activities.read", "notes.read"])
            ]
            
            for role in roles:
                db.add(role)
            db.commit()
            print("✅ Roles creados")
        
        print("✅ Base de datos inicializada correctamente")
        
    except Exception as e:
        print(f"❌ Error inicializando la base de datos: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Inicializando base de datos CRM ARI...")
    init_db()