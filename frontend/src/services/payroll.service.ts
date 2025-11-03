import { ApiService } from '@/lib/api-client'
import { 
  Employee, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest,
  SalaryStructure,
  CreateSalaryStructureRequest,
  WorkEntry,
  CreateWorkEntryRequest,
  PayrollReport,
  PaginatedResponse,
  FilterOptions,
  SortOptions,
  PaginationOptions 
} from '@/types'

class PayrollService extends ApiService {
  constructor() {
    super('/api/payroll')
  }

  // Employee methods
  async getEmployees(
    pagination?: PaginationOptions,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<PaginatedResponse<Employee>> {
    const params = {
      ...(pagination && { page: pagination.page, per_page: pagination.per_page }),
      ...(filters && filters),
      ...(sort && { sort_by: sort.field, order: sort.order })
    }
    
    return this.get<PaginatedResponse<Employee>>('/employees', params)
  }

  async getEmployee(id: number): Promise<Employee> {
    return this.get<Employee>(`/employees/${id}`)
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    return this.post<Employee>('/employees', data)
  }

  async updateEmployee(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
    return this.put<Employee>(`/employees/${id}`, data)
  }

  async deleteEmployee(id: number): Promise<void> {
    return this.delete<void>(`/employees/${id}`)
  }

  // Salary Structure methods
  async getSalaryStructures(companyId?: number): Promise<SalaryStructure[]> {
    const params = companyId ? { company_id: companyId } : {}
    return this.get<SalaryStructure[]>('/salary-structures', params)
  }

  async getSalaryStructure(id: number): Promise<SalaryStructure> {
    return this.get<SalaryStructure>(`/salary-structures/${id}`)
  }

  async createSalaryStructure(data: CreateSalaryStructureRequest): Promise<SalaryStructure> {
    return this.post<SalaryStructure>('/salary-structures', data)
  }

  async updateSalaryStructure(id: number, data: Partial<CreateSalaryStructureRequest>): Promise<SalaryStructure> {
    return this.put<SalaryStructure>(`/salary-structures/${id}`, data)
  }

  async deleteSalaryStructure(id: number): Promise<void> {
    return this.delete<void>(`/salary-structures/${id}`)
  }

  // Work Entry methods
  async getWorkEntries(
    employeeId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<WorkEntry[]> {
    const params = {
      ...(employeeId && { employee_id: employeeId }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo })
    }
    return this.get<WorkEntry[]>('/work-entries', params)
  }

  async createWorkEntry(data: CreateWorkEntryRequest): Promise<WorkEntry> {
    return this.post<WorkEntry>('/work-entries', data)
  }

  async updateWorkEntry(id: number, data: Partial<CreateWorkEntryRequest>): Promise<WorkEntry> {
    return this.put<WorkEntry>(`/work-entries/${id}`, data)
  }

  async deleteWorkEntry(id: number): Promise<void> {
    return this.delete<void>(`/work-entries/${id}`)
  }

  // Payroll calculation
  async calculatePayroll(data: {
    company_id: number
    employee_ids?: number[]
    salary_structure_id: number
    period_start: string
    period_end: string
  }) {
    return this.post('/calculate', data)
  }

  // Reports
  async getPayrollReport(
    companyId: number,
    period: string,
    department?: string
  ): Promise<PayrollReport> {
    const params = {
      company_id: companyId,
      period,
      ...(department && { department })
    }
    return this.get<PayrollReport>('/reports/payroll', params)
  }

  // Employee statistics
  async getEmployeeStats(companyId: number) {
    return this.get(`/employees/stats`, { company_id: companyId })
  }
}

export const payrollService = new PayrollService()