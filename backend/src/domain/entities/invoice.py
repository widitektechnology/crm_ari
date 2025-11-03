"""
Invoice Entity - Electronic Invoice Management
Implements rich domain model for B2B electronic invoicing compliance
"""
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime, date
from decimal import Decimal
from .base_entity import BaseEntity, DomainEvent
import hashlib
import json


class InvoiceStatus(Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class InvoiceType(Enum):
    STANDARD = "standard"
    CREDIT_NOTE = "credit_note"
    DEBIT_NOTE = "debit_note"
    RECTIFICATION = "rectification"


class InvoiceCreatedEvent(DomainEvent):
    """Event raised when an invoice is created"""
    def __init__(self, invoice_id: int, invoice_number: str, customer_name: str):
        super().__init__()
        self.aggregate_id = str(invoice_id)
        self.event_type = "InvoiceCreated"
        self.event_data = {
            "invoice_number": invoice_number,
            "customer_name": customer_name
        }


class InvoiceSentEvent(DomainEvent):
    """Event raised when an invoice is sent electronically"""
    def __init__(self, invoice_id: int, invoice_number: str, recipient_email: str):
        super().__init__()
        self.aggregate_id = str(invoice_id)
        self.event_type = "InvoiceSent"
        self.event_data = {
            "invoice_number": invoice_number,
            "recipient_email": recipient_email
        }


class Invoice(BaseEntity):
    """
    Invoice aggregate root implementing rich domain model
    Handles B2B electronic invoicing with legal compliance
    """
    
    def __init__(self,
                 company_id: int,
                 invoice_number: str,
                 customer_name: str,
                 customer_tax_id: str,
                 issue_date: date,
                 id: Optional[int] = None):
        super().__init__(id)
        self.company_id = company_id
        self.invoice_number = invoice_number
        self.customer_name = customer_name
        self.customer_tax_id = customer_tax_id
        self.customer_email: Optional[str] = None
        self.customer_address: Optional[str] = None
        self.issue_date = issue_date
        self.due_date: Optional[date] = None
        self.invoice_type = InvoiceType.STANDARD
        self.status = InvoiceStatus.DRAFT
        
        # Financial amounts
        self.subtotal = Decimal('0.00')
        self.tax_amount = Decimal('0.00')
        self.total = Decimal('0.00')
        
        # Electronic invoicing compliance
        self.is_electronic = True
        self.electronic_signature: Optional[str] = None
        self.transmission_date: Optional[datetime] = None
        self.legal_hash: Optional[str] = None
        
        # Invoice lines
        self.invoice_lines: List['InvoiceLine'] = []
        
        # Domain event
        if id is None:
            self.add_domain_event(InvoiceCreatedEvent(self.id or 0, invoice_number, customer_name))
    
    def set_customer_email(self, email: str):
        """Set customer email for electronic transmission"""
        if '@' not in email:
            raise ValueError("Invalid email format")
        self.customer_email = email
        self.mark_dirty()
    
    def set_customer_address(self, address: str):
        """Set customer address"""
        self.customer_address = address
        self.mark_dirty()
    
    def set_due_date(self, due_date: date):
        """Set invoice due date"""
        if due_date < self.issue_date:
            raise ValueError("Due date cannot be before issue date")
        self.due_date = due_date
        self.mark_dirty()
    
    def add_invoice_line(self, invoice_line: 'InvoiceLine'):
        """Add line item to invoice"""
        if invoice_line not in self.invoice_lines:
            self.invoice_lines.append(invoice_line)
            self._recalculate_totals()
            self.mark_dirty()
    
    def remove_invoice_line(self, invoice_line: 'InvoiceLine'):
        """Remove line item from invoice"""
        if invoice_line in self.invoice_lines:
            self.invoice_lines.remove(invoice_line)
            self._recalculate_totals()
            self.mark_dirty()
    
    def _recalculate_totals(self):
        """Recalculate invoice totals based on lines"""
        self.subtotal = sum(line.line_total for line in self.invoice_lines)
        self.tax_amount = sum(line.calculate_tax_amount() for line in self.invoice_lines)
        self.total = self.subtotal + self.tax_amount
    
    def generate_legal_hash(self) -> str:
        """Generate legal hash for electronic invoice integrity"""
        # Create hash based on critical invoice data
        hash_data = {
            'invoice_number': self.invoice_number,
            'customer_tax_id': self.customer_tax_id,
            'issue_date': self.issue_date.isoformat(),
            'total': str(self.total),
            'lines': [
                {
                    'product': line.product_name,
                    'quantity': str(line.quantity),
                    'price': str(line.unit_price),
                    'total': str(line.line_total)
                }
                for line in self.invoice_lines
            ]
        }
        
        hash_string = json.dumps(hash_data, sort_keys=True)
        self.legal_hash = hashlib.sha256(hash_string.encode()).hexdigest()
        return self.legal_hash
    
    def apply_electronic_signature(self, signature: str):
        """Apply electronic signature for legal compliance"""
        if not signature or len(signature.strip()) == 0:
            raise ValueError("Electronic signature cannot be empty")
        
        self.electronic_signature = signature
        self.mark_dirty()
    
    def send_electronically(self, recipient_email: Optional[str] = None):
        """Send invoice electronically with compliance requirements"""
        if self.status != InvoiceStatus.DRAFT:
            raise ValueError("Only draft invoices can be sent")
        
        if not self.is_electronic:
            raise ValueError("Invoice must be configured for electronic transmission")
        
        # Validate required fields for electronic invoicing
        validation_errors = self._validate_electronic_requirements()
        if validation_errors:
            raise ValueError(f"Electronic invoicing validation failed: {', '.join(validation_errors)}")
        
        # Generate legal hash if not present
        if not self.legal_hash:
            self.generate_legal_hash()
        
        # Set transmission details
        email = recipient_email or self.customer_email
        if not email:
            raise ValueError("Recipient email is required for electronic transmission")
        
        self.transmission_date = datetime.now()
        self.status = InvoiceStatus.SENT
        
        # Add domain event
        self.add_domain_event(InvoiceSentEvent(self.id or 0, self.invoice_number, email))
        self.mark_dirty()
    
    def mark_as_paid(self, payment_date: Optional[date] = None):
        """Mark invoice as paid"""
        if self.status not in [InvoiceStatus.SENT, InvoiceStatus.OVERDUE]:
            raise ValueError("Only sent or overdue invoices can be marked as paid")
        
        self.status = InvoiceStatus.PAID
        # In a real implementation, you might add payment_date field
        self.mark_dirty()
    
    def cancel(self, reason: Optional[str] = None):
        """Cancel invoice"""
        if self.status == InvoiceStatus.PAID:
            raise ValueError("Paid invoices cannot be cancelled")
        
        self.status = InvoiceStatus.CANCELLED
        # In a real implementation, you might add cancellation_reason field
        self.mark_dirty()
    
    def _validate_electronic_requirements(self) -> List[str]:
        """Validate requirements for electronic B2B invoicing"""
        errors = []
        
        if not self.customer_tax_id or len(self.customer_tax_id.strip()) == 0:
            errors.append("Customer tax ID is required for B2B electronic invoicing")
        
        if not self.customer_email:
            errors.append("Customer email is required for electronic transmission")
        
        if not self.invoice_lines:
            errors.append("Invoice must have at least one line item")
        
        if self.total <= 0:
            errors.append("Invoice total must be greater than zero")
        
        # Spanish legal requirements (Ley Crea y Crece)
        if not self.electronic_signature:
            errors.append("Electronic signature is required for legal compliance")
        
        return errors
    
    def get_legal_compliance_data(self) -> Dict[str, Any]:
        """Get data required for legal compliance and audit"""
        return {
            'invoice_number': self.invoice_number,
            'legal_hash': self.legal_hash,
            'electronic_signature': self.electronic_signature,
            'transmission_date': self.transmission_date.isoformat() if self.transmission_date else None,
            'issue_date': self.issue_date.isoformat(),
            'customer_tax_id': self.customer_tax_id,
            'total_amount': str(self.total),
            'compliance_check': self._validate_electronic_requirements() == []
        }
    
    def validate(self) -> List[str]:
        """Validate invoice entity"""
        errors = super().validate()
        
        if not self.invoice_number or len(self.invoice_number.strip()) == 0:
            errors.append("Invoice number is required")
        
        if not self.customer_name or len(self.customer_name.strip()) == 0:
            errors.append("Customer name is required")
        
        if not self.customer_tax_id or len(self.customer_tax_id.strip()) == 0:
            errors.append("Customer tax ID is required")
        
        if not self.issue_date:
            errors.append("Issue date is required")
        elif self.issue_date > date.today():
            errors.append("Issue date cannot be in the future")
        
        if self.due_date and self.due_date < self.issue_date:
            errors.append("Due date cannot be before issue date")
        
        if self.company_id is None or self.company_id <= 0:
            errors.append("Valid company ID is required")
        
        # Validate invoice lines
        for i, line in enumerate(self.invoice_lines):
            line_errors = line.validate()
            errors.extend([f"Line {i+1}: {error}" for error in line_errors])
        
        # Electronic invoicing validation
        if self.is_electronic:
            electronic_errors = self._validate_electronic_requirements()
            if self.status != InvoiceStatus.DRAFT:  # Only validate if not draft
                errors.extend(electronic_errors)
        
        return errors


class InvoiceLine(BaseEntity):
    """
    Invoice Line entity
    Represents individual line items in an invoice
    """
    
    def __init__(self,
                 product_name: str,
                 quantity: Decimal,
                 unit_price: Decimal,
                 tax_rate: Decimal = Decimal('0.00'),
                 id: Optional[int] = None):
        super().__init__(id)
        self.product_name = product_name
        self.description: Optional[str] = None
        self.quantity = quantity
        self.unit_price = unit_price
        self.tax_rate = tax_rate  # Tax rate as percentage (e.g., 21.00 for 21%)
        self.line_total = self.calculate_line_total()
    
    def set_description(self, description: str):
        """Set product description"""
        self.description = description
        self.mark_dirty()
    
    def update_quantity(self, quantity: Decimal):
        """Update line quantity"""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        self.quantity = quantity
        self.line_total = self.calculate_line_total()
        self.mark_dirty()
    
    def update_unit_price(self, unit_price: Decimal):
        """Update unit price"""
        if unit_price < 0:
            raise ValueError("Unit price cannot be negative")
        
        self.unit_price = unit_price
        self.line_total = self.calculate_line_total()
        self.mark_dirty()
    
    def set_tax_rate(self, tax_rate: Decimal):
        """Set tax rate (percentage)"""
        if tax_rate < 0 or tax_rate > 100:
            raise ValueError("Tax rate must be between 0 and 100")
        
        self.tax_rate = tax_rate
        self.mark_dirty()
    
    def calculate_line_total(self) -> Decimal:
        """Calculate line total (quantity * unit price)"""
        return self.quantity * self.unit_price
    
    def calculate_tax_amount(self) -> Decimal:
        """Calculate tax amount for this line"""
        return self.line_total * (self.tax_rate / Decimal('100'))
    
    def calculate_line_total_with_tax(self) -> Decimal:
        """Calculate line total including tax"""
        return self.line_total + self.calculate_tax_amount()
    
    def validate(self) -> List[str]:
        """Validate invoice line"""
        errors = super().validate()
        
        if not self.product_name or len(self.product_name.strip()) == 0:
            errors.append("Product name is required")
        
        if self.quantity <= 0:
            errors.append("Quantity must be positive")
        
        if self.unit_price < 0:
            errors.append("Unit price cannot be negative")
        
        if self.tax_rate < 0 or self.tax_rate > 100:
            errors.append("Tax rate must be between 0 and 100")
        
        return errors