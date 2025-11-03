"""
Base Application Service
Defines common functionality for all application services (Service Layer pattern)
"""
from abc import ABC
from typing import List, Optional, Dict, Any
from ..unit_of_work.base_unit_of_work import UnitOfWork
from ...domain.entities.base_entity import DomainEvent
import logging

logger = logging.getLogger(__name__)


class BaseApplicationService(ABC):
    """
    Base class for application services implementing Service Layer pattern
    Coordinates business operations and manages transaction boundaries
    """
    
    def __init__(self, unit_of_work: UnitOfWork):
        self.uow = unit_of_work
    
    async def _handle_domain_events(self, events: List[DomainEvent]):
        """Handle domain events after successful transaction"""
        for event in events:
            logger.info(f"Domain event occurred: {event.event_type}", extra={
                'event_id': event.event_id,
                'aggregate_id': event.aggregate_id,
                'event_data': event.event_data
            })
            # Here you could implement event publishing to message brokers
            # await self._publish_event(event)
    
    async def _validate_business_rules(self, *args, **kwargs) -> List[str]:
        """Override in derived classes to implement business rule validation"""
        return []
    
    async def _execute_with_transaction(self, operation_func, *args, **kwargs):
        """Execute operation within a transaction and handle domain events"""
        async with self.uow.transaction():
            result = await operation_func(*args, **kwargs)
            
            # Collect and handle domain events
            events = self.uow.get_domain_events()
            if events:
                await self._handle_domain_events(events)
            
            return result