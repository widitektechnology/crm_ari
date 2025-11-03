"""
Company Application Service
Manages company-related business operations
"""
from typing import List, Optional, Dict, Any
from .base_service import BaseApplicationService
from ..unit_of_work.base_unit_of_work import UnitOfWork
from ...domain.entities.company import Company, CompanyStatus
from ...domain.repositories.company_repository import CompanyRepository


class CompanyService(BaseApplicationService):
    """
    Application service for company management
    Implements Service Layer pattern for company operations
    """
    
    def __init__(self, unit_of_work: UnitOfWork, company_repository: CompanyRepository):
        super().__init__(unit_of_work)
        self.company_repo = company_repository
    
    async def create_company(self, 
                           name: str, 
                           tax_id: str, 
                           country_code: str, 
                           currency: str,
                           localization_config: Optional[Dict[str, Any]] = None) -> Company:
        """Create a new company"""
        
        # Business rule validation
        validation_errors = await self._validate_business_rules(
            name=name, tax_id=tax_id, country_code=country_code, currency=currency
        )
        
        if validation_errors:
            raise ValueError(f"Validation failed: {', '.join(validation_errors)}")
        
        async def _create_operation():
            # Check if company with same tax_id already exists
            existing_company = await self.company_repo.find_by_tax_id(tax_id)
            if existing_company:
                raise ValueError(f"Company with tax ID {tax_id} already exists")
            
            # Create new company
            company = Company(
                name=name,
                tax_id=tax_id,
                country_code=country_code,
                currency=currency
            )
            
            # Configure localization if provided
            if localization_config:
                company.configure_localization(localization_config)
            
            # Apply default tax configuration based on country
            default_tax_config = await self._get_default_tax_config(country_code)
            company.configure_tax_rules(default_tax_config)
            
            # Register with unit of work
            self.uow.register_new(company)
            
            return company
        
        return await self._execute_with_transaction(_create_operation)
    
    async def update_company(self, 
                           company_id: int, 
                           updates: Dict[str, Any]) -> Company:
        """Update existing company"""
        
        async def _update_operation():
            company = await self.company_repo.get_by_id(company_id)
            if not company:
                raise ValueError(f"Company with ID {company_id} not found")
            
            # Apply updates
            for key, value in updates.items():
                if hasattr(company, key):
                    setattr(company, key, value)
                    company.mark_dirty()
            
            # Validate after updates
            validation_errors = company.validate()
            if validation_errors:
                raise ValueError(f"Validation failed: {', '.join(validation_errors)}")
            
            self.uow.register_dirty(company)
            return company
        
        return await self._execute_with_transaction(_update_operation)
    
    async def get_company_by_id(self, company_id: int) -> Optional[Company]:
        """Get company by ID"""
        return await self.company_repo.get_by_id(company_id)
    
    async def get_active_companies(self) -> List[Company]:
        """Get all active companies"""
        return await self.company_repo.find_active_companies()
    
    async def deactivate_company(self, company_id: int) -> Company:
        """Deactivate a company"""
        
        async def _deactivate_operation():
            company = await self.company_repo.get_by_id(company_id)
            if not company:
                raise ValueError(f"Company with ID {company_id} not found")
            
            company.deactivate()
            self.uow.register_dirty(company)
            return company
        
        return await self._execute_with_transaction(_deactivate_operation)
    
    async def _validate_business_rules(self, **kwargs) -> List[str]:
        """Validate business rules for company operations"""
        errors = []
        
        name = kwargs.get('name')
        tax_id = kwargs.get('tax_id')
        country_code = kwargs.get('country_code')
        currency = kwargs.get('currency')
        
        if name and len(name.strip()) < 2:
            errors.append("Company name must be at least 2 characters long")
        
        if tax_id and len(tax_id.strip()) < 5:
            errors.append("Tax ID must be at least 5 characters long")
        
        if country_code and len(country_code) != 2:
            errors.append("Country code must be exactly 2 characters")
        
        if currency and len(currency) != 3:
            errors.append("Currency code must be exactly 3 characters")
        
        return errors
    
    async def _get_default_tax_config(self, country_code: str) -> Dict[str, Any]:
        """Get default tax configuration for country"""
        # This could be loaded from a configuration service or database
        default_configs = {
            'ES': {  # Spain
                'iva_general': 21.0,
                'iva_reducido': 10.0,
                'iva_superreducido': 4.0,
                'irpf': 15.0
            },
            'US': {  # United States
                'sales_tax': 8.25,
                'federal_tax': 21.0
            },
            'FR': {  # France
                'tva_normal': 20.0,
                'tva_intermediaire': 10.0,
                'tva_reduite': 5.5
            }
        }
        
        return default_configs.get(country_code, {})