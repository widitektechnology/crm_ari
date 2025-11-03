"""
Finance Application Service
Manages finance and invoicing business operations
"""
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, date, timedelta
from .base_service import BaseApplicationService
from ..unit_of_work.base_unit_of_work import UnitOfWork
from ...domain.entities.invoice import Invoice, InvoiceLine, InvoiceStatus, InvoiceType


class FinanceService(BaseApplicationService):
    """
    Application service for finance management
    Implements Service Layer pattern for finance and invoicing operations
    """
    
    def __init__(self, unit_of_work: UnitOfWork):
        super().__init__(unit_of_work)
    
    # Invoice Management
    async def create_invoice(self,
                           company_id: int,
                           customer_name: str,
                           customer_tax_id: str,
                           customer_email: str,
                           issue_date: date,
                           due_days: int = 30,
                           invoice_type: InvoiceType = InvoiceType.STANDARD) -> Invoice:
        """Create a new invoice with B2B electronic invoicing compliance"""
        
        validation_errors = await self._validate_invoice_creation(
            company_id, customer_tax_id, customer_email
        )
        
        if validation_errors:
            raise ValueError(f"Validation failed: {', '.join(validation_errors)}")
        
        async def _create_operation():
            # Generate invoice number
            invoice_number = await self._generate_invoice_number(company_id)
            
            # Calculate due date
            due_date = issue_date + timedelta(days=due_days)
            
            # Create invoice
            invoice = Invoice(
                company_id=company_id,
                invoice_number=invoice_number,
                customer_name=customer_name,
                customer_tax_id=customer_tax_id,
                issue_date=issue_date
            )
            
            invoice.set_customer_email(customer_email)
            invoice.set_due_date(due_date)
            invoice.invoice_type = invoice_type
            
            self.uow.register_new(invoice)
            return invoice
        
        return await self._execute_with_transaction(_create_operation)
    
    async def add_invoice_line(self,
                              invoice_id: int,
                              product_name: str,
                              quantity: Decimal,
                              unit_price: Decimal,
                              tax_rate: Decimal,
                              description: Optional[str] = None) -> InvoiceLine:
        """Add line item to an invoice"""
        
        async def _add_line_operation():
            # In a real implementation, fetch invoice from repository
            # invoice = await self.uow.invoices.get_by_id(invoice_id)
            
            if invoice_id is None:  # Simplified for example
                raise ValueError("Invoice not found")
            
            # Create invoice line
            invoice_line = InvoiceLine(
                product_name=product_name,
                quantity=quantity,
                unit_price=unit_price,
                tax_rate=tax_rate
            )
            
            if description:
                invoice_line.set_description(description)
            
            # In real implementation:
            # invoice.add_invoice_line(invoice_line)
            # self.uow.register_dirty(invoice)
            
            self.uow.register_new(invoice_line)
            return invoice_line
        
        return await self._execute_with_transaction(_add_line_operation)
    
    async def apply_electronic_signature(self,
                                       invoice_id: int,
                                       signature_data: Dict[str, Any]) -> Invoice:
        """Apply electronic signature to invoice for legal compliance"""
        
        async def _sign_operation():
            # In a real implementation, fetch invoice from repository
            # invoice = await self.uow.invoices.get_by_id(invoice_id)
            
            # Simplified example
            invoice = Invoice(
                company_id=1,
                invoice_number="INV-2024-001",
                customer_name="Customer",
                customer_tax_id="12345678A",
                issue_date=date.today()
            )
            
            # Generate signature (in real implementation, use proper cryptographic signing)
            signature = self._generate_electronic_signature(invoice, signature_data)
            invoice.apply_electronic_signature(signature)
            
            # Generate legal hash for integrity
            invoice.generate_legal_hash()
            
            self.uow.register_dirty(invoice)
            return invoice
        
        return await self._execute_with_transaction(_sign_operation)
    
    async def send_invoice_electronically(self,
                                        invoice_id: int,
                                        recipient_email: Optional[str] = None) -> Invoice:
        """Send invoice electronically with B2B compliance"""
        
        async def _send_operation():
            # In a real implementation, fetch invoice from repository
            # invoice = await self.uow.invoices.get_by_id(invoice_id)
            
            # Validate B2B electronic invoicing requirements
            validation_errors = await self._validate_electronic_invoicing_requirements(invoice_id)
            if validation_errors:
                raise ValueError(f"Electronic invoicing validation failed: {', '.join(validation_errors)}")
            
            # Simplified example
            invoice = Invoice(
                company_id=1,
                invoice_number="INV-2024-001",
                customer_name="Customer",
                customer_tax_id="12345678A",
                issue_date=date.today()
            )
            
            # Send electronically
            invoice.send_electronically(recipient_email)
            
            # In real implementation, integrate with electronic invoicing platform
            await self._transmit_to_electronic_platform(invoice)
            
            self.uow.register_dirty(invoice)
            return invoice
        
        return await self._execute_with_transaction(_send_operation)
    
    async def mark_invoice_as_paid(self,
                                 invoice_id: int,
                                 payment_date: Optional[date] = None,
                                 payment_reference: Optional[str] = None) -> Invoice:
        """Mark invoice as paid"""
        
        async def _mark_paid_operation():
            # In a real implementation, fetch invoice from repository
            # invoice = await self.uow.invoices.get_by_id(invoice_id)
            
            # Simplified example
            invoice = Invoice(
                company_id=1,
                invoice_number="INV-2024-001",
                customer_name="Customer",
                customer_tax_id="12345678A",
                issue_date=date.today()
            )
            invoice.status = InvoiceStatus.SENT  # Set to sent for the example
            
            invoice.mark_as_paid(payment_date or date.today())
            
            # In real implementation, create payment record
            # await self._create_payment_record(invoice, payment_date, payment_reference)
            
            self.uow.register_dirty(invoice)
            return invoice
        
        return await self._execute_with_transaction(_mark_paid_operation)
    
    async def generate_invoice_report(self,
                                    company_id: int,
                                    date_from: date,
                                    date_to: date,
                                    status_filter: Optional[InvoiceStatus] = None) -> Dict[str, Any]:
        """Generate invoice report for a period"""
        
        async def _generate_report_operation():
            # In a real implementation, query invoices from repository
            # invoices = await self.uow.invoices.find_by_period(company_id, date_from, date_to, status_filter)
            
            # Simplified example data
            report_data = {
                'company_id': company_id,
                'period_from': date_from.isoformat(),
                'period_to': date_to.isoformat(),
                'status_filter': status_filter.value if status_filter else None,
                'summary': {
                    'total_invoices': 10,
                    'total_amount': Decimal('15000.00'),
                    'paid_invoices': 7,
                    'paid_amount': Decimal('12000.00'),
                    'pending_invoices': 2,
                    'pending_amount': Decimal('2500.00'),
                    'overdue_invoices': 1,
                    'overdue_amount': Decimal('500.00')
                },
                'by_status': {
                    'draft': {'count': 0, 'amount': Decimal('0.00')},
                    'sent': {'count': 2, 'amount': Decimal('2500.00')},
                    'paid': {'count': 7, 'amount': Decimal('12000.00')},
                    'overdue': {'count': 1, 'amount': Decimal('500.00')},
                    'cancelled': {'count': 0, 'amount': Decimal('0.00')}
                },
                'compliance_report': {
                    'electronic_invoices': 10,
                    'properly_signed': 10,
                    'transmitted_successfully': 9,
                    'compliance_rate': '100%'
                }
            }
            
            return report_data
        
        return await self._execute_with_transaction(_generate_report_operation)
    
    # Electronic Invoicing Platform Integration
    async def _transmit_to_electronic_platform(self, invoice: Invoice):
        """Transmit invoice to electronic invoicing platform"""
        # In a real implementation, this would integrate with Spanish AEAT platform
        # or other national electronic invoicing systems
        
        # Example integration data
        transmission_data = {
            'invoice_number': invoice.invoice_number,
            'customer_tax_id': invoice.customer_tax_id,
            'total_amount': str(invoice.total),
            'legal_hash': invoice.legal_hash,
            'electronic_signature': invoice.electronic_signature,
            'transmission_timestamp': datetime.now().isoformat()
        }
        
        # Simulate platform transmission
        # In reality, this would be an HTTP API call to the official platform
        print(f"Transmitting invoice {invoice.invoice_number} to electronic platform")
        print(f"Transmission data: {transmission_data}")
    
    # Validation Methods
    async def _validate_invoice_creation(self,
                                       company_id: int,
                                       customer_tax_id: str,
                                       customer_email: str) -> List[str]:
        """Validate invoice creation parameters"""
        errors = []
        
        # Validate company exists
        # company = await self.uow.companies.get_by_id(company_id)
        # if not company or not company.is_active():
        #     errors.append("Invalid or inactive company")
        
        # Validate customer tax ID format (example for Spanish NIF/CIF)
        if not self._validate_spanish_tax_id(customer_tax_id):
            errors.append("Invalid customer tax ID format")
        
        # Validate email format
        if '@' not in customer_email:
            errors.append("Invalid customer email format")
        
        return errors
    
    async def _validate_electronic_invoicing_requirements(self, invoice_id: int) -> List[str]:
        """Validate B2B electronic invoicing requirements"""
        errors = []
        
        # In a real implementation, fetch and validate invoice
        # invoice = await self.uow.invoices.get_by_id(invoice_id)
        # if not invoice:
        #     errors.append("Invoice not found")
        #     return errors
        
        # Validate legal requirements for Spanish B2B electronic invoicing
        # These checks ensure compliance with "Ley Crea y Crece"
        
        # Example validations:
        # - Invoice must have electronic signature
        # - Customer must be a business (B2B requirement)
        # - Invoice amount must meet minimum threshold
        # - All required fields must be present
        
        return errors
    
    def _validate_spanish_tax_id(self, tax_id: str) -> bool:
        """Validate Spanish tax ID format (NIF/CIF)"""
        if not tax_id or len(tax_id) < 8:
            return False
        
        # Simplified validation - in reality, implement full NIF/CIF validation
        return len(tax_id) >= 8 and tax_id[-1].isalpha()
    
    def _generate_electronic_signature(self, invoice: Invoice, signature_data: Dict[str, Any]) -> str:
        """Generate electronic signature for invoice"""
        # In a real implementation, use proper cryptographic signing
        # This would involve:
        # 1. Creating a hash of the invoice data
        # 2. Signing with company's private key
        # 3. Creating a verifiable signature
        
        import hashlib
        import json
        
        # Simplified signature generation
        signature_input = {
            'invoice_number': invoice.invoice_number,
            'total': str(invoice.total),
            'timestamp': datetime.now().isoformat(),
            'signer_data': signature_data
        }
        
        signature_string = json.dumps(signature_input, sort_keys=True)
        return hashlib.sha256(signature_string.encode()).hexdigest()
    
    async def _generate_invoice_number(self, company_id: int) -> str:
        """Generate unique invoice number for company"""
        # In a real implementation, this would:
        # 1. Query the last invoice number for the company
        # 2. Increment according to company's numbering scheme
        # 3. Handle different numbering formats (annual, sequential, etc.)
        
        # Simplified example
        year = date.today().year
        # next_number = await self.uow.invoices.get_next_number_for_company(company_id, year)
        next_number = 1  # Simplified
        
        return f"INV-{year}-{next_number:06d}"
    
    async def _validate_business_rules(self, **kwargs) -> List[str]:
        """Validate business rules for finance operations"""
        errors = []
        
        # Implement specific business rule validations
        # For example: invoice limits, customer credit checks, etc.
        
        return errors