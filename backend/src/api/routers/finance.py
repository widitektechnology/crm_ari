"""
Finance API Router
REST API endpoints for finance and invoicing
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, date
from decimal import Decimal

# Pydantic models
class InvoiceCreate(BaseModel):
    company_id: int
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_tax_id: str = Field(..., min_length=5, max_length=50)
    customer_email: str = Field(..., description="Valid email address")
    issue_date: date
    due_days: int = Field(30, ge=1, le=365)


class InvoiceLineCreate(BaseModel):
    invoice_id: int
    product_name: str = Field(..., min_length=1, max_length=255)
    quantity: Decimal = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    tax_rate: Decimal = Field(..., ge=0, le=100)
    description: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: int
    company_id: int
    invoice_number: str
    customer_name: str
    customer_tax_id: str
    customer_email: str
    issue_date: date
    due_date: date
    status: str
    subtotal: Decimal
    tax_amount: Decimal
    total: Decimal
    is_electronic: bool
    created_at: datetime


class InvoiceLineResponse(BaseModel):
    id: int
    invoice_id: int
    product_name: str
    description: Optional[str]
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    line_total: Decimal


class ElectronicSignatureRequest(BaseModel):
    invoice_id: int
    signature_data: Dict[str, Any]


class InvoiceReportResponse(BaseModel):
    company_id: int
    period_from: str
    period_to: str
    summary: Dict[str, Any]
    by_status: Dict[str, Dict[str, Any]]
    compliance_report: Dict[str, Any]


router = APIRouter()


@router.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(invoice_data: InvoiceCreate):
    """Create a new invoice"""
    try:
        # Simulate invoice creation
        invoice_response = InvoiceResponse(
            id=1,
            company_id=invoice_data.company_id,
            invoice_number="INV-2024-000001",
            customer_name=invoice_data.customer_name,
            customer_tax_id=invoice_data.customer_tax_id,
            customer_email=invoice_data.customer_email,
            issue_date=invoice_data.issue_date,
            due_date=date(2024, 2, 15),
            status="draft",
            subtotal=Decimal("0.00"),
            tax_amount=Decimal("0.00"),
            total=Decimal("0.00"),
            is_electronic=True,
            created_at=datetime.now()
        )
        
        return invoice_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get invoices with optional filtering"""
    # Simulate invoice list
    invoices = [
        InvoiceResponse(
            id=1,
            company_id=1,
            invoice_number="INV-2024-000001",
            customer_name="Cliente Ejemplo S.L.",
            customer_tax_id="B87654321",
            customer_email="cliente@ejemplo.com",
            issue_date=date(2024, 1, 15),
            due_date=date(2024, 2, 15),
            status="sent",
            subtotal=Decimal("1000.00"),
            tax_amount=Decimal("210.00"),
            total=Decimal("1210.00"),
            is_electronic=True,
            created_at=datetime.now()
        )
    ]
    
    return invoices


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int):
    """Get invoice by ID"""
    if invoice_id != 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice = InvoiceResponse(
        id=invoice_id,
        company_id=1,
        invoice_number="INV-2024-000001",
        customer_name="Cliente Ejemplo S.L.",
        customer_tax_id="B87654321",
        customer_email="cliente@ejemplo.com",
        issue_date=date(2024, 1, 15),
        due_date=date(2024, 2, 15),
        status="sent",
        subtotal=Decimal("1000.00"),
        tax_amount=Decimal("210.00"),
        total=Decimal("1210.00"),
        is_electronic=True,
        created_at=datetime.now()
    )
    
    return invoice


@router.post("/invoices/{invoice_id}/lines", response_model=InvoiceLineResponse, status_code=status.HTTP_201_CREATED)
async def add_invoice_line(invoice_id: int, line_data: InvoiceLineCreate):
    """Add line item to invoice"""
    try:
        line_response = InvoiceLineResponse(
            id=1,
            invoice_id=invoice_id,
            product_name=line_data.product_name,
            description=line_data.description,
            quantity=line_data.quantity,
            unit_price=line_data.unit_price,
            tax_rate=line_data.tax_rate,
            line_total=line_data.quantity * line_data.unit_price
        )
        
        return line_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/invoices/{invoice_id}/electronic-signature")
async def apply_electronic_signature(invoice_id: int, signature_request: ElectronicSignatureRequest):
    """Apply electronic signature to invoice"""
    try:
        return {
            "success": True,
            "message": "Electronic signature applied successfully",
            "invoice_id": invoice_id,
            "signature_applied_at": datetime.now().isoformat()
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/invoices/{invoice_id}/send")
async def send_invoice_electronically(
    invoice_id: int,
    recipient_email: Optional[str] = Query(None, description="Override recipient email")
):
    """Send invoice electronically"""
    try:
        return {
            "success": True,
            "message": "Invoice sent electronically",
            "invoice_id": invoice_id,
            "sent_to": recipient_email or "cliente@ejemplo.com",
            "sent_at": datetime.now().isoformat(),
            "transmission_id": "TX-2024-000123"
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/invoices/{invoice_id}/mark-paid")
async def mark_invoice_as_paid(
    invoice_id: int,
    payment_date: Optional[date] = Query(None, description="Payment date"),
    payment_reference: Optional[str] = Query(None, description="Payment reference")
):
    """Mark invoice as paid"""
    try:
        return {
            "success": True,
            "message": "Invoice marked as paid",
            "invoice_id": invoice_id,
            "payment_date": (payment_date or date.today()).isoformat(),
            "payment_reference": payment_reference,
            "updated_at": datetime.now().isoformat()
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/reports/invoices", response_model=InvoiceReportResponse)
async def generate_invoice_report(
    company_id: int = Query(..., description="Company ID"),
    date_from: date = Query(..., description="Start date"),
    date_to: date = Query(..., description="End date"),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    """Generate invoice report for a period"""
    try:
        # Simulate report generation
        report = InvoiceReportResponse(
            company_id=company_id,
            period_from=date_from.isoformat(),
            period_to=date_to.isoformat(),
            summary={
                "total_invoices": 25,
                "total_amount": 15750.00,
                "paid_invoices": 18,
                "paid_amount": 12600.00,
                "pending_invoices": 5,
                "pending_amount": 2650.00,
                "overdue_invoices": 2,
                "overdue_amount": 500.00
            },
            by_status={
                "draft": {"count": 0, "amount": 0.00},
                "sent": {"count": 5, "amount": 2650.00},
                "paid": {"count": 18, "amount": 12600.00},
                "overdue": {"count": 2, "amount": 500.00},
                "cancelled": {"count": 0, "amount": 0.00}
            },
            compliance_report={
                "electronic_invoices": 25,
                "properly_signed": 25,
                "transmitted_successfully": 23,
                "compliance_rate": "100%"
            }
        )
        
        return report
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate invoice report"
        )