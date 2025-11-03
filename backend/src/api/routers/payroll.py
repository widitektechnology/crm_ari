"""
Payroll API Router
REST API endpoints for payroll management
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, date
from decimal import Decimal

# Pydantic models
class EmployeeCreate(BaseModel):
    company_id: int
    employee_code: str = Field(..., min_length=1, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., description="Valid email address")
    hire_date: date
    department: Optional[str] = None
    position: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: int
    company_id: int
    employee_code: str
    first_name: str
    last_name: str
    email: str
    hire_date: date
    status: str
    department: Optional[str]
    position: Optional[str]
    created_at: datetime


class SalaryStructureCreate(BaseModel):
    company_id: int
    name: str = Field(..., min_length=1, max_length=255)
    structure_type: str = Field(..., description="employee or hourly")
    description: Optional[str] = None


class SalaryStructureResponse(BaseModel):
    id: int
    company_id: int
    name: str
    type: str
    description: Optional[str]
    is_active: bool
    created_at: datetime


class PayrollCalculationRequest(BaseModel):
    employee_id: int
    date_from: date
    date_to: date


class PayrollCalculationResponse(BaseModel):
    employee_id: int
    period_from: date
    period_to: date
    lines: List[Dict[str, Any]]
    total_amount: Decimal


router = APIRouter()


# Employee endpoints
@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee_data: EmployeeCreate):
    """Create a new employee"""
    try:
        # Simulate employee creation
        employee_response = EmployeeResponse(
            id=1,
            company_id=employee_data.company_id,
            employee_code=employee_data.employee_code,
            first_name=employee_data.first_name,
            last_name=employee_data.last_name,
            email=employee_data.email,
            hire_date=employee_data.hire_date,
            status="active",
            department=employee_data.department,
            position=employee_data.position,
            created_at=datetime.now()
        )
        
        return employee_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get employees with optional filtering"""
    # Simulate employee list
    employees = [
        EmployeeResponse(
            id=1,
            company_id=1,
            employee_code="EMP001",
            first_name="Juan",
            last_name="Pérez",
            email="juan.perez@company.com",
            hire_date=date(2023, 1, 15),
            status="active",
            department="IT",
            position="Developer",
            created_at=datetime.now()
        )
    ]
    
    return employees


# Salary Structure endpoints
@router.post("/salary-structures", response_model=SalaryStructureResponse, status_code=status.HTTP_201_CREATED)
async def create_salary_structure(structure_data: SalaryStructureCreate):
    """Create a new salary structure"""
    try:
        structure_response = SalaryStructureResponse(
            id=1,
            company_id=structure_data.company_id,
            name=structure_data.name,
            type=structure_data.structure_type,
            description=structure_data.description,
            is_active=True,
            created_at=datetime.now()
        )
        
        return structure_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/salary-structures", response_model=List[SalaryStructureResponse])
async def get_salary_structures(
    company_id: Optional[int] = Query(None, description="Filter by company ID")
):
    """Get salary structures"""
    structures = [
        SalaryStructureResponse(
            id=1,
            company_id=1,
            name="Estructura Empleados",
            type="employee",
            description="Estructura salarial para empleados a tiempo completo",
            is_active=True,
            created_at=datetime.now()
        )
    ]
    
    return structures


# Payroll calculation
@router.post("/calculate", response_model=PayrollCalculationResponse)
async def calculate_payroll(calculation_request: PayrollCalculationRequest):
    """Calculate payroll for an employee"""
    try:
        # Simulate payroll calculation
        payroll_result = PayrollCalculationResponse(
            employee_id=calculation_request.employee_id,
            period_from=calculation_request.date_from,
            period_to=calculation_request.date_to,
            lines=[
                {
                    "rule_code": "BASE",
                    "rule_name": "Salario Base",
                    "quantity": 1.0,
                    "rate": 3000.00,
                    "amount": 3000.00
                },
                {
                    "rule_code": "BONUS",
                    "rule_name": "Bonus Mensual",
                    "quantity": 1.0,
                    "rate": 300.00,
                    "amount": 300.00
                },
                {
                    "rule_code": "TAX",
                    "rule_name": "IRPF",
                    "quantity": 1.0,
                    "rate": -495.00,
                    "amount": -495.00
                }
            ],
            total_amount=Decimal("2805.00")
        )
        
        return payroll_result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )