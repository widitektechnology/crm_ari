import { ApiService } from '@/lib/api-client'
import { 
  Invoice, 
  CreateInvoiceRequest,
  IncomeReport,
  PaginatedResponse,
  FilterOptions,
  SortOptions,
  PaginationOptions 
} from '@/types'

class FinanceService extends ApiService {
  constructor() {
    super('/api/finance')
  }

  // Invoice methods
  async getInvoices(
    pagination?: PaginationOptions,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<PaginatedResponse<Invoice>> {
    const params = {
      ...(pagination && { page: pagination.page, per_page: pagination.per_page }),
      ...(filters && filters),
      ...(sort && { sort_by: sort.field, order: sort.order })
    }
    
    return this.get<PaginatedResponse<Invoice>>('/invoices', params)
  }

  async getInvoice(id: number): Promise<Invoice> {
    return this.get<Invoice>(`/invoices/${id}`)
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    return this.post<Invoice>('/invoices', data)
  }

  async updateInvoice(id: number, data: Partial<CreateInvoiceRequest>): Promise<Invoice> {
    return this.put<Invoice>(`/invoices/${id}`, data)
  }

  async deleteInvoice(id: number): Promise<void> {
    return this.delete<void>(`/invoices/${id}`)
  }

  async markInvoiceAsPaid(id: number): Promise<Invoice> {
    return this.post<Invoice>(`/invoices/${id}/mark-paid`)
  }

  async sendInvoice(id: number, email?: string): Promise<void> {
    return this.post<void>(`/invoices/${id}/send`, email ? { email } : {})
  }

  // Electronic invoice methods
  async createElectronicInvoice(data: {
    invoice_id: number
    electronic_format: 'xml' | 'json'
    digital_signature?: boolean
  }) {
    return this.post('/electronic-invoice', data)
  }

  async getElectronicInvoice(invoiceId: number) {
    return this.get(`/electronic-invoice/${invoiceId}`)
  }

  // Reports
  async getIncomeReport(
    companyId: number,
    period: string,
    groupBy?: 'month' | 'customer' | 'category'
  ): Promise<IncomeReport> {
    const params = {
      company_id: companyId,
      period,
      ...(groupBy && { group_by: groupBy })
    }
    return this.get<IncomeReport>('/reports/income', params)
  }

  async getTaxReport(companyId: number, period: string) {
    const params = {
      company_id: companyId,
      period
    }
    return this.get('/reports/tax', params)
  }

  async getCashFlowReport(companyId: number, period: string) {
    const params = {
      company_id: companyId,
      period
    }
    return this.get('/reports/cash-flow', params)
  }

  // Dashboard stats
  async getFinanceStats(companyId: number) {
    return this.get('/stats', { company_id: companyId })
  }

  // Invoice templates
  async getInvoiceTemplates() {
    return this.get('/templates')
  }

  async createInvoiceTemplate(data: {
    name: string
    design: string
    is_default: boolean
  }) {
    return this.post('/templates', data)
  }
}

export const financeService = new FinanceService()