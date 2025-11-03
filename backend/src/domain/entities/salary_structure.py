"""
Salary Structure Entity - Configurable Salary Structures
Implements rich domain model for salary structure management
"""
from typing import List, Optional, Dict, Any
from enum import Enum
from decimal import Decimal
from .base_entity import BaseEntity, DomainEvent


class SalaryStructureType(Enum):
    EMPLOYEE = "employee"  # Empleado asalariado
    HOURLY = "hourly"      # Trabajador por horas


class SalaryStructureCreatedEvent(DomainEvent):
    """Event raised when a salary structure is created"""
    def __init__(self, structure_id: int, structure_name: str):
        super().__init__()
        self.aggregate_id = str(structure_id)
        self.event_type = "SalaryStructureCreated"
        self.event_data = {"structure_name": structure_name}


class SalaryStructure(BaseEntity):
    """
    Salary Structure aggregate root
    Manages salary structure configuration and rules
    """
    
    def __init__(self, 
                 company_id: int,
                 name: str,
                 structure_type: SalaryStructureType,
                 description: Optional[str] = None,
                 id: Optional[int] = None):
        super().__init__(id)
        self.company_id = company_id
        self.name = name
        self.type = structure_type
        self.description = description
        self.is_active = True
        self.salary_rules: List['SalaryRule'] = []
        
        # Domain event
        if id is None:
            self.add_domain_event(SalaryStructureCreatedEvent(self.id or 0, name))
    
    def add_salary_rule(self, salary_rule: 'SalaryRule'):
        """Add salary rule to structure"""
        if salary_rule not in self.salary_rules:
            self.salary_rules.append(salary_rule)
            self.mark_dirty()
    
    def remove_salary_rule(self, salary_rule: 'SalaryRule'):
        """Remove salary rule from structure"""
        if salary_rule in self.salary_rules:
            self.salary_rules.remove(salary_rule)
            self.mark_dirty()
    
    def get_active_rules(self) -> List['SalaryRule']:
        """Get all active salary rules ordered by sequence"""
        active_rules = [rule for rule in self.salary_rules if rule.is_active]
        return sorted(active_rules, key=lambda x: x.sequence)
    
    def activate(self):
        """Activate salary structure"""
        if not self.is_active:
            self.is_active = True
            self.mark_dirty()
    
    def deactivate(self):
        """Deactivate salary structure"""
        if self.is_active:
            self.is_active = False
            self.mark_dirty()
    
    def validate(self) -> List[str]:
        """Validate salary structure"""
        errors = super().validate()
        
        if not self.name or len(self.name.strip()) == 0:
            errors.append("Salary structure name is required")
        
        if self.company_id is None or self.company_id <= 0:
            errors.append("Valid company ID is required")
        
        # Validate rules
        rule_codes = []
        for rule in self.salary_rules:
            rule_errors = rule.validate()
            errors.extend([f"Rule '{rule.name}': {error}" for error in rule_errors])
            
            if rule.code in rule_codes:
                errors.append(f"Duplicate rule code: {rule.code}")
            rule_codes.append(rule.code)
        
        return errors


class ConditionType(Enum):
    NONE = "none"         # Always true
    RANGE = "range"       # Range condition
    PYTHON = "python"     # Python expression


class AmountType(Enum):
    FIX = "fix"           # Fixed amount
    PERCENTAGE = "percentage"  # Percentage
    PYTHON = "python"     # Python computation


