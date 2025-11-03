"""
MySQL Unit of Work Implementation
Concrete implementation using SQLAlchemy transactions
"""
from sqlalchemy.orm import Session
from ...application.unit_of_work.base_unit_of_work import UnitOfWork
from ...domain.repositories.company_repository import CompanyRepository
from .mysql_company_repository import MySQLCompanyRepository


class MySQLUnitOfWork(UnitOfWork):
    """
    MySQL implementation of Unit of Work pattern
    Manages database transactions using SQLAlchemy session
    """
    
    def __init__(self, session: Session):
        super().__init__()
        self.session = session
        
        # Initialize repositories
        self._company_repository = None
    
    @property
    def companies(self) -> CompanyRepository:
        """Get company repository"""
        if self._company_repository is None:
            self._company_repository = MySQLCompanyRepository(self.session)
        return self._company_repository
    
    async def commit(self):
        """Commit all changes in a single transaction"""
        try:
            # Process new entities
            for entity in self._new_entities:
                if hasattr(self, '_get_repository_for_entity'):
                    repo = self._get_repository_for_entity(entity)
                    await repo.add(entity)
            
            # Process dirty entities
            for entity in self._dirty_entities:
                if hasattr(self, '_get_repository_for_entity'):
                    repo = self._get_repository_for_entity(entity)
                    await repo.update(entity)
            
            # Process removed entities
            for entity in self._removed_entities:
                if hasattr(self, '_get_repository_for_entity'):
                    repo = self._get_repository_for_entity(entity)
                    await repo.delete(entity)
            
            # Commit the transaction
            self.session.commit()
            self._is_committed = True
            
            # Mark all entities as clean
            for entity in self._new_entities | self._dirty_entities:
                entity.mark_clean()
            
        except Exception as e:
            await self.rollback()
            raise e
    
    async def rollback(self):
        """Rollback all changes"""
        try:
            self.session.rollback()
        except Exception as e:
            # Log the rollback error but don't raise it
            # The original exception should be preserved
            pass
    
    def _get_repository_for_entity(self, entity):
        """Get appropriate repository for entity type"""
        from ...domain.entities.company import Company
        
        if isinstance(entity, Company):
            return self.companies
        
        raise ValueError(f"No repository found for entity type: {type(entity)}")
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.session.rollback()
        else:
            if self.has_changes and not self._is_committed:
                self.session.commit()
        self._cleanup()