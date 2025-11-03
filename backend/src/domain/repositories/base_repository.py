"""
Base Repository Interface
Defines the contract for all repositories following Repository pattern
"""
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from ..entities.base_entity import BaseEntity

T = TypeVar('T', bound=BaseEntity)


class BaseRepository(Generic[T], ABC):
    """
    Base repository interface implementing Repository pattern
    Centralizes data access and abstracts persistence from domain logic
    """
    
    @abstractmethod
    async def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID"""
        pass
    
    @abstractmethod
    async def get_all(self, filters: Optional[Dict[str, Any]] = None, 
                     limit: Optional[int] = None, 
                     offset: Optional[int] = None) -> List[T]:
        """Get all entities with optional filtering and pagination"""
        pass
    
    @abstractmethod
    async def add(self, entity: T) -> T:
        """Add new entity"""
        pass
    
    @abstractmethod
    async def update(self, entity: T) -> T:
        """Update existing entity"""
        pass
    
    @abstractmethod
    async def delete(self, entity: T) -> bool:
        """Delete entity"""
        pass
    
    @abstractmethod
    async def delete_by_id(self, id: int) -> bool:
        """Delete entity by ID"""
        pass
    
    @abstractmethod
    async def exists(self, id: int) -> bool:
        """Check if entity exists"""
        pass
    
    @abstractmethod
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count entities with optional filtering"""
        pass
    
    @abstractmethod
    async def find_by_criteria(self, criteria: Dict[str, Any]) -> List[T]:
        """Find entities by specific criteria"""
        pass