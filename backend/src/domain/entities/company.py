"""
Company Entity - Multi-company support
Encapsulates company data and business rules
"""
from typing import Dict, Any, List, Optional
from enum import Enum
from decimal import Decimal
from .base_entity import BaseEntity, DomainEvent


class CompanyStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class CompanyCreatedEvent(DomainEvent):
    """Event raised when a company is created"""
    def __init__(self, company_id: int, company_name: str):
        super().__init__()
        self.aggregate_id = str(company_id)
        self.event_type = "CompanyCreated"
        self.event_data = {"company_name": company_name}


class Company(BaseEntity):
    """
    Company aggregate root implementing rich domain model
    Handles multi-company configuration and localization
    """
    
    def __init__(self, 
                 name: str,
                 tax_id: str,
                 country_code: str,
                 currency: str,
                 id: Optional[int] = None):
        super().__init__(id)
        self.name = name
        self.tax_id = tax_id
        self.country_code = country_code
        self.currency = currency
        self.status = CompanyStatus.ACTIVE
        self.localization_config: Dict[str, Any] = {}
        self.tax_config: Dict[str, Any] = {}
        
        # Domain event
        if id is None:  # New company
            self.add_domain_event(CompanyCreatedEvent(self.id or 0, name))
    
    def configure_localization(self, config: Dict[str, Any]):
        """Configure localization settings for the company"""
        required_keys = ['date_format', 'number_format', 'timezone']
        
        for key in required_keys:
            if key not in config:
                raise ValueError(f"Missing required localization config: {key}")
        
        self.localization_config = config
        self.mark_dirty()
    
    def configure_tax_rules(self, tax_rules: Dict[str, Any]):
        """Configure tax rules specific to the company's country/region"""
        self.tax_config = tax_rules
        self.mark_dirty()
    
    def get_tax_rate(self, tax_type: str) -> Decimal:
        """Get tax rate for specific tax type"""
        if tax_type not in self.tax_config:
            return Decimal('0.00')
        return Decimal(str(self.tax_config[tax_type]))
    
    def is_active(self) -> bool:
        """Check if company is active"""
        return self.status == CompanyStatus.ACTIVE
    
    def activate(self):
        """Activate the company"""
        if self.status != CompanyStatus.ACTIVE:
            self.status = CompanyStatus.ACTIVE
            self.mark_dirty()
    
    def deactivate(self):
        """Deactivate the company"""
        if self.status != CompanyStatus.INACTIVE:
            self.status = CompanyStatus.INACTIVE
            self.mark_dirty()
    
    def validate(self) -> List[str]:
        """Validate company entity"""
        errors = super().validate()
        
        if not self.name or len(self.name.strip()) == 0:
            errors.append("Company name is required")
        
        if not self.tax_id or len(self.tax_id.strip()) == 0:
            errors.append("Tax ID is required")
        
        if not self.country_code or len(self.country_code) != 2:
            errors.append("Valid 2-letter country code is required")
        
        if not self.currency or len(self.currency) != 3:
            errors.append("Valid 3-letter currency code is required")
        
        return errors