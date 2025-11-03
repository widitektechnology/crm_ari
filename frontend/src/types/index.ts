// Company types
export interface Company {
  id: number
  name: string
  tax_id: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  website?: string
  logo_url?: string
  industry?: string
  employee_count?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCompanyRequest {
  name: string
  tax_id: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  website?: string
  logo_url?: string
  industry?: string
  employee_count?: number
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

// Employee types
export interface Employee {
  id: number
  company_id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  salary: number
  currency: string
  hire_date: string
  birth_date?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmployeeRequest {
  company_id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  salary: number
  currency: string
  hire_date: string
  birth_date?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

// Salary Structure types
export interface SalaryComponent {
  name: string
  component_type: 'earning' | 'deduction'
  calculation_type: 'fixed' | 'percentage' | 'formula'
  value: number
  is_taxable: boolean
  is_mandatory: boolean
}

export interface SalaryStructure {
  id: number
  company_id: number
  name: string
  description?: string
  components: SalaryComponent[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateSalaryStructureRequest {
  company_id: number
  name: string
  description?: string
  components: SalaryComponent[]
}

// Work Entry types
export interface WorkEntry {
  id: number
  employee_id: number
  entry_type: string
  start_time: string
  end_time?: string
  hours_worked: number
  description?: string
  created_at: string
}

export interface CreateWorkEntryRequest {
  employee_id: number
  entry_type: string
  start_time: string
  end_time?: string
  hours_worked: number
  description?: string
}

// Invoice types
export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
}

export interface Invoice {
  id: number
  company_id: number
  invoice_number: string
  customer_name: string
  customer_tax_id: string
  customer_email: string
  customer_address: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  items: InvoiceItem[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateInvoiceRequest {
  company_id: number
  customer_name: string
  customer_tax_id: string
  customer_email: string
  customer_address: string
  issue_date: string
  due_date: string
  currency: string
  items: InvoiceItem[]
  notes?: string
}

// AI types
export interface EmailClassificationRequest {
  subject: string
  content: string
  sender_email?: string
}

export interface EmailClassificationResponse {
  classification: string
  confidence: number
  suggested_actions: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  session_id?: string
  context?: Record<string, any>
}

export interface ChatResponse {
  response: string
  session_id: string
  confidence: number
  sources: string[]
}

// External API types
export interface HttpRequestConfig {
  method: string
  url: string
  headers?: Record<string, string>
  body?: Record<string, any>
  params?: Record<string, string>
  timeout?: number
  variables?: Record<string, any>
}

export interface AuthenticationConfig {
  auth_type: 'none' | 'bearer_token' | 'api_key' | 'basic_auth'
  token?: string
  username?: string
  password?: string
  api_key_header?: string
}

export interface RetryConfig {
  max_retries: number
  backoff_factor: number
  retry_statuses: number[]
  no_retry_statuses: number[]
}

export interface IntegrationConfig {
  name: string
  description?: string
  http_config: HttpRequestConfig
  auth_config?: AuthenticationConfig
  retry_config?: RetryConfig
  is_active: boolean
}

export interface ApiExecutionResponse {
  status_code: number
  headers: Record<string, string>
  data: any
  success: boolean
  timestamp: string
  response_size: number
}

// Dashboard types
export interface DashboardStats {
  total_companies: number
  total_employees: number
  total_invoices: number
  monthly_revenue: number
  pending_invoices: number
  active_integrations: number
  ai_classifications: number
  recent_activities: Activity[]
}

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  user?: string
  entity_type?: string
  entity_id?: string
}

// Report types
export interface IncomeReport {
  period: string
  total_revenue: number
  total_invoices: number
  paid_invoices: number
  pending_invoices: number
  by_month: Array<{
    month: string
    revenue: number
    invoices: number
  }>
  by_customer: Array<{
    customer: string
    revenue: number
    invoices: number
  }>
}

export interface PayrollReport {
  period: string
  total_payroll: number
  total_employees: number
  by_department: Array<{
    department: string
    employees: number
    total_salary: number
  }>
  by_month: Array<{
    month: string
    payroll: number
  }>
}

// Form validation types
export interface FormError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: FormError[]
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Filter and sort types
export interface FilterOptions {
  search?: string
  status?: string
  company_id?: number
  department?: string
  date_from?: string
  date_to?: string
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  per_page: number
}