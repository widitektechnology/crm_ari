"""
Work Entry Entity - Work Time Management
Manages work entries, work schedules, and time tracking
"""
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime, date, time, timedelta
from decimal import Decimal
from .base_entity import BaseEntity, DomainEvent


class WorkEntryType(BaseEntity):
    """
    Work Entry Type entity
    Defines types of work entries (work, leave, overtime, etc.)
    """
    
    def __init__(self,
                 company_id: int,
                 name: str,
                 code: str,
                 id: Optional[int] = None):
        super().__init__(id)
        self.company_id = company_id
        self.name = name
        self.code = code
        self.payroll_code: Optional[str] = None
        self.external_code: Optional[str] = None  # DMFA code, etc.
        self.color = "#000000"  # Hex color for UI
        self.is_leave = False
        self.is_active = True
    
    def set_payroll_code(self, payroll_code: str):
        """Set payroll code for accounting integration"""
        self.payroll_code = payroll_code
        self.mark_dirty()
    
    def set_external_code(self, external_code: str):
        """Set external code (e.g., DMFA code)"""
        self.external_code = external_code
        self.mark_dirty()
    
    def mark_as_leave(self):
        """Mark this work entry type as leave"""
        self.is_leave = True
        self.mark_dirty()
    
    def validate(self) -> List[str]:
        """Validate work entry type"""
        errors = super().validate()
        
        if not self.name or len(self.name.strip()) == 0:
            errors.append("Work entry type name is required")
        
        if not self.code or len(self.code.strip()) == 0:
            errors.append("Work entry type code is required")
        
        if self.company_id is None or self.company_id <= 0:
            errors.append("Valid company ID is required")
        
        return errors


class WorkEntry(BaseEntity):
    """
    Work Entry entity
    Represents individual work time entries
    """
    
    def __init__(self,
                 employee_id: int,
                 work_entry_type_id: int,
                 date_start: datetime,
                 date_stop: datetime,
                 id: Optional[int] = None):
        super().__init__(id)
        self.employee_id = employee_id
        self.work_entry_type_id = work_entry_type_id
        self.date_start = date_start
        self.date_stop = date_stop
        self.description: Optional[str] = None
        self._duration: Optional[Decimal] = None
    
    @property
    def duration(self) -> Decimal:
        """Calculate duration in hours"""
        if self._duration is not None:
            return self._duration
        
        delta = self.date_stop - self.date_start
        hours = Decimal(str(delta.total_seconds() / 3600))
        return hours.quantize(Decimal('0.01'))
    
    @duration.setter
    def duration(self, value: Decimal):
        """Set duration manually"""
        self._duration = value
        self.mark_dirty()
    
    def set_description(self, description: str):
        """Set work entry description"""
        self.description = description
        self.mark_dirty()
    
    def update_time_period(self, date_start: datetime, date_stop: datetime):
        """Update work entry time period"""
        if date_start >= date_stop:
            raise ValueError("Start date must be before stop date")
        
        self.date_start = date_start
        self.date_stop = date_stop
        self._duration = None  # Reset calculated duration
        self.mark_dirty()
    
    def validate(self) -> List[str]:
        """Validate work entry"""
        errors = super().validate()
        
        if self.employee_id is None or self.employee_id <= 0:
            errors.append("Valid employee ID is required")
        
        if self.work_entry_type_id is None or self.work_entry_type_id <= 0:
            errors.append("Valid work entry type ID is required")
        
        if not self.date_start:
            errors.append("Start date is required")
        
        if not self.date_stop:
            errors.append("Stop date is required")
        
        if self.date_start and self.date_stop and self.date_start >= self.date_stop:
            errors.append("Start date must be before stop date")
        
        if self.duration <= 0:
            errors.append("Duration must be positive")
        
        return errors


class RoundingType(Enum):
    NONE = "none"           # No rounding
    HALF_DAY = "half_day"   # Round to half day
    FULL_DAY = "full_day"   # Round to full day


