"""
Base Domain Entity
Provides common functionality for all domain entities
"""
from abc import ABC
from typing import Any, Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass, field
import uuid


@dataclass
class DomainEvent:
    """Base class for domain events"""
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    occurred_on: datetime = field(default_factory=datetime.now)
    aggregate_id: str = ""
    event_type: str = ""
    event_data: Dict[str, Any] = field(default_factory=dict)


class BaseEntity(ABC):
    """Base class for all domain entities implementing rich domain model pattern"""
    
    def __init__(self, id: Optional[int] = None):
        self.id = id
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self._domain_events: List[DomainEvent] = []
        self._is_dirty = False
    
    def mark_dirty(self):
        """Mark entity as modified"""
        self._is_dirty = True
        self.updated_at = datetime.now()
    
    def is_dirty(self) -> bool:
        """Check if entity has been modified"""
        return self._is_dirty
    
    def mark_clean(self):
        """Mark entity as clean (saved)"""
        self._is_dirty = False
    
    def add_domain_event(self, event: DomainEvent):
        """Add domain event to entity"""
        self._domain_events.append(event)
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Get all domain events"""
        return self._domain_events.copy()
    
    def clear_domain_events(self):
        """Clear all domain events"""
        self._domain_events.clear()
    
    def validate(self) -> List[str]:
        """Validate entity state and return list of validation errors"""
        errors = []
        # Base validation can be implemented here
        return errors
    
    def __eq__(self, other):
        if not isinstance(other, self.__class__):
            return False
        return self.id == other.id and self.id is not None
    
    def __hash__(self):
        return hash(self.id) if self.id else hash(id(self))