class SalaryRule(BaseEntity):
    """
    Salary Rule entity
    Configurable rules for salary calculation
    """
    
    def __init__(self,
                 name: str,
                 code: str,
                 sequence: int = 100,
                 id: Optional[int] = None):
        super().__init__(id)
        self.name = name
        self.code = code
        self.sequence = sequence
        self.is_active = True
        
        # Condition configuration
        self.condition_select = ConditionType.NONE
        self.condition_range_min: Optional[Decimal] = None
        self.condition_range_max: Optional[Decimal] = None
        self.condition_python: Optional[str] = None
        
        # Amount configuration
        self.amount_select = AmountType.FIX
        self.amount_fix: Optional[Decimal] = None
        self.amount_percentage: Optional[Decimal] = None
        self.amount_python_compute: Optional[str] = None
    
    def set_condition_always_true(self):
        """Set condition to always true"""
        self.condition_select = ConditionType.NONE
        self.condition_range_min = None
        self.condition_range_max = None
        self.condition_python = None
        self.mark_dirty()
    
    def set_condition_range(self, min_value: Decimal, max_value: Decimal):
        """Set range condition"""
        if min_value > max_value:
            raise ValueError("Minimum value cannot be greater than maximum value")
        
        self.condition_select = ConditionType.RANGE
        self.condition_range_min = min_value
        self.condition_range_max = max_value
        self.condition_python = None
        self.mark_dirty()
    
    def set_condition_python(self, python_expression: str):
        """Set Python expression condition"""
        if not python_expression or len(python_expression.strip()) == 0:
            raise ValueError("Python expression cannot be empty")
        
        self.condition_select = ConditionType.PYTHON
        self.condition_python = python_expression
        self.condition_range_min = None
        self.condition_range_max = None
        self.mark_dirty()
    
    def set_amount_fixed(self, amount: Decimal):
        """Set fixed amount"""
        self.amount_select = AmountType.FIX
        self.amount_fix = amount
        self.amount_percentage = None
        self.amount_python_compute = None
        self.mark_dirty()
    
    def set_amount_percentage(self, percentage: Decimal):
        """Set percentage amount"""
        if percentage < 0 or percentage > 100:
            raise ValueError("Percentage must be between 0 and 100")
        
        self.amount_select = AmountType.PERCENTAGE
        self.amount_percentage = percentage
        self.amount_fix = None
        self.amount_python_compute = None
        self.mark_dirty()
    
    def set_amount_python(self, python_code: str):
        """Set Python computation amount"""
        if not python_code or len(python_code.strip()) == 0:
            raise ValueError("Python code cannot be empty")
        
        self.amount_select = AmountType.PYTHON
        self.amount_python_compute = python_code
        self.amount_fix = None
        self.amount_percentage = None
        self.mark_dirty()
    
    def evaluate_condition(self, context: Dict[str, Any]) -> bool:
        """Evaluate rule condition based on context"""
        if self.condition_select == ConditionType.NONE:
            return True
        elif self.condition_select == ConditionType.RANGE:
            if self.condition_range_min is None or self.condition_range_max is None:
                return False
            
            # Get the value to compare (e.g., base salary)
            compare_value = context.get('base_salary', Decimal('0'))
            return self.condition_range_min <= compare_value <= self.condition_range_max
        
        elif self.condition_select == ConditionType.PYTHON:
            if not self.condition_python:
                return False
            
            try:
                # Create safe evaluation context
                safe_dict = {
                    'employee': context.get('employee'),
                    'contract': context.get('contract'),
                    'payroll': context.get('payroll'),
                    'result': context.get('result', {}),
                    '__builtins__': {}
                }
                return bool(eval(self.condition_python, safe_dict))
            except Exception:
                return False
        
        return False
    
    def calculate_amount(self, context: Dict[str, Any]) -> Decimal:
        """Calculate rule amount based on context"""
        if self.amount_select == AmountType.FIX:
            return self.amount_fix or Decimal('0')
        
        elif self.amount_select == AmountType.PERCENTAGE:
            if self.amount_percentage is None:
                return Decimal('0')
            
            base_amount = context.get('base_salary', Decimal('0'))
            return base_amount * (self.amount_percentage / Decimal('100'))
        
        elif self.amount_select == AmountType.PYTHON:
            if not self.amount_python_compute:
                return Decimal('0')
            
            try:
                # Create safe evaluation context
                safe_dict = {
                    'employee': context.get('employee'),
                    'contract': context.get('contract'),
                    'payroll': context.get('payroll'),
                    'result': context.get('result', {}),
                    'Decimal': Decimal,
                    '__builtins__': {}
                }
                result = eval(self.amount_python_compute, safe_dict)
                return Decimal(str(result))
            except Exception:
                return Decimal('0')
        
        return Decimal('0')
    
    def validate(self) -> List[str]:
        """Validate salary rule"""
        errors = super().validate()
        
        if not self.name or len(self.name.strip()) == 0:
            errors.append("Rule name is required")
        
        if not self.code or len(self.code.strip()) == 0:
            errors.append("Rule code is required")
        
        # Validate condition configuration
        if self.condition_select == ConditionType.RANGE:
            if self.condition_range_min is None or self.condition_range_max is None:
                errors.append("Range condition requires both min and max values")
            elif self.condition_range_min > self.condition_range_max:
                errors.append("Range min cannot be greater than max")
        
        elif self.condition_select == ConditionType.PYTHON:
            if not self.condition_python or len(self.condition_python.strip()) == 0:
                errors.append("Python condition requires expression")
        
        # Validate amount configuration
        if self.amount_select == AmountType.FIX:
            if self.amount_fix is None:
                errors.append("Fixed amount configuration requires amount value")
        
        elif self.amount_select == AmountType.PERCENTAGE:
            if self.amount_percentage is None:
                errors.append("Percentage amount configuration requires percentage value")
            elif self.amount_percentage < 0 or self.amount_percentage > 100:
                errors.append("Percentage must be between 0 and 100")
        
        elif self.amount_select == AmountType.PYTHON:
            if not self.amount_python_compute or len(self.amount_python_compute.strip()) == 0:
                errors.append("Python amount configuration requires code")
        
        return errors