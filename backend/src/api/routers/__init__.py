""" 
Router initialization module
"""
# Import all routers to make them available for the main application
from . import companies
from . import ai 
from . import payroll
from . import finance
from . import external_api
from . import mail
from . import employees

__all__ = [
    "companies",
    "ai", 
    "payroll",
    "finance",
    "external_api",
    "mail",
    "employees"
]