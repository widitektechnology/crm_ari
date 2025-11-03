"""
Unit of Work Pattern Implementation
Manages business transactions and coordinates changes to multiple aggregates
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Set, Optional, Any
from contextlib import asynccontextmanager
from ...domain.entities.base_entity import BaseEntity, DomainEvent
from ...domain.repositories.base_repository import BaseRepository


class UnitOfWork(ABC):
    """
    Unit of Work pattern implementation
    Coordinates changes to multiple entities and ensures transactional consistency
    """
    
    def __init__(self):
        self._new_entities: Set[BaseEntity] = set()
        self._dirty_entities: Set[BaseEntity] = set()
        self._removed_entities: Set[BaseEntity] = set()
        self._domain_events: List[DomainEvent] = []
        self._is_committed = False
    
    def register_new(self, entity: BaseEntity):
        """Register a new entity to be inserted"""
        if entity in self._removed_entities:
            self._removed_entities.remove(entity)
        else:
            self._new_entities.add(entity)
            self._collect_domain_events(entity)
    
    def register_dirty(self, entity: BaseEntity):
        """Register an entity to be updated"""
        if entity not in self._new_entities and entity not in self._removed_entities:
            self._dirty_entities.add(entity)
            self._collect_domain_events(entity)
    
    def register_removed(self, entity: BaseEntity):
        """Register an entity to be deleted"""
        if entity in self._new_entities:
            self._new_entities.remove(entity)
        else:
            self._dirty_entities.discard(entity)
            self._removed_entities.add(entity)
    
    def register_clean(self, entity: BaseEntity):
        """Register an entity as clean (no changes needed)"""
        entity.mark_clean()
    
    def _collect_domain_events(self, entity: BaseEntity):
        """Collect domain events from entity"""
        events = entity.get_domain_events()
        self._domain_events.extend(events)
        entity.clear_domain_events()
    
    @abstractmethod
    async def commit(self):
        """Commit all changes in a single transaction"""
        pass
    
    @abstractmethod
    async def rollback(self):
        """Rollback all changes"""
        pass
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Get all collected domain events"""
        return self._domain_events.copy()
    
    def clear_domain_events(self):
        """Clear all domain events"""
        self._domain_events.clear()
    
    @property
    def has_changes(self) -> bool:
        """Check if there are any pending changes"""
        return bool(self._new_entities or self._dirty_entities or self._removed_entities)
    
    @asynccontextmanager
    async def transaction(self):
        """Context manager for handling transactions"""
        try:
            yield self
            if self.has_changes:
                await self.commit()
        except Exception:
            await self.rollback()
            raise
        finally:
            self._cleanup()
    
    def _cleanup(self):
        """Clean up internal state after transaction"""
        self._new_entities.clear()
        self._dirty_entities.clear()
        self._removed_entities.clear()
        self.clear_domain_events()
        self._is_committed = False