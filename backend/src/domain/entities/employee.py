"""
Employee Entity - Rich Domain Model for HR/Payroll
Encapsulates employee data and business rules
"""
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime, date
from decimal import Decimal
from .base_entity import BaseEntity, DomainEvent


class EmployeeStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"


class EmployeeCreatedEvent(DomainEvent):
    """Event raised when an employee is created"""
    def __init__(self, employee_id: int, employee_code: str):
        super().__init__()
        self.aggregate_id = str(employee_id)
        self.event_type = "EmployeeCreated"
        self.event_data = {"employee_code": employee_code}


class Employee(BaseEntity):
    """
    Employee aggregate root implementing rich domain model
    Handles employee data and payroll-related business rules
    """
    
    def __init__(self, 
                 company_id: int,
                 employee_code: str,
                 first_name: str,
                 last_name: str,
                 email: str,
                 hire_date: date,
                 id: Optional[int] = None):
        super().__init__(id)
        self.company_id = company_id
        self.employee_code = employee_code
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.hire_date = hire_date
        self.status = EmployeeStatus.ACTIVE
        self.department: Optional[str] = None
        self.position: Optional[str] = None
        self.salary_structure_id: Optional[int] = None
        
        # Domain event
        if id is None:
            self.add_domain_event(EmployeeCreatedEvent(self.id or 0, employee_code))
    
    @property
    def full_name(self) -> str:
        """Get employee's full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def years_of_service(self) -> int:
        """Calculate years of service"""
        today = date.today()
        return today.year - self.hire_date.year - ((today.month, today.day) < (self.hire_date.month, self.hire_date.day))
    
    def assign_to_department(self, department: str):
        """Assign employee to department"""
        if department != self.department:
            self.department = department
            self.mark_dirty()
    
    def assign_position(self, position: str):
        """Assign employee position"""
        if position != self.position:
            self.position = position
            self.mark_dirty()
    
    def assign_salary_structure(self, salary_structure_id: int):
        """Assign salary structure to employee"""
        if salary_structure_id != self.salary_structure_id:
            self.salary_structure_id = salary_structure_id
            self.mark_dirty()
    
    def activate(self):
        """Activate employee"""
        if self.status != EmployeeStatus.ACTIVE:
            self.status = EmployeeStatus.ACTIVE
            self.mark_dirty()
    
    def deactivate(self):
        """Deactivate employee"""
        if self.status != EmployeeStatus.INACTIVE:
            self.status = EmployeeStatus.INACTIVE
            self.mark_dirty()
    
    def terminate(self):
        """Terminate employee"""
        if self.status != EmployeeStatus.TERMINATED:
            self.status = EmployeeStatus.TERMINATED
            self.mark_dirty()
    
    def is_active(self) -> bool:
        """Check if employee is active"""
        return self.status == EmployeeStatus.ACTIVE
    
    def validate(self) -> List[str]:
        """Validate employee entity"""
        errors = super().validate()
        
        if not self.employee_code or len(self.employee_code.strip()) == 0:
            errors.append("Employee code is required")
        
        if not self.first_name or len(self.first_name.strip()) == 0:
            errors.append("First name is required")
        
        if not self.last_name or len(self.last_name.strip()) == 0:
            errors.append("Last name is required")
        
        if not self.email or '@' not in self.email:
            errors.append("Valid email is required")
        
        if not self.hire_date:
            errors.append("Hire date is required")
        elif self.hire_date > date.today():
            errors.append("Hire date cannot be in the future")
        
        if self.company_id is None or self.company_id <= 0:
            errors.append("Valid company ID is required")
        
        return errors