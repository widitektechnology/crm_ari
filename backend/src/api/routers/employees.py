"""
Employees Router
Handles employee management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from ...infrastructure.database.connection import get_db_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/employees")

# Pydantic models for request/response
class EmployeeBase(BaseModel):
    name: str = Field(..., description="Employee full name")
    email: str = Field(..., description="Employee email address")
    phone: Optional[str] = Field(None, description="Employee phone number")
    position: str = Field(..., description="Employee position/title")
    department: Optional[str] = Field(None, description="Employee department")
    salary: Optional[float] = Field(None, description="Employee salary")
    hire_date: Optional[datetime] = Field(None, description="Employee hire date")
    is_active: bool = Field(True, description="Employee active status")

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[float] = None
    hire_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Mock data for demo purposes
MOCK_EMPLOYEES = [
    {
        "id": "emp_001",
        "name": "Juan Pérez",
        "email": "juan.perez@arifamilyassets.com",
        "phone": "+1234567890",
        "position": "Desarrollador Senior",
        "department": "Tecnología",
        "salary": 75000.0,
        "hire_date": "2023-01-15T00:00:00Z",
        "is_active": True,
        "created_at": "2023-01-15T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": "emp_002",
        "name": "María González",
        "email": "maria.gonzalez@arifamilyassets.com",
        "phone": "+1234567891",
        "position": "Gerente de Recursos Humanos",
        "department": "Recursos Humanos",
        "salary": 85000.0,
        "hire_date": "2022-06-01T00:00:00Z",
        "is_active": True,
        "created_at": "2022-06-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": "emp_003",
        "name": "Carlos López",
        "email": "carlos.lopez@arifamilyassets.com",
        "phone": "+1234567892",
        "position": "Analista Financiero",
        "department": "Finanzas",
        "salary": 65000.0,
        "hire_date": "2023-03-20T00:00:00Z",
        "is_active": True,
        "created_at": "2023-03-20T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": "emp_004",
        "name": "Ana Martínez",
        "email": "ana.martinez@arifamilyassets.com",
        "phone": "+1234567893",
        "position": "Diseñadora UX/UI",
        "department": "Diseño",
        "salary": 70000.0,
        "hire_date": "2023-07-10T00:00:00Z",
        "is_active": True,
        "created_at": "2023-07-10T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": "emp_005",
        "name": "Roberto Silva",
        "email": "roberto.silva@arifamilyassets.com",
        "phone": "+1234567894",
        "position": "Especialista en Marketing",
        "department": "Marketing",
        "salary": 60000.0,
        "hire_date": "2023-09-05T00:00:00Z",
        "is_active": False,
        "created_at": "2023-09-05T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
]

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db_session)
):
    """
    Get all employees with optional filtering
    """
    try:
        logger.info(f"Getting employees: skip={skip}, limit={limit}, active_only={active_only}")
        
        # Filter employees based on parameters
        employees = MOCK_EMPLOYEES.copy()
        
        if active_only:
            employees = [emp for emp in employees if emp.get("is_active", True)]
        
        # Apply pagination
        employees = employees[skip:skip + limit]
        
        logger.info(f"Returning {len(employees)} employees")
        return employees
        
    except Exception as e:
        logger.error(f"Error getting employees: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving employees: {str(e)}"
        )

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str,
    db: Session = Depends(get_db_session)
):
    """
    Get a specific employee by ID
    """
    try:
        logger.info(f"Getting employee: {employee_id}")
        
        # Find employee by ID
        employee = next((emp for emp in MOCK_EMPLOYEES if emp["id"] == employee_id), None)
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        return employee
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting employee {employee_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving employee: {str(e)}"
        )

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db_session)
):
    """
    Create a new employee
    """
    try:
        logger.info(f"Creating employee: {employee.name}")
        
        # Generate new ID
        new_id = f"emp_{len(MOCK_EMPLOYEES) + 1:03d}"
        current_time = datetime.now().isoformat() + "Z"
        
        new_employee = {
            "id": new_id,
            "name": employee.name,
            "email": employee.email,
            "phone": employee.phone,
            "position": employee.position,
            "department": employee.department,
            "salary": employee.salary,
            "hire_date": employee.hire_date.isoformat() + "Z" if employee.hire_date else current_time,
            "is_active": employee.is_active,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        MOCK_EMPLOYEES.append(new_employee)
        
        logger.info(f"Employee created with ID: {new_id}")
        return new_employee
        
    except Exception as e:
        logger.error(f"Error creating employee: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employee: {str(e)}"
        )

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db_session)
):
    """
    Update a specific employee
    """
    try:
        logger.info(f"Updating employee: {employee_id}")
        
        # Find employee by ID
        employee_index = next(
            (i for i, emp in enumerate(MOCK_EMPLOYEES) if emp["id"] == employee_id),
            None
        )
        
        if employee_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        # Update employee data
        employee = MOCK_EMPLOYEES[employee_index]
        update_data = employee_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if value is not None:
                if field == "hire_date" and isinstance(value, datetime):
                    employee[field] = value.isoformat() + "Z"
                else:
                    employee[field] = value
        
        employee["updated_at"] = datetime.now().isoformat() + "Z"
        
        logger.info(f"Employee {employee_id} updated successfully")
        return employee
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating employee {employee_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating employee: {str(e)}"
        )

@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db_session)
):
    """
    Delete a specific employee
    """
    try:
        logger.info(f"Deleting employee: {employee_id}")
        
        # Find employee by ID
        employee_index = next(
            (i for i, emp in enumerate(MOCK_EMPLOYEES) if emp["id"] == employee_id),
            None
        )
        
        if employee_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        # Remove employee
        deleted_employee = MOCK_EMPLOYEES.pop(employee_index)
        
        logger.info(f"Employee {employee_id} deleted successfully")
        return {
            "message": f"Employee {deleted_employee['name']} deleted successfully",
            "deleted_employee_id": employee_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting employee {employee_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting employee: {str(e)}"
        )

# Health check for employees module
@router.get("/health", include_in_schema=False)
async def employees_health():
    """Health check endpoint for employees module"""
    return {
        "status": "healthy",
        "module": "employees",
        "total_employees": len(MOCK_EMPLOYEES),
        "active_employees": len([emp for emp in MOCK_EMPLOYEES if emp.get("is_active", True)])
    }