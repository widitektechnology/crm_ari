"""
Users management router
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from ...database.connection import get_db
from ...database.models import User
from ...services.auth import get_current_user, get_current_admin_user, create_user, update_user_password

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_admin: bool
    last_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserList(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    size: int

# Users endpoints
@router.get("/", response_model=UserList)
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users (admin only)"""
    query = db.query(User)
    
    if active_only:
        query = query.filter(User.is_active == True)
    
    if search:
        search_filter = or_(
            User.username.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.first_name.ilike(f"%{search}%"),
            User.last_name.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    total = query.count()
    users = query.offset((page - 1) * size).limit(size).all()
    
    return UserList(
        users=[UserResponse.from_orm(user) for user in users],
        total=total,
        page=page,
        size=size
    )

@router.post("/", response_model=UserResponse)
async def create_new_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create new user (admin only)"""
    try:
        user = create_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_admin=user_data.is_admin
        )
        return UserResponse.from_orm(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    # Users can only see their own profile unless they're admin
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.from_orm(user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user"""
    # Users can only update their own profile unless they're admin
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this user"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    
    # Non-admin users cannot change admin status
    if not current_user.is_admin and "is_admin" in update_data:
        del update_data["is_admin"]
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    try:
        db.commit()
        db.refresh(user)
        return UserResponse.from_orm(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user"
        )

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot delete yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting user"
        )

@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Deactivate user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot deactivate yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.post("/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Activate user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change current user password"""
    from ...services.auth import AuthService
    
    # Verify current password
    if not AuthService.verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    success = update_user_password(db, current_user.id, password_data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating password"
        )
    
    return {"message": "Password updated successfully"}

@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user statistics"""
    # Users can only see their own stats unless they're admin
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user's stats"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get statistics
    stats = {
        "companies_created": len(user.companies),
        "employees_created": len(user.employees),
        "mail_accounts": len(user.mail_accounts),
        "activities": len(user.activities),
        "notes": len(user.notes),
        "last_login": user.last_login,
        "account_created": user.created_at
    }
    
    return stats