class WorkSchedule(BaseEntity):
    """
    Work Schedule entity
    Manages working hours and schedules for companies
    """
    
    def __init__(self,
                 company_id: int,
                 name: str,
                 id: Optional[int] = None):
        super().__init__(id)
        self.company_id = company_id
        self.name = name
        self.full_time_hours = Decimal('40.00')  # Full time hours per week
        self.average_hours_per_day = Decimal('8.00')  # Average hours per day
        self.rounding_type = RoundingType.NONE
        self.is_two_week_calendar = False  # Support for 2-week calendar
        
        # Working days configuration (Monday=0, Sunday=6)
        self.working_days: Dict[int, Dict[str, Any]] = {
            0: {'is_working': True, 'hours': Decimal('8.00')},  # Monday
            1: {'is_working': True, 'hours': Decimal('8.00')},  # Tuesday
            2: {'is_working': True, 'hours': Decimal('8.00')},  # Wednesday
            3: {'is_working': True, 'hours': Decimal('8.00')},  # Thursday
            4: {'is_working': True, 'hours': Decimal('8.00')},  # Friday
            5: {'is_working': False, 'hours': Decimal('0.00')}, # Saturday
            6: {'is_working': False, 'hours': Decimal('0.00')}  # Sunday
        }
    
    def set_full_time_hours(self, hours: Decimal):
        """Set full time hours per week"""
        if hours <= 0:
            raise ValueError("Full time hours must be positive")
        
        self.full_time_hours = hours
        self.mark_dirty()
    
    def set_average_hours_per_day(self, hours: Decimal):
        """Set average hours per day"""
        if hours <= 0:
            raise ValueError("Average hours per day must be positive")
        
        self.average_hours_per_day = hours
        self.mark_dirty()
    
    def set_rounding_type(self, rounding_type: RoundingType):
        """Set timesheet rounding type"""
        self.rounding_type = rounding_type
        self.mark_dirty()
    
    def enable_two_week_calendar(self):
        """Enable two-week calendar support"""
        self.is_two_week_calendar = True
        self.mark_dirty()
    
    def disable_two_week_calendar(self):
        """Disable two-week calendar support"""
        self.is_two_week_calendar = False
        self.mark_dirty()
    
    def set_working_day(self, day_of_week: int, is_working: bool, hours: Decimal = Decimal('0.00')):
        """Configure working day (0=Monday, 6=Sunday)"""
        if day_of_week < 0 or day_of_week > 6:
            raise ValueError("Day of week must be between 0 (Monday) and 6 (Sunday)")
        
        if is_working and hours <= 0:
            raise ValueError("Working day must have positive hours")
        
        self.working_days[day_of_week] = {
            'is_working': is_working,
            'hours': hours if is_working else Decimal('0.00')
        }
        self.mark_dirty()
    
    def get_working_hours_for_date(self, date_obj: date) -> Decimal:
        """Get working hours for specific date"""
        day_of_week = date_obj.weekday()  # Monday=0, Sunday=6
        day_config = self.working_days.get(day_of_week, {'is_working': False, 'hours': Decimal('0.00')})
        
        if not day_config['is_working']:
            return Decimal('0.00')
        
        return day_config['hours']
    
    def is_working_day(self, date_obj: date) -> bool:
        """Check if date is a working day"""
        day_of_week = date_obj.weekday()
        day_config = self.working_days.get(day_of_week, {'is_working': False})
        return day_config['is_working']
    
    def apply_rounding(self, hours: Decimal) -> Decimal:
        """Apply rounding rules to hours"""
        if self.rounding_type == RoundingType.NONE:
            return hours
        elif self.rounding_type == RoundingType.HALF_DAY:
            # Round to nearest 0.5 day (4 hours if 8 hours per day)
            half_day = self.average_hours_per_day / 2
            return (hours / half_day).quantize(Decimal('1')) * half_day
        elif self.rounding_type == RoundingType.FULL_DAY:
            # Round to nearest full day
            return (hours / self.average_hours_per_day).quantize(Decimal('1')) * self.average_hours_per_day
        
        return hours
    
    def calculate_weekly_hours(self) -> Decimal:
        """Calculate total weekly hours based on working days configuration"""
        total = Decimal('0.00')
        for day_config in self.working_days.values():
            if day_config['is_working']:
                total += day_config['hours']
        return total
    
    def validate(self) -> List[str]:
        """Validate work schedule"""
        errors = super().validate()
        
        if not self.name or len(self.name.strip()) == 0:
            errors.append("Work schedule name is required")
        
        if self.company_id is None or self.company_id <= 0:
            errors.append("Valid company ID is required")
        
        if self.full_time_hours <= 0:
            errors.append("Full time hours must be positive")
        
        if self.average_hours_per_day <= 0:
            errors.append("Average hours per day must be positive")
        
        # Validate working days configuration
        total_weekly_hours = self.calculate_weekly_hours()
        if total_weekly_hours != self.full_time_hours:
            errors.append(f"Weekly hours configuration ({total_weekly_hours}) doesn't match full time hours ({self.full_time_hours})")
        
        return errors