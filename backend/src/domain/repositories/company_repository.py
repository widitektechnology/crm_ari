"""
Company Repository Interface
Defines contract for company data access
"""
from abc import abstractmethod
from typing import List, Optional
from .base_repository import BaseRepository
from ..entities.company import Company


class CompanyRepository(BaseRepository[Company]):
    """Repository interface for Company entities"""
    
    @abstractmethod
    async def find_by_tax_id(self, tax_id: str) -> Optional[Company]:
        """Find company by tax ID"""
        pass
    
    @abstractmethod
    async def find_by_name(self, name: str) -> Optional[Company]:
        """Find company by name"""
        pass
    
    @abstractmethod
    async def find_active_companies(self) -> List[Company]:
        """Find all active companies"""
        pass
    
    @abstractmethod
    async def find_by_country(self, country_code: str) -> List[Company]:
        """Find companies by country"""
        pass