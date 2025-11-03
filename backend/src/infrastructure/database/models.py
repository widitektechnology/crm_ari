"""
Database Models (ORM)
SQLAlchemy models for database tables
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Decimal, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .connection import Base


class CompanyModel(Base):
    """Company table model"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    tax_id = Column(String(50), nullable=False, unique=True, index=True)
    country_code = Column(String(2), nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    localization_config = Column(JSON, nullable=True)
    tax_config = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    employees = relationship("EmployeeModel", back_populates="company")
    salary_structures = relationship("SalaryStructureModel", back_populates="company")
    invoices = relationship("InvoiceModel", back_populates="company")


class EmployeeModel(Base):
    """Employee table model"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    employee_code = Column(String(50), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    hire_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    salary_structure_id = Column(Integer, ForeignKey("salary_structures.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("CompanyModel", back_populates="employees")
    salary_structure = relationship("SalaryStructureModel", back_populates="employees")
    payroll_entries = relationship("PayrollEntryModel", back_populates="employee")
    work_entries = relationship("WorkEntryModel", back_populates="employee")


class SalaryStructureModel(Base):
    """Salary structure table model"""
    __tablename__ = "salary_structures"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # 'employee', 'hourly'
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("CompanyModel", back_populates="salary_structures")
    employees = relationship("EmployeeModel", back_populates="salary_structure")
    salary_rules = relationship("SalaryRuleModel", back_populates="salary_structure")


class SalaryRuleModel(Base):
    """Salary rule table model"""
    __tablename__ = "salary_rules"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    salary_structure_id = Column(Integer, ForeignKey("salary_structures.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    sequence = Column(Integer, default=100)
    condition_select = Column(String(20), default="none")  # 'none', 'range', 'python'
    condition_range_min = Column(Decimal(10, 2), nullable=True)
    condition_range_max = Column(Decimal(10, 2), nullable=True)
    condition_python = Column(Text, nullable=True)
    amount_select = Column(String(20), default="fix")  # 'fix', 'percentage', 'python'
    amount_fix = Column(Decimal(10, 2), nullable=True)
    amount_percentage = Column(Decimal(5, 2), nullable=True)
    amount_python_compute = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    salary_structure = relationship("SalaryStructureModel", back_populates="salary_rules")


class WorkEntryTypeModel(Base):
    """Work entry type table model"""
    __tablename__ = "work_entry_types"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    payroll_code = Column(String(50), nullable=True)
    external_code = Column(String(50), nullable=True)  # DMFA code, etc.
    color = Column(String(7), default="#000000")  # Hex color
    is_leave = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    work_entries = relationship("WorkEntryModel", back_populates="work_entry_type")


class WorkEntryModel(Base):
    """Work entry table model"""
    __tablename__ = "work_entries"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    work_entry_type_id = Column(Integer, ForeignKey("work_entry_types.id"), nullable=False)
    date_start = Column(DateTime(timezone=True), nullable=False)
    date_stop = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Decimal(8, 2), nullable=False)  # Hours
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    employee = relationship("EmployeeModel", back_populates="work_entries")
    work_entry_type = relationship("WorkEntryTypeModel", back_populates="work_entries")


class PayrollEntryModel(Base):
    """Payroll entry table model"""
    __tablename__ = "payroll_entries"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date_from = Column(DateTime(timezone=True), nullable=False)
    date_to = Column(DateTime(timezone=True), nullable=False)
    state = Column(String(20), default="draft")  # draft, done, paid
    total_amount = Column(Decimal(10, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    employee = relationship("EmployeeModel", back_populates="payroll_entries")
    payroll_lines = relationship("PayrollLineModel", back_populates="payroll_entry")


class PayrollLineModel(Base):
    """Payroll line table model"""
    __tablename__ = "payroll_lines"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    payroll_entry_id = Column(Integer, ForeignKey("payroll_entries.id"), nullable=False)
    salary_rule_id = Column(Integer, ForeignKey("salary_rules.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    quantity = Column(Decimal(8, 2), default=1.00)
    rate = Column(Decimal(10, 2), default=0.00)
    amount = Column(Decimal(10, 2), default=0.00)
    total = Column(Decimal(10, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    payroll_entry = relationship("PayrollEntryModel", back_populates="payroll_lines")


class InvoiceModel(Base):
    """Invoice table model"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    invoice_number = Column(String(50), nullable=False, unique=True)
    customer_name = Column(String(255), nullable=False)
    customer_tax_id = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    issue_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    subtotal = Column(Decimal(10, 2), default=0.00)
    tax_amount = Column(Decimal(10, 2), default=0.00)
    total = Column(Decimal(10, 2), default=0.00)
    status = Column(String(20), default="draft")  # draft, sent, paid, cancelled
    is_electronic = Column(Boolean, default=True)
    electronic_signature = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("CompanyModel", back_populates="invoices")
    invoice_lines = relationship("InvoiceLineModel", back_populates="invoice")


class InvoiceLineModel(Base):
    """Invoice line table model"""
    __tablename__ = "invoice_lines"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Decimal(8, 2), default=1.00)
    unit_price = Column(Decimal(10, 2), default=0.00)
    tax_rate = Column(Decimal(5, 2), default=0.00)
    line_total = Column(Decimal(10, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    invoice = relationship("InvoiceModel", back_populates="invoice_lines")