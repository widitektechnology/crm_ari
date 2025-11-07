"""
Authentication service using database
"""

from jose import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
import bcrypt

from ..database.connection import get_db
from ..database.models import User, UserSession
import secrets

# Configuración
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
import bcrypt

# HTTP Bearer token
security = HTTPBearer()

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verificar contraseña"""
        try:
            password_bytes = plain_password.encode('utf-8')
            hash_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hash_bytes)
        except Exception:
            return False

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash de contraseña"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hash_bytes = bcrypt.hashpw(password_bytes, salt)
        return hash_bytes.decode('utf-8')

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Crear token JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str) -> Dict[str, Any]:
        """Decodificar token JWT"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Autenticar usuario"""
        user = db.query(User).filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            return None
        
        if not AuthService.verify_password(password, user.password_hash):
            return None
        
        # Actualizar último login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user

    @staticmethod
    def create_user_session(db: Session, user_id: int, ip_address: str = None, user_agent: str = None) -> str:
        """Crear sesión de usuario"""
        session_id = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        session = UserSession(
            id=session_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
        
        db.add(session)
        db.commit()
        
        return session_id

    @staticmethod
    def get_user_by_token(db: Session, token: str) -> Optional[User]:
        """Obtener usuario por token"""
        try:
            payload = AuthService.decode_access_token(token)
            user_id: int = payload.get("sub")
            if user_id is None:
                return None
        except HTTPException:
            return None

        user = db.query(User).filter(User.id == user_id).first()
        if user is None or not user.is_active:
            return None
        
        return user

    @staticmethod
    def logout_user(db: Session, session_id: str) -> bool:
        """Cerrar sesión de usuario"""
        session = db.query(UserSession).filter(UserSession.id == session_id).first()
        if session:
            session.is_active = False
            db.commit()
            return True
        return False


# Dependency para obtener el usuario actual
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency para obtener el usuario actual autenticado"""
    token = credentials.credentials
    user = AuthService.get_user_by_token(db, token)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency para obtener usuario activo"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency para obtener usuario admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


# Funciones de utilidad
def create_user(db: Session, username: str, email: str, password: str, 
                first_name: str, last_name: str, is_admin: bool = False) -> User:
    """Crear un nuevo usuario"""
    # Verificar que no existe el usuario
    existing_user = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Crear usuario
    hashed_password = AuthService.get_password_hash(password)
    user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        first_name=first_name,
        last_name=last_name,
        is_admin=is_admin
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


def update_user_password(db: Session, user_id: int, new_password: str) -> bool:
    """Actualizar contraseña de usuario"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    user.password_hash = AuthService.get_password_hash(new_password)
    db.commit()
    
    return True