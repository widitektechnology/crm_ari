"""
MySQL Company Repository Implementation
Concrete implementation of CompanyRepository using SQLAlchemy
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ...domain.repositories.company_repository import CompanyRepository
from ...domain.entities.company import Company, CompanyStatus
from ..database.models import CompanyModel


class MySQLCompanyRepository(CompanyRepository):
    """
    MySQL implementation of CompanyRepository
    Implements Repository pattern with SQLAlchemy ORM
    """
    
    def __init__(self, session: Session):
        self.session = session
    
    def _model_to_entity(self, model: CompanyModel) -> Company:
        """Convert database model to domain entity"""
        company = Company(
            name=model.name,
            tax_id=model.tax_id,
            country_code=model.country_code,
            currency=model.currency,
            id=model.id
        )
        
        company.status = CompanyStatus(model.status)
        if model.localization_config:
            company.localization_config = model.localization_config
        if model.tax_config:
            company.tax_config = model.tax_config
        
        company.created_at = model.created_at
        company.updated_at = model.updated_at
        company.mark_clean()  # Mark as clean since it's from database
        
        return company
    
    def _entity_to_model(self, entity: Company) -> CompanyModel:
        """Convert domain entity to database model"""
        model_data = {
            'name': entity.name,
            'tax_id': entity.tax_id,
            'country_code': entity.country_code,
            'currency': entity.currency,
            'status': entity.status.value,
            'localization_config': entity.localization_config,
            'tax_config': entity.tax_config
        }
        
        if entity.id:
            model_data['id'] = entity.id
            
        return CompanyModel(**model_data)
    
    async def get_by_id(self, id: int) -> Optional[Company]:
        """Get company by ID"""
        try:
            model = self.session.query(CompanyModel).filter(CompanyModel.id == id).first()
            return self._model_to_entity(model) if model else None
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def get_all(self, filters: Optional[Dict[str, Any]] = None, 
                     limit: Optional[int] = None, 
                     offset: Optional[int] = None) -> List[Company]:
        """Get all companies with optional filtering and pagination"""
        try:
            query = self.session.query(CompanyModel)
            
            # Apply filters
            if filters:
                if 'status' in filters:
                    query = query.filter(CompanyModel.status == filters['status'])
                if 'country_code' in filters:
                    query = query.filter(CompanyModel.country_code == filters['country_code'])
                if 'name_like' in filters:
                    query = query.filter(CompanyModel.name.like(f"%{filters['name_like']}%"))
            
            # Apply pagination
            if offset:
                query = query.offset(offset)
            if limit:
                query = query.limit(limit)
            
            models = query.all()
            return [self._model_to_entity(model) for model in models]
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def add(self, entity: Company) -> Company:
        """Add new company"""
        try:
            model = self._entity_to_model(entity)
            self.session.add(model)
            self.session.flush()  # Get the ID without committing
            
            # Update entity with generated ID
            entity.id = model.id
            entity.mark_clean()
            
            return entity
        except IntegrityError as e:
            self.session.rollback()
            raise ValueError(f"Company with tax ID {entity.tax_id} already exists")
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def update(self, entity: Company) -> Company:
        """Update existing company"""
        try:
            if not entity.id:
                raise ValueError("Cannot update company without ID")
            
            model = self.session.query(CompanyModel).filter(CompanyModel.id == entity.id).first()
            if not model:
                raise ValueError(f"Company with ID {entity.id} not found")
            
            # Update model fields
            model.name = entity.name
            model.tax_id = entity.tax_id
            model.country_code = entity.country_code
            model.currency = entity.currency
            model.status = entity.status.value
            model.localization_config = entity.localization_config
            model.tax_config = entity.tax_config
            
            self.session.flush()
            entity.mark_clean()
            
            return entity
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def delete(self, entity: Company) -> bool:
        """Delete company"""
        try:
            if not entity.id:
                return False
            
            model = self.session.query(CompanyModel).filter(CompanyModel.id == entity.id).first()
            if model:
                self.session.delete(model)
                self.session.flush()
                return True
            return False
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def delete_by_id(self, id: int) -> bool:
        """Delete company by ID"""
        try:
            model = self.session.query(CompanyModel).filter(CompanyModel.id == id).first()
            if model:
                self.session.delete(model)
                self.session.flush()
                return True
            return False
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def exists(self, id: int) -> bool:
        """Check if company exists"""
        try:
            return self.session.query(CompanyModel).filter(CompanyModel.id == id).first() is not None
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count companies with optional filtering"""
        try:
            query = self.session.query(CompanyModel)
            
            if filters:
                if 'status' in filters:
                    query = query.filter(CompanyModel.status == filters['status'])
                if 'country_code' in filters:
                    query = query.filter(CompanyModel.country_code == filters['country_code'])
            
            return query.count()
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def find_by_criteria(self, criteria: Dict[str, Any]) -> List[Company]:
        """Find companies by specific criteria"""
        return await self.get_all(filters=criteria)
    
    async def find_by_tax_id(self, tax_id: str) -> Optional[Company]:
        """Find company by tax ID"""
        try:
            model = self.session.query(CompanyModel).filter(CompanyModel.tax_id == tax_id).first()
            return self._model_to_entity(model) if model else None
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def find_by_name(self, name: str) -> Optional[Company]:
        """Find company by name"""
        try:
            model = self.session.query(CompanyModel).filter(CompanyModel.name == name).first()
            return self._model_to_entity(model) if model else None
        except Exception as e:
            self.session.rollback()
            raise e
    
    async def find_active_companies(self) -> List[Company]:
        """Find all active companies"""
        return await self.get_all(filters={'status': 'active'})
    
    async def find_by_country(self, country_code: str) -> List[Company]:
        """Find companies by country"""
        return await self.get_all(filters={'country_code': country_code})