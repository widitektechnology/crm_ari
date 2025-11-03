"""
Companies API Router
REST API endpoints for company management
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime

# Pydantic models for request/response
class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Company name")
    tax_id: str = Field(..., min_length=5, max_length=50, description="Tax identification number")
    country_code: str = Field(..., min_length=2, max_length=2, description="ISO country code")
    currency: str = Field(..., min_length=3, max_length=3, description="ISO currency code")
    localization_config: Optional[Dict[str, Any]] = Field(None, description="Localization settings")


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    tax_id: Optional[str] = Field(None, min_length=5, max_length=50)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    localization_config: Optional[Dict[str, Any]] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    tax_id: str
    country_code: str
    currency: str
    status: str
    localization_config: Optional[Dict[str, Any]]
    tax_config: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


router = APIRouter()


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(company_data: CompanyCreate):
    """Create a new company"""
    try:
        # In a real implementation, this would use dependency injection
        # to get the company service and create the company
        
        # Simulate company creation
        company_response = CompanyResponse(
            id=1,
            name=company_data.name,
            tax_id=company_data.tax_id,
            country_code=company_data.country_code,
            currency=company_data.currency,
            status="active",
            localization_config=company_data.localization_config,
            tax_config={"iva_general": 21.0},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return company_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create company"
        )


@router.get("/", response_model=List[CompanyResponse])
async def get_companies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status_filter: Optional[str] = Query(None, description="Filter by company status"),
    country: Optional[str] = Query(None, description="Filter by country code")
):
    """Get list of companies with optional filtering"""
    try:
        # In a real implementation, this would query the database
        # through the company service
        
        # Simulate company list
        companies = [
            CompanyResponse(
                id=1,
                name="Empresa Ejemplo S.L.",
                tax_id="B12345678",
                country_code="ES",
                currency="EUR",
                status="active",
                localization_config={"date_format": "DD/MM/YYYY", "timezone": "Europe/Madrid"},
                tax_config={"iva_general": 21.0, "iva_reducido": 10.0},
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        ]
        
        return companies
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve companies"
        )


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: int):
    """Get company by ID"""
    try:
        # In a real implementation, this would use the company service
        if company_id != 1:  # Simulate not found
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        company = CompanyResponse(
            id=company_id,
            name="Empresa Ejemplo S.L.",
            tax_id="B12345678",
            country_code="ES",
            currency="EUR",
            status="active",
            localization_config={"date_format": "DD/MM/YYYY", "timezone": "Europe/Madrid"},
            tax_config={"iva_general": 21.0, "iva_reducido": 10.0},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return company
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve company"
        )


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(company_id: int, company_data: CompanyUpdate):
    """Update company information"""
    try:
        # In a real implementation, this would use the company service
        if company_id != 1:  # Simulate not found
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Simulate update
        updated_company = CompanyResponse(
            id=company_id,
            name=company_data.name or "Empresa Ejemplo S.L.",
            tax_id=company_data.tax_id or "B12345678",
            country_code=company_data.country_code or "ES",
            currency=company_data.currency or "EUR",
            status="active",
            localization_config=company_data.localization_config,
            tax_config={"iva_general": 21.0},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return updated_company
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update company"
        )


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(company_id: int):
    """Delete company"""
    try:
        # In a real implementation, this would use the company service
        if company_id != 1:  # Simulate not found
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Simulate deletion
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete company"
        )


@router.post("/{company_id}/activate", response_model=CompanyResponse)
async def activate_company(company_id: int):
    """Activate company"""
    try:
        # In a real implementation, this would use the company service
        if company_id != 1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        activated_company = CompanyResponse(
            id=company_id,
            name="Empresa Ejemplo S.L.",
            tax_id="B12345678",
            country_code="ES",
            currency="EUR",
            status="active",
            localization_config={"date_format": "DD/MM/YYYY"},
            tax_config={"iva_general": 21.0},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return activated_company
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate company"
        )


@router.post("/{company_id}/deactivate", response_model=CompanyResponse)
async def deactivate_company(company_id: int):
    """Deactivate company"""
    try:
        # In a real implementation, this would use the company service
        if company_id != 1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        deactivated_company = CompanyResponse(
            id=company_id,
            name="Empresa Ejemplo S.L.",
            tax_id="B12345678",
            country_code="ES",
            currency="EUR",
            status="inactive",
            localization_config={"date_format": "DD/MM/YYYY"},
            tax_config={"iva_general": 21.0},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return deactivated_company
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate company"
        )