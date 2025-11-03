"""
Payroll Application Service
Manages payroll-related business operations
"""
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, date
from .base_service import BaseApplicationService
from ..unit_of_work.base_unit_of_work import UnitOfWork
from ...domain.entities.employee import Employee, EmployeeStatus
from ...domain.entities.salary_structure import SalaryStructure, SalaryRule, SalaryStructureType
from ...domain.entities.work_entry import WorkEntry, WorkEntryType, WorkSchedule, RoundingType


class PayrollService(BaseApplicationService):
    """
    Application service for payroll management
    Implements Service Layer pattern for HR/Payroll operations
    """
    
    def __init__(self, unit_of_work: UnitOfWork):
        super().__init__(unit_of_work)
        # Repositories will be accessed through unit_of_work
    
    # Employee Management
    async def create_employee(self,
                            company_id: int,
                            employee_code: str,
                            first_name: str,
                            last_name: str,
                            email: str,
                            hire_date: date,
                            department: Optional[str] = None,
                            position: Optional[str] = None) -> Employee:
        """Create a new employee"""
        
        validation_errors = await self._validate_employee_creation(
            company_id, employee_code, email
        )
        
        if validation_errors:
            raise ValueError(f"Validation failed: {', '.join(validation_errors)}")
        
        async def _create_operation():
            employee = Employee(
                company_id=company_id,
                employee_code=employee_code,
                first_name=first_name,
                last_name=last_name,
                email=email,
                hire_date=hire_date
            )
            
            if department:
                employee.assign_to_department(department)
            
            if position:
                employee.assign_position(position)
            
            self.uow.register_new(employee)
            return employee
        
        return await self._execute_with_transaction(_create_operation)
    
    # Salary Structure Management
    async def create_salary_structure(self,
                                    company_id: int,
                                    name: str,
                                    structure_type: SalaryStructureType,
                                    description: Optional[str] = None) -> SalaryStructure:
        """Create a new salary structure"""
        
        async def _create_operation():
            salary_structure = SalaryStructure(
                company_id=company_id,
                name=name,
                structure_type=structure_type,
                description=description
            )
            
            self.uow.register_new(salary_structure)
            return salary_structure
        
        return await self._execute_with_transaction(_create_operation)
    
    async def add_salary_rule_to_structure(self,
                                         structure_id: int,
                                         rule_name: str,
                                         rule_code: str,
                                         sequence: int = 100) -> SalaryRule:
        """Add a salary rule to a salary structure"""
        
        async def _add_rule_operation():
            # In a real implementation, you would fetch the structure from repository
            # structure = await self.uow.salary_structures.get_by_id(structure_id)
            
            salary_rule = SalaryRule(
                name=rule_name,
                code=rule_code,
                sequence=sequence
            )
            
            # structure.add_salary_rule(salary_rule)
            # self.uow.register_dirty(structure)
            self.uow.register_new(salary_rule)
            
            return salary_rule
        
        return await self._execute_with_transaction(_add_rule_operation)
    
    async def configure_salary_rule(self,
                                  rule_id: int,
                                  condition_config: Dict[str, Any],
                                  amount_config: Dict[str, Any]) -> SalaryRule:
        """Configure salary rule conditions and amounts"""
        
        async def _configure_operation():
            # In a real implementation, fetch rule from repository
            # rule = await self.uow.salary_rules.get_by_id(rule_id)
            
            # This is a simplified example
            rule = SalaryRule(name="Example Rule", code="EXAMPLE")
            
            # Configure condition
            condition_type = condition_config.get('type')
            if condition_type == 'none':
                rule.set_condition_always_true()
            elif condition_type == 'range':
                rule.set_condition_range(
                    Decimal(str(condition_config['min'])),
                    Decimal(str(condition_config['max']))
                )
            elif condition_type == 'python':
                rule.set_condition_python(condition_config['expression'])
            
            # Configure amount
            amount_type = amount_config.get('type')
            if amount_type == 'fixed':
                rule.set_amount_fixed(Decimal(str(amount_config['amount'])))
            elif amount_type == 'percentage':
                rule.set_amount_percentage(Decimal(str(amount_config['percentage'])))
            elif amount_type == 'python':
                rule.set_amount_python(amount_config['code'])
            
            self.uow.register_dirty(rule)
            return rule
        
        return await self._execute_with_transaction(_configure_operation)
    
    # Work Entry Management
    async def create_work_entry_type(self,
                                   company_id: int,
                                   name: str,
                                   code: str,
                                   payroll_code: Optional[str] = None,
                                   external_code: Optional[str] = None,
                                   is_leave: bool = False) -> WorkEntryType:
        """Create a work entry type"""
        
        async def _create_operation():
            work_entry_type = WorkEntryType(
                company_id=company_id,
                name=name,
                code=code
            )
            
            if payroll_code:
                work_entry_type.set_payroll_code(payroll_code)
            
            if external_code:
                work_entry_type.set_external_code(external_code)
            
            if is_leave:
                work_entry_type.mark_as_leave()
            
            self.uow.register_new(work_entry_type)
            return work_entry_type
        
        return await self._execute_with_transaction(_create_operation)
    
    async def create_work_entry(self,
                              employee_id: int,
                              work_entry_type_id: int,
                              date_start: datetime,
                              date_stop: datetime,
                              description: Optional[str] = None) -> WorkEntry:
        """Create a work entry for an employee"""
        
        async def _create_operation():
            work_entry = WorkEntry(
                employee_id=employee_id,
                work_entry_type_id=work_entry_type_id,
                date_start=date_start,
                date_stop=date_stop
            )
            
            if description:
                work_entry.set_description(description)
            
            self.uow.register_new(work_entry)
            return work_entry
        
        return await self._execute_with_transaction(_create_operation)
    
    # Work Schedule Management
    async def create_work_schedule(self,
                                 company_id: int,
                                 name: str,
                                 full_time_hours: Decimal = Decimal('40.00'),
                                 average_hours_per_day: Decimal = Decimal('8.00'),
                                 rounding_type: RoundingType = RoundingType.NONE) -> WorkSchedule:
        """Create a work schedule"""
        
        async def _create_operation():
            work_schedule = WorkSchedule(
                company_id=company_id,
                name=name
            )
            
            work_schedule.set_full_time_hours(full_time_hours)
            work_schedule.set_average_hours_per_day(average_hours_per_day)
            work_schedule.set_rounding_type(rounding_type)
            
            self.uow.register_new(work_schedule)
            return work_schedule
        
        return await self._execute_with_transaction(_create_operation)
    
    async def configure_work_schedule_days(self,
                                         schedule_id: int,
                                         working_days_config: Dict[int, Dict[str, Any]]) -> WorkSchedule:
        """Configure working days for a work schedule"""
        
        async def _configure_operation():
            # In a real implementation, fetch schedule from repository
            # schedule = await self.uow.work_schedules.get_by_id(schedule_id)
            
            schedule = WorkSchedule(company_id=1, name="Example Schedule")
            
            for day_of_week, config in working_days_config.items():
                schedule.set_working_day(
                    day_of_week=day_of_week,
                    is_working=config['is_working'],
                    hours=Decimal(str(config.get('hours', '0.00')))
                )
            
            self.uow.register_dirty(schedule)
            return schedule
        
        return await self._execute_with_transaction(_configure_operation)
    
    # Payroll Calculation Engine
    async def calculate_payroll(self,
                              employee_id: int,
                              date_from: date,
                              date_to: date) -> Dict[str, Any]:
        """Calculate payroll for an employee for a specific period"""
        
        async def _calculate_operation():
            # In a real implementation, you would:
            # 1. Fetch employee and salary structure
            # 2. Fetch work entries for the period
            # 3. Apply salary rules in sequence
            # 4. Calculate totals
            
            # Simplified calculation example
            payroll_result = {
                'employee_id': employee_id,
                'period_from': date_from,
                'period_to': date_to,
                'lines': [],
                'total_amount': Decimal('0.00')
            }
            
            # Example payroll lines
            base_salary_line = {
                'rule_code': 'BASE',
                'rule_name': 'Base Salary',
                'quantity': Decimal('1.00'),
                'rate': Decimal('3000.00'),
                'amount': Decimal('3000.00')
            }
            
            bonus_line = {
                'rule_code': 'BONUS',
                'rule_name': 'Monthly Bonus',
                'quantity': Decimal('1.00'),
                'rate': Decimal('300.00'),
                'amount': Decimal('300.00')
            }
            
            tax_line = {
                'rule_code': 'TAX',
                'rule_name': 'Income Tax',
                'quantity': Decimal('1.00'),
                'rate': Decimal('-495.00'),  # 15% of 3300
                'amount': Decimal('-495.00')
            }
            
            payroll_result['lines'] = [base_salary_line, bonus_line, tax_line]
            payroll_result['total_amount'] = Decimal('2805.00')  # 3000 + 300 - 495
            
            return payroll_result
        
        return await self._execute_with_transaction(_calculate_operation)
    
    # Validation Methods
    async def _validate_employee_creation(self,
                                        company_id: int,
                                        employee_code: str,
                                        email: str) -> List[str]:
        """Validate employee creation parameters"""
        errors = []
        
        # In a real implementation, you would check for existing employees
        # existing_employee = await self.uow.employees.find_by_code(employee_code)
        # if existing_employee:
        #     errors.append(f"Employee with code {employee_code} already exists")
        
        # existing_email = await self.uow.employees.find_by_email(email)
        # if existing_email:
        #     errors.append(f"Employee with email {email} already exists")
        
        return errors
    
    async def _validate_business_rules(self, **kwargs) -> List[str]:
        """Validate business rules for payroll operations"""
        errors = []
        
        # Implement specific business rule validations
        # For example: salary structure assignments, work entry overlaps, etc.
        
        return errors